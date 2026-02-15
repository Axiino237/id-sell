import { AdminSidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar />
            <main className="ml-64 min-h-screen p-8">
                <div className="mx-auto max-w-6xl animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
