import { createClient } from "@/utils/supabase/server";
import { Plus, Edit, Trash2, Eye, ShoppingBag, Sparkles, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import DeleteConfirmForm from "@/components/seller/DeleteConfirmForm";

export default async function SellerProductsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch products with their promotion request status
    const { data: products } = await supabase
        .from("products")
        .select(`
            *,
            promotion_requests (id, status)
        `)
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false });

    async function deleteProduct(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Delete only if owned by current user
        await supabase
            .from("products")
            .delete()
            .eq("id", id)
            .eq("seller_id", user.id);

        revalidatePath("/seller/products");
    }

    async function requestPromotion(formData: FormData) {
        "use server";
        const productId = formData.get("productId") as string;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Create promotion request
        await supabase.from("promotion_requests").insert({
            product_id: productId,
            seller_id: user.id,
            status: "pending"
        });

        revalidatePath("/seller/products");
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">My Products</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your product listings.
                    </p>
                </div>
                <Link href="/seller/products/new" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20">
                    <Plus className="h-5 w-5" />
                    Add Product
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products?.map((product) => (
                    <div key={product.id} className="glass-card rounded-xl overflow-hidden group">
                        <div className="relative aspect-video bg-secondary/50">
                            {product.images && product.images[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.title}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium shadow-sm backdrop-blur-md ${product.is_active
                                    ? 'bg-emerald-500/80 text-white'
                                    : 'bg-gray-500/80 text-white'
                                    }`}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {product.is_promoted && (
                                    <span className="px-2 py-1 rounded-md text-xs font-medium shadow-sm backdrop-blur-md bg-amber-500/80 text-white flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" /> Featured
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-white truncate">{product.title}</h3>
                            <p className="text-emerald-400 font-bold mt-1">${product.price}</p>

                            {/* Promotion Status */}
                            {product.promotion_requests && product.promotion_requests.length > 0 && (
                                <div className="mt-2">
                                    {product.promotion_requests[0].status === 'pending' && (
                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            <Clock className="h-3 w-3" /> Promotion Pending
                                        </span>
                                    )}
                                    {product.promotion_requests[0].status === 'approved' && (
                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <Sparkles className="h-3 w-3" /> Promoted
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                                <Link href={`/product/${product.id}`} className="text-muted-foreground hover:text-white transition-colors" title="View Public Page">
                                    <Eye className="h-4 w-4" />
                                </Link>
                                <div className="flex gap-2">
                                    <Link href={`/seller/products/edit/${product.id}`} className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-blue-400 transition-colors" title="Edit">
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                    <DeleteConfirmForm action={deleteProduct} productId={product.id}>
                                        <button type="submit" className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </DeleteConfirmForm>
                                </div>
                            </div>

                            {/* Request Promotion Button */}
                            {!product.is_promoted && (!product.promotion_requests || product.promotion_requests.length === 0 || product.promotion_requests[0].status === 'rejected') && (
                                <form action={requestPromotion} className="mt-3">
                                    <input type="hidden" name="productId" value={product.id} />
                                    <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-500/20">
                                        <Sparkles className="h-4 w-4" />
                                        Request Promotion
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ))}

                {(!products || products.length === 0) && (
                    <div className="col-span-full py-16 text-center glass-card rounded-xl">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-white">No products yet</h3>
                        <p className="text-muted-foreground mt-1 mb-6">Start selling by adding your first product.</p>
                        <Link href="/seller/products/new" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition-colors">
                            <Plus className="h-5 w-5" />
                            Add Product
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
