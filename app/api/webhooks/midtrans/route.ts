import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We must use the Service Role Key here to bypass Row Level Security (RLS)
// because the webhook is called by Midtrans (anonymous), not a logged-in user.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
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

    // Fetch the correct Odoo internal ID from our Supabase DB
    const { data: orderData, error: dbError } = await supabaseAdmin
      .from('orders')
      .select('odoo_order_id')
      .eq('odoo_order_number', orderId)
      .single();

    if (dbError || !orderData) {
      console.error(`Order not found in DB for Midtrans order_id: ${orderId}`);
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const odooId = orderData.odoo_order_id;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        // TODO: set transaction status on your database to 'challenge'
      } else if (fraudStatus === 'accept') {
        await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('odoo_order_id', odooId);
        await confirmSalesOrder(odooId);
        await reduceProductStock(odooId);
      }
    } else if (transactionStatus === 'settlement') {
      await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('odoo_order_id', odooId);
      await confirmSalesOrder(odooId);
      await reduceProductStock(odooId);
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      await supabaseAdmin.from('orders').update({ status: 'failed' }).eq('odoo_order_id', odooId);
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
