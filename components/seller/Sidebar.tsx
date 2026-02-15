




"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, PlusCircle, Settings, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/auth/actions";
import { useEffect } from "react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/seller" },
    { icon: ShoppingBag, label: "My Products", href: "/seller/products" },
    { icon: PlusCircle, label: "Add Product", href: "/seller/products/new" },
    { icon: Settings, label: "Settings", href: "/seller/settings" },
];

interface SellerSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function SellerSidebar({ isOpen, onClose }: SellerSidebarProps) {
    const pathname = usePathname();

    // Close sidebar when route changes
    useEffect(() => {
        if (onClose) onClose();
    }, [pathname]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col px-3 py-4">
                    <div className="mb-10 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <span className="font-bold text-emerald-500 text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                                Seller Panel
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/50 transition-colors lg:hidden"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                            : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto border-t border-border pt-4">
                        <form action={signOut}>
                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive">
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </aside>
        </>
    );
}
