import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/odoo';

export async function GET() {
  try {
    const products = await getProducts();
    
    return NextResponse.json({
      success: true,
      count: products.length,
      message: 'Berhasil terhubung ke Odoo dan mengambil data produk!',
      data: products
    });
  } catch (error: any) {
    console.error('Odoo Test Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Gagal terhubung ke Odoo. Silakan periksa kredensial di .env',
      error: error.message
    }, { status: 500 });
  }
}
