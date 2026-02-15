import { createClient } from "@/utils/supabase/server";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function AdminProductsPage() {
    const supabase = await createClient();

    // Fetch all products with seller info
    const { data: products } = await supabase
        .from("products")
        .select(`
            *,
            users:seller_id (name, whatsapp_number)
        `)
        .order("created_at", { ascending: false });

    async function togglePromotion(formData: FormData) {
        "use server";
        const productId = formData.get("productId") as string;
        const currentStatus = formData.get("currentStatus") === "true";
        const supabase = await createClient();

        // Toggle promotion status
        await supabase
            .from("products")
            .update({ is_promoted: !currentStatus })
            .eq("id", productId);

        revalidatePath("/admin/products");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">All Products</h1>
                <p className="text-muted-foreground mt-2">
                    View and manage all marketplace products.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products?.map((product) => (
                    <div key={product.id} className="glass-card rounded-xl overflow-hidden group">
                        <div className="relative aspect-video bg-secondary/50">
                            {product.images && product.images[0] ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium shadow-sm backdrop-blur-md ${product.is_active
                                        ? 'bg-emerald-500/80 text-white'
                                        : 'bg-gray-500/80 text-white'
                                    }`}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-white truncate">{product.title}</h3>
                            <p className="text-emerald-400 font-bold mt-1">${product.price}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                by {product.users?.name || 'Unknown'}
                            </p>

                            {/* Promotion Toggle */}
                            <form action={togglePromotion} className="mt-3">
                                <input type="hidden" name="productId" value={product.id} />
                                <input type="hidden" name="currentStatus" value={product.is_promoted ? "true" : "false"} />
                                <button
                                    type="submit"
                                    className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${product.is_promoted
                                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30'
                                            : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50 border-border'
                                        }`}
                                >
                                    {product.is_promoted ? (
                                        <>
                                            <X className="h-4 w-4" />
                                            Remove Promotion
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Promote Product
                                        </>
                                    )}
                                </button>
                            </form>

                            <Link
                                href={`/product/${product.id}`}
                                className="block mt-2 text-center text-xs text-muted-foreground hover:text-white transition-colors"
                            >
                                View Details →
                            </Link>
                        </div>
                    </div>
                ))}

                {(!products || products.length === 0) && (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
}
