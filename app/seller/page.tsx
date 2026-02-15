import { createClient } from "@/utils/supabase/server";
import { ShoppingBag, Eye, Star, Plus, Package } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function SellerDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch real metrics for this seller
    const [
        { count: totalProducts },
        { count: activeListings },
        { count: promotedItems },
        { data: recentProducts }
    ] = await Promise.all([
        supabase.from("products").select("*", { count: 'exact', head: true }).eq("seller_id", user.id),
        supabase.from("products").select("*", { count: 'exact', head: true }).eq("seller_id", user.id).eq("is_active", true),
        supabase.from("products").select("*", { count: 'exact', head: true }).eq("seller_id", user.id).eq("is_promoted", true),
        supabase.from("products")
            .select("*")
            .eq("seller_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5)
    ]);

    const stats = [
        { label: "My Products", value: totalProducts?.toString() || "0", icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Active Listings", value: activeListings?.toString() || "0", icon: Eye, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Promoted Items", value: promotedItems?.toString() || "0", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Seller Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back! Here&apos;s how your products are performing.
                    </p>
                </div>
                <Link href="/seller/products/new" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20">
                    <Plus className="h-5 w-5" />
                    Add Product
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="glass-card rounded-xl p-6 hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bg}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Recent Listings</h2>
                        <Link href="/seller/products" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                            View All
                        </Link>
                    </div>

                    {recentProducts && recentProducts.length > 0 ? (
                        <div className="space-y-4">
                            {recentProducts.map((product) => (
                                <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20 border border-border/50">
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border">
                                        {product.images?.[0] ? (
                                            <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{product.title}</p>
                                        <p className="text-sm text-emerald-400">${product.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${product.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                            }`}>
                                            {product.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <ShoppingBag className="h-8 w-8 mb-2 opacity-20" />
                            <p>No products yet</p>
                            <Link href="/seller/products/new" className="text-emerald-400 hover:underline text-sm mt-1">
                                Create your first listing
                            </Link>
                        </div>
                    )}
                </div>

                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Link href="/seller/products/new" className="block p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors text-center group">
                            <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Plus className="h-5 w-5 text-emerald-400" />
                            </div>
                            <span className="font-medium text-white">New Listing</span>
                        </Link>
                        <Link href="/seller/settings" className="block p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors text-center group">
                            <div className="mx-auto w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="font-medium text-white">Manage Store</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
