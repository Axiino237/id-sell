"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { saveProductAction } from "@/app/seller/products/actions";

type ProductFormProps = {
    product?: any; // Replace with proper type
    userId: string;
};

export function ProductForm({ product, userId }: ProductFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>(product?.images || []);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase
                .from("categories")
                .select("*")
                .order("name", { ascending: true });
            setCategories(data || []);
        }
        fetchCategories();
    }, []);

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("products")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from("products").getPublicUrl(filePath);

            setImages([...images, data.publicUrl]);
        } catch (error: any) {
            alert(`Error uploading image: ${error.message || "Unknown error"}`);
            console.error(error);
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const priceRaw = formData.get("price") as string;
        const price = parseFloat(priceRaw);
        const category_id = (formData.get("category_id") as string) || null;

        if (isNaN(price)) {
            setLoading(false);
            alert("Please enter a valid price.");
            return;
        }

        try {
            const productData = {
                title,
                description,
                price,
                category_id: category_id === "" ? null : category_id,
                images,
                seller_id: userId,
                is_active: true
            };

            console.log("Submitting via Server Action:", productData);

            const result = await saveProductAction(productData, product?.id);

            if (result.error) {
                throw new Error(result.error);
            }

            console.log("Product saved successfully via Server Action");
            router.push("/seller/products");
            router.refresh();
        } catch (error: any) {
            console.error("Caught error in handleSubmit:", error);
            const errorMessage = error.message || String(error);
            alert(`Error saving product: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }

    function removeImage(index: number) {
        setImages(images.filter((_, i) => i !== index));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Product Title
                    </label>
                    <input
                        name="title"
                        defaultValue={product?.title}
                        required
                        className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="e.g. Wireless Headphones"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Price ($)
                    </label>
                    <input
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={product?.price}
                        required
                        className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Category
                    </label>
                    <select
                        name="category_id"
                        defaultValue={product?.category_id || ""}
                        className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                        <option value="">No Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        defaultValue={product?.description}
                        rows={5}
                        className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Describe your product..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Images
                    </label>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {images.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                                <Image src={url} alt="Product" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        <label className="relative aspect-square rounded-lg border-2 border-dashed border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-emerald-500">
                            {uploading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="h-6 w-6 mb-2" />
                                    <span className="text-xs">Upload</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 rounded-lg border border-border px-4 py-2 font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {product ? "Update Product" : "Create Product"}
                </button>
            </div>
        </form>
    );
}
