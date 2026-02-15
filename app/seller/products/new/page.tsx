import { createClient } from "@/utils/supabase/server";
import { ProductForm } from "@/components/seller/ProductForm";
import { redirect } from "next/navigation";

export default async function AddProductPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login"); // Or handle unobtrusively
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Add Product</h1>
                <p className="text-muted-foreground mt-2">
                    Create a new listing for the marketplace.
                </p>
            </div>

            <div className="glass-card rounded-xl p-8">
                <ProductForm userId={user.id} />
            </div>
        </div>
    );
}
