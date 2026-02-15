const { createClient } = require('@supabase/supabase-js');

// Hardcoded for this one-time setup to avoid dependency issues with dotenv
const supabaseUrl = 'https://dnkhbbapqqksogokuzkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRua2hiYmFwcXFrc29nb2t1emtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY1MTY3NiwiZXhwIjoyMDg2MjI3Njc2fQ.zV-4qvgV_gTx6ZbBEtM-lsdrVpIyNpaiUl4oFMqn0xA';

async function createAdmin() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const email = 'admin@anty.com';
    const password = 'AdminPassword123!';

    console.log(`Creating/Updating admin: ${email}...`);

    try {
        // Create user
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: { role: 'admin' },
            email_confirm: true
        });

        if (createError && createError.message !== 'User already registered') {
            throw createError;
        }

        const userId = user ? user.id : (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email).id;

        // Ensure role is admin in Auth
        await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { role: 'admin' }
        });

        // Sync to public.users
        const { error: dbError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                name: 'System Admin',
                role: 'admin'
            });

        if (dbError) throw dbError;

        console.log('\n✅ Admin account ready!');
        console.log('---------------------------');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('---------------------------');
        console.log('\nYou can now log in at http://localhost:3002/login');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

createAdmin();
