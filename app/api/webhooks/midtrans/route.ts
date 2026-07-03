import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { coreApi } from '@/lib/midtrans';
import { confirmSalesOrder, reduceProductStock } from '@/lib/odoo';

export async function POST(req: Request) {
  try {
    const notification = await req.json();

    // Verify the notification using Midtrans Core API
    const statusResponse = await coreApi.transaction.notification(notification);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // We expect order_id to be something like "SO-45" or "SO0012"
    // We need the numeric ID for Odoo. E.g. "SO-45" -> 45
    let odooId = 0;
    const match = orderId.match(/\d+/);
    if (match) {
      odooId = parseInt(match[0], 10);
    }

    if (odooId === 0) {
      console.error(`Invalid Order ID format from Midtrans: ${orderId}`);
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        // TODO: set transaction status on your database to 'challenge'
      } else if (fraudStatus === 'accept') {
        await supabase.from('orders').update({ status: 'paid' }).eq('odoo_order_id', odooId);
        await confirmSalesOrder(odooId);
        await reduceProductStock(odooId);
      }
    } else if (transactionStatus === 'settlement') {
      await supabase.from('orders').update({ status: 'paid' }).eq('odoo_order_id', odooId);
      await confirmSalesOrder(odooId);
      await reduceProductStock(odooId);
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      await supabase.from('orders').update({ status: 'failed' }).eq('odoo_order_id', odooId);
    } else if (transactionStatus === 'pending') {
      // already pending
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
