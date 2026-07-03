import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Lakukan query sederhana ke tabel apapun (misal 'orders') untuk memancing aktivitas database.
    // Kita hanya mengambil 1 baris agar tidak membebani performa.
    const { data, error } = await supabase.from('orders').select('id').limit(1);

    if (error) {
      console.error('Keepalive ping error:', error);
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Supabase database is successfully pinged and kept awake!',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
