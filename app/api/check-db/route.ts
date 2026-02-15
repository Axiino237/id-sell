import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check Users table
        const { data: users, count: userCount, error: usersError } = await supabase
            .from('users')
            .select('id, name, role, whatsapp_number', { count: 'exact' });

        // Check Products table
        const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*');

        // Check storage
        const { data: buckets, error: bucketError } = await supabase
            .storage
            .listBuckets();

        const productsBucket = buckets?.find(b => b.id === 'products' || b.name === 'products');

        return NextResponse.json({
            success: !usersError && !productError,
            database: {
                users: {
                    reachable: !usersError,
                    count: userCount || 0,
                    data: users,
                    error: usersError ? { message: usersError.message, code: usersError.code } : null
                },
                products: {
                    reachable: !productError,
                    count: productData?.length || 0,
                    error: productError ? { message: productError.message, code: productError.code } : null
                }
            },
            storage: {
                bucket_exists: !!productsBucket,
                public: productsBucket?.public,
                all_buckets: buckets?.map(b => ({ id: b.id, name: b.name })),
                error: bucketError ? { message: bucketError.message, code: bucketError.code } : null
            }
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message });
    }
}
