"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveProductAction(productData: any, productId?: string) {
    const supabase = await createClient();

    let result;
    try {
        if (productId) {
            result = await supabase
                .from("products")
                .update(productData)
                .eq("id", productId);
        } else {
            result = await supabase
                .from("products")
                .insert(productData);
        }

        if (result.error) {
            console.error("Supabase DB Error:", result.error);
            return { error: result.error.message };
        }

        revalidatePath("/seller/products");
        revalidatePath("/");
        return { success: true };
    } catch (err: any) {
        console.error("Server Action Panic:", err);
        return { error: err.message || "An unexpected server error occurred" };
    }
}
