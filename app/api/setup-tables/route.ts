import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseServiceKey) {
        return NextResponse.json({
            error: 'Missing SUPABASE_SERVICE_ROLE_KEY',
            message: 'Please add your service role key to .env.local'
        }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Read the SQL file
        const sqlPath = join(process.cwd(), 'create-missing-tables.sql');
        const sqlContent = readFileSync(sqlPath, 'utf-8');

        // Execute the SQL (Note: This may not work due to Supabase limitations)
        // You may need to manually execute the SQL in Supabase SQL Editor

        const results = {
            message: 'Attempting to create tables...',
            tables_status: {} as any,
            note: 'If this fails, please manually execute create-missing-tables.sql in Supabase SQL Editor'
        };

        // Check each table
        const tables = ['users', 'products', 'announcements', 'categories', 'promotion_requests', 'admin_whatsapp_groups'];

        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*').limit(0);
            results.tables_status[table] = {
                exists: !error,
                error: error?.message || null
            };
        }

        return NextResponse.json(results);
    } catch (err: any) {
        return NextResponse.json({
            error: err.message,
            solution: 'Please manually execute create-missing-tables.sql in your Supabase SQL Editor'
        }, { status: 500 });
    }
}
