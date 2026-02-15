"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { UserX, LogOut, Mail } from "lucide-react";

export default function DeactivatedPage() {
    const supabase = createClient();
    const router = useRouter();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="glass-card max-w-md rounded-2xl p-8 shadow-2xl border border-rose-500/20">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                    <UserX className="h-10 w-10" />
                </div>

                <h1 className="mb-4 text-3xl font-bold text-white">Account Deactivated</h1>

                <p className="mb-8 text-muted-foreground">
                    Your account has been suspended or deactivated by an administrator.
                    If you believe this is a mistake, please contact our support team.
                </p>

                <div className="space-y-4">
                    <a
                        href="mailto:support@antygravity.com"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 font-semibold text-white hover:bg-secondary/80 transition-colors"
                    >
                        <Mail className="h-5 w-5" />
                        Contact Support
                    </a>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-transparent border border-border px-4 py-3 font-semibold text-muted-foreground hover:bg-muted/5 hover:text-white transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        Log Out
                    </button>
                </div>
            </div>

            <p className="mt-8 text-xs text-muted-foreground/50">
                &copy; 2026 AntyGravity. All rights reserved.
            </p>
        </div>
    );
}
