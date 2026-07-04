import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { createSalesOrder } from '@/lib/odoo';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, user, address } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    
    if (!user || !address) {
      return NextResponse.json({ error: 'User or address is missing' }, { status: 400 });
    }

    // 1. Create Sales Order in Odoo (Draft state)
    const odooOrder = await createSalesOrder(items, user, address);

    // 2. Prepare Item Details for Midtrans
    const itemDetails = items.map((item: any) => ({
      id: item.variant.id || item.product.id,
      price: Math.round(item.variant.price),
      quantity: item.quantity,
      name: item.product.name.substring(0, 50) // Midtrans limits item name length
    }));

    // Midtrans gross_amount MUST perfectly equal sum of itemDetails
    const grossAmount = itemDetails.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);

    // Sanitize user inputs for Midtrans
    // Phone: only digits, length 5-15. Default to valid string if too short.
    let cleanPhone = (address.phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 5) cleanPhone = '08111111111';
    cleanPhone = cleanPhone.substring(0, 15);

    // Postal code: alphanumeric, max 10 chars. Let's strictly use digits for safety in testing.
    let cleanPostal = (address.postalCode || '').replace(/\D/g, '');
    if (!cleanPostal) cleanPostal = '12345';
    cleanPostal = cleanPostal.substring(0, 10);

    // 3. Prepare parameters for Midtrans Snap API
    const parameters = {
      transaction_details: {
        order_id: odooOrder.orderNumber, // e.g. SO-123 or SO0012
        gross_amount: grossAmount
      },
      item_details: itemDetails,
      customer_details: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: cleanPhone,
        billing_address: {
          first_name: address.firstName,
          last_name: address.lastName,
          email: user.email,
          phone: cleanPhone,
          address: address.addressLine1.substring(0, 200),
          city: address.city.substring(0, 50),
          postal_code: cleanPostal,
          country_code: 'IDN'
        },
        shipping_address: {
          first_name: address.firstName,
          last_name: address.lastName,
          email: user.email,
          phone: cleanPhone,
          address: address.addressLine1.substring(0, 200),
          city: address.city.substring(0, 50),
          postal_code: cleanPostal,
          country_code: 'IDN'
        }
      },
      callbacks: {
        finish: `${req.headers.get('origin') || 'https://d-commerce-amber.vercel.app'}/checkout/success`
      }
    };

    // 4. Create Transaction Token from Midtrans
    const transaction = await snap.createTransaction(parameters);
    
    // 5. Save order to Supabase
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const { error: dbError } = await supabase.from('orders').insert({
        user_id: user.id,
        odoo_order_id: odooOrder.orderId,
        odoo_order_number: odooOrder.orderNumber,
        total_amount: grossAmount,
        status: 'pending',
        midtrans_token: transaction.token,
        midtrans_redirect_url: transaction.redirect_url,
        items: items
      });

      if (dbError) {
        console.error('Failed to save order to Supabase:', dbError);
      }
    }
    
    return NextResponse.json({ 
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderNumber: odooOrder.orderNumber,
      odooOrderId: odooOrder.orderId
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
