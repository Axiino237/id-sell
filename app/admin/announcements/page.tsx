import { createClient } from "@/utils/supabase/server";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import AdminActionForm from "@/components/admin/AdminActionForm";

async function createAnnouncement(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const supabase = await createClient();

    const { error } = await supabase.from("announcements").insert({
        title,
        content,
        is_active: true // Explicitly set to true for visibility
    });

    if (error) {
        console.error("Error creating announcement:", error);
    } else {
        revalidatePath("/admin/announcements");
        revalidatePath("/"); // Also revalidate home page
    }
}

async function deleteAnnouncement(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const supabase = await createClient();

    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
        console.error("Error deleting announcement:", error);
    } else {
        revalidatePath("/admin/announcements");
    }
}

export default async function AdminAnnouncementsPage() {
    const supabase = await createClient();
    const { data: announcements } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Announcements</h1>
                <p className="text-muted-foreground mt-2">
                    Broadcast messages to all users.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            New Announcement
                        </h2>
                        <form action={createAnnouncement} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Title
                                </label>
                                <input
                                    name="title"
                                    required
                                    className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="e.g. System Maintenance"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Content
                                </label>
                                <textarea
                                    name="content"
                                    required
                                    rows={4}
                                    className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Enter details..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Post Announcement
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {announcements?.map((announcement) => (
                        <div key={announcement.id} className="glass-card rounded-xl p-6 relative group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-full bg-blue-500/10 p-2 text-blue-400">
                                        <Megaphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{announcement.title}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(announcement.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <AdminActionForm
                                    action={deleteAnnouncement}
                                    confirmMessage={`Delete announcement "${announcement.title}"?`}
                                    hiddenInputs={{ id: announcement.id }}
                                >
                                    <button className="p-2 text-muted-foreground hover:text-red-400 transition-all">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </AdminActionForm>
                            </div>
                            <p className="mt-3 text-sm text-gray-300 pl-12">
                                {announcement.content}
                            </p>
                        </div>
                    ))}

                    {(!announcements || announcements.length === 0) && (
                        <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
                            No announcements yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
