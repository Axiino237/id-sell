"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Games ID Sell"
                    variant="admin"
                />
                <main className="min-h-screen p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-6xl animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
