import { createClient } from "@/utils/supabase/server";
import { UserX, UserCheck, Shield, Trash2 } from "lucide-react";
import Image from "next/image";
import { revalidatePath } from "next/cache";

async function toggleUserStatus(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const newStatus = formData.get("newStatus") as string;
    const supabase = await createClient();

    const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", userId);

    if (error) {
        console.error("Error toggling user status:", error);
    } else {
        revalidatePath("/admin/users");
    }
}

async function deleteUser(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const supabase = await createClient();

    try {
        // Delete user's products first (cascade should handle this, but explicit is safer)
        const { error: productsError } = await supabase.from("products").delete().eq("seller_id", userId);
        if (productsError) throw productsError;

        // Delete user profile
        const { error: userError } = await supabase.from("users").delete().eq("id", userId);
        if (userError) throw userError;

        console.log(`User ${userId} and their products deleted successfully.`);
    } catch (error: any) {
        console.error("Error deleting user:", error);
    }

    revalidatePath("/admin/users");
}

import AdminActionForm from "@/components/admin/AdminActionForm";

export default async function AdminUsersPage() {
    const supabase = await createClient();
    const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage all sellers and buyers on the platform.
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users?.map((user) => (
                                <tr key={user.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-lg text-primary">
                                                {user.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name || "Unknown User"}</div>
                                                <div className="text-xs text-muted-foreground">{user.whatsapp_number}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === 'active'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {user.status === 'inactive' ? (
                                                <AdminActionForm
                                                    action={toggleUserStatus}
                                                    confirmMessage={`Activate user ${user.name}?`}
                                                    hiddenInputs={{ userId: user.id, newStatus: 'active' }}
                                                >
                                                    <button className="p-2 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors" title="Activate">
                                                        <UserCheck className="h-4 w-4" />
                                                    </button>
                                                </AdminActionForm>
                                            ) : (
                                                <AdminActionForm
                                                    action={toggleUserStatus}
                                                    confirmMessage={`Deactivate user ${user.name}?`}
                                                    hiddenInputs={{ userId: user.id, newStatus: 'inactive' }}
                                                >
                                                    <button className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors" title="Deactivate">
                                                        <UserX className="h-4 w-4" />
                                                    </button>
                                                </AdminActionForm>
                                            )}
                                            <AdminActionForm
                                                action={deleteUser}
                                                confirmMessage={`Permanently delete user ${user.name} and all their internal products. THIS CANNOT BE UNDONE.`}
                                                hiddenInputs={{ userId: user.id }}
                                            >
                                                <button type="submit" className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </AdminActionForm>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!users || users.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
