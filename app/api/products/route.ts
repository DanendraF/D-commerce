import { NextResponse } from 'next/server';
import { getProducts, getProductBySlug } from '@/lib/odoo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product);
    }

    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('API /products Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
