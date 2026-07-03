import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { confirmSalesOrder, reduceProductStock } from '@/lib/odoo';

export async function POST(req: Request) {
  try {
    const { orderId, odooId } = await req.json();

    if (!orderId || !odooId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Update Supabase status to 'completed'
    // Since we created the policy allowing system updates, this will work.
    const { error: dbError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    if (dbError) {
      console.error('Failed to update Supabase order:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Confirm the Sales Order in Odoo (Just in case webhook never hit it)
    await confirmSalesOrder(odooId);

    // 3. Reduce product stock in Odoo
    await reduceProductStock(odooId);

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Failed to complete order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
