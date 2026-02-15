import { Navbar } from "@/components/shared/Navbar";
import { ProductCard } from "@/components/shared/ProductCard";
import { AdUnit } from "@/components/shared/AdUnit";
import { createClient } from "@/utils/supabase/server";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  console.log("Home page: Initializing Supabase client");
  const supabase = await createClient();

  console.log("Home page: Fetching promoted products");

  // Fetch Promoted Products
  // Fetch Promoted Products
  let promotedProducts = [];
  try {
    const { data } = await supabase
      .from("products")
      .select("*, users:seller_id(name, whatsapp_number)")
      .eq("is_active", true)
      .eq("is_promoted", true)
      .order("created_at", { ascending: false })
      .limit(4);
    promotedProducts = data || [];
  } catch (error) {
    console.error("Error fetching promoted products:", error);
  }

  // Fetch Regular Products
  // Fetch Regular Products
  let recentProducts = [];
  try {
    const { data } = await supabase
      .from("products")
      .select("*, users:seller_id(name, whatsapp_number)")
      .eq("is_active", true)
      .eq("is_promoted", false)
      .order("created_at", { ascending: false })
      .limit(12);
    recentProducts = data || [];
  } catch (error) {
    console.error("Error fetching recent products:", error);
  }

  // Fetch Announcement
  // Fetch Announcement
  let announcement = null;
  try {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    announcement = data;
  } catch (error) {
    console.error("Error fetching announcement:", error);
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 max-w-6xl space-y-12 py-8">

        {/* Announcement Bar */}
        {announcement && (
          <div className="rounded-lg bg-gradient-to-r from-primary/20 to-blue-500/20 p-4 border border-primary/20 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="font-medium text-white">{announcement.title}: <span className="text-muted-foreground font-normal">{announcement.content}</span></p>
            </div>
          </div>
        )}

        {/* Hero / Promoted Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-bold text-white">Featured Deals</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {promotedProducts?.map(product => (
              <ProductCard key={product.id} product={product} priority />
            ))}
            {(!promotedProducts || promotedProducts.length === 0) && (
              <div className="col-span-full h-32 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground">
                No promoted items yet. Be the first!
              </div>
            )}
          </div>
        </section>

        {/* Ad Space */}
        <div className="w-full">
          <AdUnit slotId="home-banner-1" className="h-[120px]" />
        </div>

        {/* Recent Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Fresh Finds</h2>
            <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {recentProducts?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {(!recentProducts || recentProducts.length === 0) && (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">No products found. Check back later!</p>
            </div>
          )}
        </section>

        {/* Bottom Ad Space */}
        <div>
          <AdUnit slotId="home-banner-2" className="h-[250px]" />
        </div>

      </main>

      <footer className="border-t border-border py-12 bg-card/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 AntyGravity. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
