import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const { data: products } = await supabase
            .from("products")
            .select("title, is_active, is_promoted, users:seller_id(name, whatsapp_number)")
            .eq("is_active", true)
            .limit(5);

        return NextResponse.json({ products });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message });
    }
}
