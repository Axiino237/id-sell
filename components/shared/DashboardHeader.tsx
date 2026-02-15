"use client";

import { Menu } from "lucide-react";

interface DashboardHeaderProps {
    onMenuClick: () => void;
    title: string;
    variant?: 'admin' | 'seller';
}

export function DashboardHeader({ onMenuClick, title, variant = 'admin' }: DashboardHeaderProps) {
    const bgColor = variant === 'admin' ? 'bg-primary/20' : 'bg-emerald-500/20';
    const textColor = variant === 'admin' ? 'text-primary' : 'text-emerald-500';
    const initials = variant === 'admin' ? 'A' : 'S';

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/80 backdrop-blur-xl lg:hidden px-4">
            <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/50 transition-colors mr-4"
                aria-label="Toggle sidebar"
            >
                <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
                    <span className={`font-bold ${textColor} text-xl`}>{initials}</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {title}
                </span>
            </div>
        </header>
    );
}
