const { createClient } = require('@supabase/supabase-js');

async function applyFix() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing environment variables!');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const sql = `
        drop policy if exists "Sellers can delete own products" on public.products;
        create policy "Sellers can delete own products"
          on public.products for delete
          using (auth.uid() = seller_id);
    `;

    console.log('🔧 Applying RLS fix...');

    // Attempting to execute SQL via the 'exec_sql' RPC function
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('❌ Error applying fix:', error.message);
        console.log('\nPlease run the following SQL manually in your Supabase SQL Editor if the error persists:');
        console.log('---');
        console.log(sql);
        console.log('---');
    } else {
        console.log('✅ RLS fix applied successfully!');
    }
}

applyFix().catch(console.error);
