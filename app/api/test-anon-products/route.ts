import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: products, error } = await supabase
        .from('products')
        .select('*, users:seller_id(name, whatsapp_number)')
        .eq('is_active', true);

    return NextResponse.json({ products, error });
}
