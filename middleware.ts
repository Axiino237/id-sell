import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    // Update session first (refresh tokens)
    console.log("Middleware: updating session");
    const response = await updateSession(request)
    console.log("Middleware: session updated, response status:", response.status);

    // Create a client to check auth status
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase URL or Key is missing in root middleware. Check your .env.local file. Using dummy values.');
        supabaseUrl = 'https://example.com';
        supabaseKey = 'dummy-key';
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    let role = user?.user_metadata?.role
    let status = 'active'

    // Fetch role and status from DB if needed
    // We check on most paths to ensure deactivated users are blocked everywhere
    const isPublicAsset = path.startsWith('/_next') ||
        path.startsWith('/favicon.ico') ||
        path.match(/\.(svg|png|jpg|jpeg|gif|webp)$/);

    if (user && !isPublicAsset && path !== '/deactivated') {
        const { data: userData } = await supabase
            .from('users')
            .select('role, status')
            .eq('id', user.id)
            .single()
        role = userData?.role || role
        status = userData?.status || 'active'
    }

    // Block deactivated users
    if (user && (status === 'inactive' || status === 'soft_deleted')) {
        // Allow access to /deactivated and public auth APIs
        if (path !== '/deactivated' && !path.startsWith('/api/auth')) {
            console.log("Middleware: Redirecting deactivated user to /deactivated");
            return NextResponse.redirect(new URL('/deactivated', request.url))
        }
    }

    // Protected Routes Logic
    if (path.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/seller', request.url))
        }
    }

    if (path.startsWith('/seller')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    // Redirect logged in users away from login page
    if (path === '/login' && user) {
        if (role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url))
        } else if (role === 'seller') {
            return NextResponse.redirect(new URL('/seller', request.url))
        } else {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
