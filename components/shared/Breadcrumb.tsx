"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbProps = {
    items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
                href="/"
                className="hover:text-white transition-colors flex items-center gap-1"
            >
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={index} className="flex items-center gap-2">
                        <ChevronRight className="h-3.5 w-3.5" />
                        {isLast || !item.href ? (
                            <span className="text-white font-medium">{item.label}</span>
                        ) : (
                            <Link
                                href={item.href}
                                className="hover:text-white transition-colors"
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
