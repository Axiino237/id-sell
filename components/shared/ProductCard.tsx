"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Star, Tag } from "lucide-react";
import { Product } from "@/types/product";
import { getWhatsAppLink } from "@/lib/whatsapp";

type ProductCardProps = {
    product: Product;
    priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formattedDate = mounted
        ? new Date(product.created_at).toLocaleDateString()
        : "";

    return (
        <div className="group relative h-full">
            {/* Stretched Link for the entire card */}
            <Link
                href={`/product/${product.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View details for ${product.title}`}
            />

            <div className={`h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-primary/50 flex flex-col ${priority ? 'ring-2 ring-amber-500/20 shadow-amber-500/10' : ''
                }`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {product.images && product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground bg-secondary/50">
                            No Image
                        </div>
                    )}

                    {product.is_promoted && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-amber-500 text-white text-xs font-bold shadow-lg flex items-center gap-1 backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-current" />
                            PROMOTED
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-white font-medium text-sm">
                            View Details
                        </span>
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                        {product.title}
                    </h3>
                    {product.categories && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            <span>{product.categories.name}</span>
                        </div>
                    )}
                    <p className="mt-2 text-xl font-bold text-primary">
                        ${product.price}
                    </p>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                        <span className="text-xs text-muted-foreground min-h-[1rem]">
                            {formattedDate}
                        </span>
                        <a
                            href={product.users?.whatsapp_number ? getWhatsAppLink(product.users.whatsapp_number, `Hi, I'm interested in "${product.title}" listed on Games ID Sell for $${product.price}`) : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                if (!product.users?.whatsapp_number) {
                                    e.preventDefault();
                                    alert("WhatsApp number not available for this seller.");
                                }
                                e.stopPropagation();
                            }}
                            className="relative z-10 flex items-center gap-1 text-xs text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
                        >
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
