import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") || "/";

    if (code) {
        const supabase = await createClient();
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && session?.user) {
            const role = session.user.user_metadata?.role;
            if (role === 'admin') {
                return NextResponse.redirect(new URL('/admin', request.url));
            } else if (role === 'seller') {
                return NextResponse.redirect(new URL('/seller', request.url));
            } else {
                return NextResponse.redirect(new URL(next, request.url));
            }
        }
    }

    // Default fallback
    return NextResponse.redirect(new URL(next, request.url));
}
