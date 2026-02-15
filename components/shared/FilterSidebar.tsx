"use client";

import { Filter, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type FilterSidebarProps = {
    categories: any[];
};

export function FilterSidebar({ categories }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    const currentCategory = searchParams.get("category") || "";
    const currentSort = searchParams.get("sort") || "newest";
    const currentMinPrice = searchParams.get("minPrice") || "";
    const currentMaxPrice = searchParams.get("maxPrice") || "";

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/products?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/products");
    };

    const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice;

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border text-white mb-4"
            >
                <Filter className="h-4 w-4" />
                Filters
            </button>

            {/* Sidebar */}
            <div className={`${isOpen ? 'fixed inset-0 z-50 bg-background lg:relative lg:z-auto' : 'hidden lg:block'} lg:sticky lg:top-20 lg:h-fit`}>
                <div className="glass-card rounded-xl p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-white">Filters</h3>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-muted-foreground hover:text-white transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-1 hover:bg-secondary rounded"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Sort */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Sort By
                        </label>
                        <select
                            value={currentSort}
                            onChange={(e) => updateFilters("sort", e.target.value)}
                            className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name-az">Name: A-Z</option>
                            <option value="name-za">Name: Z-A</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Category
                        </label>
                        <select
                            value={currentCategory}
                            onChange={(e) => updateFilters("category", e.target.value)}
                            className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Price Range
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={currentMinPrice}
                                onChange={(e) => updateFilters("minPrice", e.target.value)}
                                className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <span className="text-muted-foreground self-center">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={currentMaxPrice}
                                onChange={(e) => updateFilters("maxPrice", e.target.value)}
                                className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
