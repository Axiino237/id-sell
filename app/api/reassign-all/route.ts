import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // 1. Get the current active user (assuming the user is logged in and we know their email)
        const { data: { users } } = await supabase.auth.admin.listUsers();
        // The user who has been interacting is likely aravinthvijay127@gmail.com
        const targetUser = users.find(u => u.email?.includes('aravinth'));

        if (!targetUser) {
            return NextResponse.json({ error: 'Target user not found' });
        }

        // 2. Reassign all products to this user
        const { data: updated, error } = await supabase
            .from('products')
            .update({ seller_id: targetUser.id })
            .neq('seller_id', targetUser.id)
            .select();

        // 3. Ensure the user record has the name from auth
        await supabase
            .from('users')
            .upsert({
                id: targetUser.id,
                name: targetUser.user_metadata?.name || targetUser.email?.split('@')[0] || "Seller",
                role: 'seller'
            });

        return NextResponse.json({
            success: true,
            message: `Reassigned ${updated?.length || 0} products to ${targetUser.email}`,
            userId: targetUser.id
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message });
    }
}
