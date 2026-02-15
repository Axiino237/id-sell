import Link from "next/link";
import { ShoppingBag, Menu, Search, X, Gamepad2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { SearchBar } from "./SearchBar";
import { MobileMenu } from "./MobileMenu";

export async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let role = user?.user_metadata?.role;

    // Fallback: If role is not in metadata, fetch from users table
    if (user && !role) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
        role = userData?.role;
    }

    const dashboardHref = role === 'admin' ? '/admin' : role === 'seller' ? '/seller' : '/';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 max-w-7xl">
                <div className="flex items-center gap-4">
                    <MobileMenu user={user} role={role} dashboardHref={dashboardHref} />

                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Gamepad2 className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Games ID Sell
                        </span>
                    </Link>
                </div>

                {/* Search Bar - Desktop */}
                <div className="hidden md:flex flex-1 max-w-md">
                    <SearchBar />
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/products"
                        className="hidden xs:flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/50 transition-colors text-sm"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        <span className="hidden sm:inline">Browse</span>
                    </Link>
                    {user ? (
                        <Link
                            href={dashboardHref}
                            className="px-3 sm:px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors text-sm"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="px-3 sm:px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm shadow-lg shadow-primary/20"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Search Bar - Mobile (only visible on small screens) */}
            <div className="md:hidden border-t border-border/40 px-4 py-2 bg-background/50">
                <SearchBar />
            </div>
        </header>
    );
}
