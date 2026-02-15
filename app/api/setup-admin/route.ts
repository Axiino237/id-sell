import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({
            error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.',
            instruction: 'Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file. You can find this in your Supabase project settings -> API.'
        }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // 1. Create Admin User
        const email = 'admin@antygravity.com';
        const password = 'admin123';

        // Check if user exists
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) throw listError;

        const existingUser = users.users.find(u => u.email === email);
        let userId;

        if (existingUser) {
            userId = existingUser.id;
            // Update password if needed
            await supabase.auth.admin.updateUserById(userId, { password, user_metadata: { role: 'admin' } });
            console.log('Admin user updated');
        } else {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                user_metadata: { role: 'admin' },
                email_confirm: true
            });
            if (createError) throw createError;
            userId = newUser.user.id;
            console.log('Admin user created');
        }

        // 1b. Sync to public.users table
        const { error: syncError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                name: 'Admin',
                role: 'admin'
            });

        if (syncError) {
            console.error('Error syncing to public.users:', syncError);
        } else {
            console.log('Admin user synced to public.users');
        }

        // 2. Create or Update Storage Bucket
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (!bucketsError) {
            const productBucket = buckets.find(b => b.name === 'products');
            if (!productBucket) {
                const { error: createBucketError } = await supabase.storage.createBucket('products', { public: true });
                if (createBucketError) {
                    console.error('Error creating bucket:', createBucketError);
                } else {
                    console.log('Products bucket created');
                }
            } else {
                console.log('Products bucket already exists. Ensuring it is public...');
                const { error: updateBucketError } = await supabase.storage.updateBucket('products', { public: true });
                if (updateBucketError) {
                    console.error('Error updating bucket to public:', updateBucketError);
                } else {
                    console.log('Products bucket updated to public');
                }
            }
        }

        return NextResponse.json({
            message: 'Admin setup completed successfully.',
            user: { email, password, role: 'admin' },
            instructions: 'You can now log in at /login with these credentials.'
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            details: error
        }, { status: 500 });
    }
}
