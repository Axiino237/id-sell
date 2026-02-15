"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, LayoutDashboard, LogOut, Home, Gamepad2 } from "lucide-react";
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
                "fixed top-0 left-0 z-[101] w-3/4 max-w-xs h-screen bg-card/50 backdrop-blur-xl border-r border-white/10 p-0 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-white/5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Gamepad2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                            Buyer Panel
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                    <nav className="space-y-1.5">
                        <Link
                            href="/"
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                pathname === "/"
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                            )}
                        >
                            <Home className="h-5 w-5" />
                            Home
                        </Link>
                        <Link
                            href="/products"
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                pathname === "/products"
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                            )}
                        >
                            <ShoppingBag className="h-5 w-5" />
                            Browse
                        </Link>

                        {user && (
                            <Link
                                href={dashboardHref}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    pathname.startsWith("/admin") || pathname.startsWith("/seller")
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                        : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                                )}
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                Dashboard
                            </Link>
                        )}
                    </nav>

                    {!user && (
                        <div className="px-2 pt-4">
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 active:scale-95 transition-all text-center justify-center"
                            >
                                <LogOut className="h-4 w-4 rotate-180" />
                                Login / Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {user && (
                    <div className="p-4 border-t border-white/5 mt-auto">
                        <button
                            onClick={async () => {
                                const { createClient } = await import("@/utils/supabase/client");
                                const supabase = createClient();
                                await supabase.auth.signOut();
                                window.location.href = "/login";
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95 px-3"
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
