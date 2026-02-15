import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Query pg_tables to see what actually exists in public schema
        const { data: tables, error: tableError } = await supabase.rpc('get_tables_info');

        // Fallback: Check common tables specifically if RPC doesn't exist
        const checkTables = ['users', 'products', 'announcements', 'categories', 'promotion_requests', 'admin_whatsapp_groups'];
        const results: any = {};

        for (const table of checkTables) {
            const { data, error } = await supabase.from(table).select('*').limit(0);
            results[table] = { exists: !error, error: error?.message };
        }

        return NextResponse.json({
            rpc_tables: tables,
            checked_tables: results
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message });
    }
}
