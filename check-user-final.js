import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkUser() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing env vars');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get user by email (using admin api)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const targetUser = users.find(u => u.email === 'aravinthvijay127@gmail.com');
    if (!targetUser) {
        console.log('User aravinthvijay127@gmail.com not found in auth.');
        return;
    }

    console.log('Auth user found:', targetUser.id);

    // 2. Check public.users
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUser.id)
        .single();

    if (profileError) {
        console.error('Profile not found or error:', profileError.message);
    } else {
        console.log('Public profile:', profile);
    }

    // 3. Check products
    const { data: productData } = await supabase
        .from('products')
        .select('*, users:seller_id(whatsapp_number)')
        .limit(1);

    console.log('Sample product with seller info:', productData);
}

checkUser();
