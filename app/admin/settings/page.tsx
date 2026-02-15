import { createClient } from "@/utils/supabase/server";
import { MessageCircle, Plus, Trash2, ExternalLink } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminWhatsAppPage() {
    const supabase = await createClient();
    const { data: groups } = await supabase.from("admin_whatsapp_groups").select("*").order("created_at", { ascending: false });

    async function addGroup(formData: FormData) {
        "use server";
        const group_name = formData.get("group_name") as string;
        const group_url = formData.get("group_url") as string;
        const supabase = await createClient();

        await supabase.from("admin_whatsapp_groups").insert({ group_name, group_url });
        revalidatePath("/admin/settings"); // Assuming this might be under settings or its own route
    }

    async function deleteGroup(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;
        const supabase = await createClient();

        await supabase.from("admin_whatsapp_groups").delete().eq("id", id);
        revalidatePath("/admin/settings");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">WhatsApp Communities</h1>
                <p className="text-muted-foreground mt-2">
                    Manage the WhatsApp groups where products will be auto-shared.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add Group
                        </h2>
                        <form action={addGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Group Name
                                </label>
                                <input
                                    name="group_name"
                                    required
                                    className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="e.g. Electronics Hub #1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Invite Link
                                </label>
                                <input
                                    name="group_url"
                                    required
                                    type="url"
                                    className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="https://chat.whatsapp.com/..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition-colors"
                            >
                                Add Group
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {groups?.map((group) => (
                            <div key={group.id} className="glass-card rounded-xl p-4 relative group hover:border-emerald-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-400">
                                        <MessageCircle className="h-5 w-5" />
                                    </div>
                                    <form action={deleteGroup}>
                                        <input type="hidden" name="id" value={group.id} />
                                        <button className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-400 transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </form>
                                </div>

                                <h3 className="font-semibold text-white truncate">{group.group_name}</h3>

                                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${group.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                        {group.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <a
                                        href={group.group_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground hover:text-emerald-400 flex items-center gap-1"
                                    >
                                        Test Link <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(!groups || groups.length === 0) && (
                        <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
                            No WhatsApp groups connected.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
