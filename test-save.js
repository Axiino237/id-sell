import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testSave() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing env vars');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get a seller ID
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users || users.length === 0) {
        console.error('No users found in public.users table. Sync failed?');
        return;
    }

    const userId = users[0].id;

    // 2. Try to insert a product
    const { data, error } = await supabase
        .from('products')
        .insert({
            title: 'Test Product',
            description: 'This is a test product from the setup verification',
            price: 99.99,
            seller_id: userId,
            images: ['https://example.com/test.png']
        })
        .select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Success! Inserted product:', data);

        // Cleanup
        await supabase.from('products').delete().eq('id', data[0].id);
        console.log('Cleaned up test product');
    }
}

testSave();
