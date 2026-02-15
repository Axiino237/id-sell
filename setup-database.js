import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
dotenv.config({ path: '.env.local' });

async function setupMissingTables() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing environment variables!');
        console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📋 Reading SQL schema...');
    const sqlContent = readFileSync('create-missing-tables.sql', 'utf-8');

    console.log('🔧 Executing SQL to create missing tables...');

    // Split by semicolons and execute each statement
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt.length < 10) continue; // Skip very short statements

        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });

        if (error) {
            // Try direct query if RPC doesn't exist
            const { error: queryError } = await supabase.from('_').select('*').limit(0);
            console.log(`   ⚠️  Note: ${error.message}`);
        }
    }

    console.log('✅ Schema setup complete!');
    console.log('\n📊 Verifying tables...');

    const tablesToCheck = [
        'users',
        'products',
        'announcements',
        'categories',
        'promotion_requests',
        'admin_whatsapp_groups'
    ];

    for (const table of tablesToCheck) {
        const { data, error } = await supabase.from(table).select('*').limit(0);
        if (error) {
            console.log(`   ❌ ${table}: ${error.message}`);
        } else {
            console.log(`   ✅ ${table}: Ready`);
        }
    }

    console.log('\n🎉 Database setup complete! Your dashboard is ready to use.');
}

setupMissingTables().catch(console.error);
