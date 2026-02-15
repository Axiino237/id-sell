import { createClient } from "@/utils/supabase/server";
import { Users, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch real metrics
    const [
        { count: totalUsers },
        { count: totalProducts },
        { count: totalPromoted },
        { count: pendingPromotions },
        { data: recentUsers },
        { data: recentPromotions }
    ] = await Promise.all([
        supabase.from("users").select("*", { count: 'exact', head: true }),
        supabase.from("products").select("*", { count: 'exact', head: true }),
        supabase.from("products").select("*", { count: 'exact', head: true }).eq("is_promoted", true),
        supabase.from("promotion_requests").select("*", { count: 'exact', head: true }).eq("status", "pending"),
        supabase.from("users").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("promotion_requests")
            .select("*, products(title), users:seller_id(name)")
            .order("created_at", { ascending: false })
            .limit(5)
    ]);

    const stats = [
        {
            title: "Total Users",
            value: totalUsers?.toString() || "0",
            change: "Live",
            icon: Users,
            trend: "up",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Total Products",
            value: totalProducts?.toString() || "0",
            change: "Live",
            icon: ShoppingBag,
            trend: "up",
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        },
        {
            title: "Promoted Items",
            value: totalPromoted?.toString() || "0",
            change: "Active",
            icon: TrendingUp,
            trend: "up",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            title: "Pending Promotions",
            value: pendingPromotions?.toString() || "0",
            change: "Action Required",
            icon: DollarSign,
            trend: pendingPromotions && pendingPromotions > 0 ? "down" : "up",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Overview of your marketplace performance.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="glass-card rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`rounded-full p-3 ${stat.bg}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </h3>
                                <p className="mt-1 text-2xl font-bold text-white">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Users</h2>
                    {recentUsers && recentUsers.length > 0 ? (
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/50">
                                    <div>
                                        <p className="font-medium text-white">{user.name || "Anonymous"}</p>
                                        <p className="text-xs text-muted-foreground">{user.role}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                            No users yet
                        </div>
                    )}
                </div>
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Promotion Requests</h2>
                    {recentPromotions && recentPromotions.length > 0 ? (
                        <div className="space-y-4">
                            {recentPromotions.map((req: any) => (
                                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/50">
                                    <div>
                                        <p className="font-medium text-white">{req.products?.title || "Unknown Product"}</p>
                                        <p className="text-xs text-muted-foreground">by {req.users?.name || "Seller"}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                            req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                                                'bg-amber-500/10 text-amber-400'
                                        }`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                            No promotions yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
