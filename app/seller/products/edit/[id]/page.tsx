import { createClient } from "@/utils/supabase/server";
import { ProductForm } from "@/components/seller/ProductForm";
import { redirect } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (!product) {
        return <div>Product not found</div>;
    }

    if (product.seller_id !== user.id) {
        return <div>Unauthorized</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Edit Product</h1>
                <p className="text-muted-foreground mt-2">
                    Update your product listing.
                </p>
            </div>

            <div className="glass-card rounded-xl p-8">
                <ProductForm userId={user.id} product={product} />
            </div>
        </div>
    );
}
