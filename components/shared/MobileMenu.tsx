"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, LayoutDashboard, LogOut, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
    user: any;
    role: string | null;
    dashboardHref: string;
}

export function MobileMenu({ user, role, dashboardHref }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/50 transition-colors"
                aria-label="Open menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Menu Content */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-[101] w-3/4 max-w-xs bg-[#0f172a] border-r border-border p-0 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-slate-900/50 border-b border-border/50">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span className="font-bold text-primary text-xl">A</span>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">AntyGravity</span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2.5 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        aria-label="Close menu"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 bg-[#0f172a]">
                    <div className="space-y-2">
                        <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</h4>
                        <nav className="space-y-1.5">
                            <Link
                                href="/"
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium transition-all active:scale-95",
                                    pathname === "/"
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Home className="h-5 w-5" />
                                Home
                            </Link>
                            <Link
                                href="/products"
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium transition-all active:scale-95",
                                    pathname === "/products"
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                <ShoppingBag className="h-5 w-5" />
                                Browse
                            </Link>

                            {user && (
                                <Link
                                    href={dashboardHref}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium transition-all active:scale-95",
                                        pathname.startsWith("/admin") || pathname.startsWith("/seller")
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    Dashboard
                                </Link>
                            )}
                        </nav>
                    </div>

                    {!user && (
                        <div className="px-2">
                            <Link
                                href="/login"
                                className="flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-primary to-violet-600 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all text-center justify-center animate-in slide-in-from-bottom-2 duration-500"
                            >
                                Login / Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {user && (
                    <div className="p-6 border-t border-border/50 bg-slate-900/50">
                        <button
                            onClick={async () => {
                                const { createClient } = await import("@/utils/supabase/client");
                                const supabase = createClient();
                                await supabase.auth.signOut();
                                window.location.href = "/login";
                            }}
                            className="flex w-full items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-lg font-medium text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95 border border-rose-500/20"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
