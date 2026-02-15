"use client";

import { createClient } from "@/utils/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                let role = user.user_metadata?.role;

                if (!role) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('role, status')
                        .eq('id', user.id)
                        .single();
                    role = userData?.role;
                    if (userData?.status === 'inactive' || userData?.status === 'soft_deleted') {
                        router.push('/deactivated');
                        return;
                    }
                }

                if (role === 'admin') {
                    router.push('/admin');
                } else if (role === 'seller') {
                    router.push('/seller');
                } else {
                    router.push('/');
                }
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const user = session.user;
                    let role = user.user_metadata?.role;

                    if (!role) {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('role, status')
                            .eq('id', user.id)
                            .single();
                        role = userData?.role;
                        if (userData?.status === 'inactive' || userData?.status === 'soft_deleted') {
                            router.push('/deactivated');
                            return;
                        }
                    }

                    if (role === 'admin') {
                        router.push('/admin');
                    } else if (role === 'seller') {
                        router.push('/seller');
                    } else {
                        router.push('/');
                    }
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-10 shadow-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to your account to continue
                    </p>
                </div>

                <div className="mt-8">
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#8b5cf6',
                                        brandAccent: '#7c3aed',
                                    }
                                }
                            }
                        }}
                        theme="dark"
                        providers={[]}
                        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                        showLinks={true}
                    />
                </div>
            </div>
        </div>
    );
}
