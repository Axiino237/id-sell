import { createClient } from "@/utils/supabase/server";
import { Package, Plus, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import AdminActionForm from "@/components/admin/AdminActionForm";

async function createCategory(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const supabase = await createClient();

    const { error } = await supabase.from("categories").insert({ name, slug });
    if (error) {
        console.error("Error creating category:", error);
    } else {
        revalidatePath("/admin/categories");
    }
}

async function deleteCategory(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const supabase = await createClient();

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
        console.error("Error deleting category:", error);
    } else {
        revalidatePath("/admin/categories");
    }
}

export default async function AdminCategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Categories</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage product categories.
                    </p>
                </div>
            </div>

            {/* Add Category Form */}
            <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Add New Category</h2>
                <form action={createCategory} className="flex gap-3">
                    <input
                        type="text"
                        name="name"
                        placeholder="Category name (e.g., Electronics)"
                        required
                        className="flex-1 rounded-lg bg-secondary/50 border border-border px-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </button>
                </form>
            </div>

            {/* Categories List */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Slug
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {categories?.map((category) => (
                                <tr key={category.id} className="group hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Package className="h-4 w-4 text-primary" />
                                            <span className="font-medium text-white">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <code className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                            {category.slug}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <AdminActionForm
                                            action={deleteCategory}
                                            confirmMessage={`Delete category "${category.name}"?`}
                                            hiddenInputs={{ id: category.id }}
                                        >
                                            <button
                                                type="submit"
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </AdminActionForm>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {(!categories || categories.length === 0) && (
                        <div className="py-12 text-center text-muted-foreground">
                            No categories yet. Add one above!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
