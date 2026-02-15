import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Log the users and their associations
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*');

        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        return NextResponse.json({
            database_users: users,
            auth_users: authUsers?.users.map(u => ({ id: u.id, email: u.email })),
            errors: { userError, authError }
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message });
    }
}
