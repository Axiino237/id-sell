const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function promoteToAdmin(email) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing environment variables in .env.local');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Find user in auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error(`❌ User with email ${email} not found. Please sign up first.`);
        return;
    }

    console.log(`Found user: ${user.id}`);

    // 2. Update auth metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, role: 'admin' } }
    );

    if (authError) {
        console.error('Error updating auth metadata:', authError);
    } else {
        console.log('✅ Auth metadata updated to admin.');
    }

    // 3. Update public.users table
    const { error: dbError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', user.id);

    if (dbError) {
        console.error('Error updating public.users table:', dbError);
    } else {
        console.log('✅ Public users table updated to admin.');
    }

    console.log(`\n🎉 Success! ${email} is now an Admin. Please log out and log back in.`);
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node promote-admin.js <email>');
} else {
    promoteToAdmin(email);
}
