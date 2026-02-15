import { Navbar } from "@/components/shared/Navbar";
import { ProductCard } from "@/components/shared/ProductCard";
import { FilterSidebar } from "@/components/shared/FilterSidebar";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { AdUnit } from "@/components/shared/AdUnit";
import { createClient } from "@/utils/supabase/server";
import { Search } from "lucide-react";
import { notFound } from "next/navigation";

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string }>;
}) {
    const { slug } = await params;
    const { sort, minPrice, maxPrice } = await searchParams;
    const supabase = await createClient();

    // Fetch the category by slug
    const { data: category } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    // If category doesn't exist, show 404
    if (!category) {
        notFound();
    }

    // Fetch all categories for filter sidebar
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

    // Build query for products in this category
    let query = supabase
        .from("products")
        .select("*, users:seller_id(name, whatsapp_number), categories(name, slug)")
        .eq("is_active", true)
        .eq("category_id", category.id);

    // Apply price range filter
    if (minPrice) {
        query = query.gte("price", parseFloat(minPrice));
    }
    if (maxPrice) {
        query = query.lte("price", parseFloat(maxPrice));
    }

    // Apply sorting
    const sortBy = sort || "newest";
    switch (sortBy) {
        case "newest":
            query = query.order("created_at", { ascending: false });
            break;
        case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
        case "price-low":
            query = query.order("price", { ascending: true });
            break;
        case "price-high":
            query = query.order("price", { ascending: false });
            break;
        case "name-az":
            query = query.order("title", { ascending: true });
            break;
        case "name-za":
            query = query.order("title", { ascending: false });
            break;
        default:
            query = query.order("created_at", { ascending: false });
    }

    const { data: products } = await query;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />

            <main className="container mx-auto px-4 max-w-7xl space-y-8 py-8">
                {/* Breadcrumbs */}
                <Breadcrumb
                    items={[
                        { label: "Products", href: "/products" },
                        { label: category.name }
                    ]}
                />

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        {category.name}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {products?.length || 0} products found
                    </p>
                </div>

                {/* Ad Space */}
                <AdUnit slotId="listing-top" className="h-[90px]" />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filter Sidebar */}
                    <aside className="lg:col-span-1">
                        <FilterSidebar categories={categories || []} />
                    </aside>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products?.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {(!products || products.length === 0) && (
                            <div className="py-20 text-center space-y-4">
                                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                                <div>
                                    <h3 className="text-lg font-medium text-white">No products found</h3>
                                    <p className="text-muted-foreground mt-1">
                                        No products in this category yet
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Ad Space */}
                <AdUnit slotId="listing-bottom" className="h-[250px]" />
            </main>
        </div>
    );
}
