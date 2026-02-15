import { createClient } from "@/utils/supabase/server";
import { User, Phone, Save, CheckCircle2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function SellerSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch current profile data
    let { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

    // Fix: If no profile exists, create it now (Sync)
    if (!profile && user) {
        const { data: newProfile, error } = await supabase
            .from("users")
            .insert({
                id: user.id,
                name: user.user_metadata?.name || user.email?.split('@')[0] || "Seller",
                role: 'seller'
            })
            .select()
            .single();

        if (!error) {
            profile = newProfile;
        }
    }

    async function updateProfile(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const whatsapp_number = formData.get("whatsapp_number") as string;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from("users")
                .update({ name, whatsapp_number })
                .eq("id", user.id);

            if (error) {
                console.error("Error updating profile:", error.message);
            } else {
                revalidatePath("/seller/settings");
            }
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your profile and contact information.
                </p>
            </div>

            <div className="glass-card rounded-xl p-8 border border-white/10 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full" />

                <form action={updateProfile} className="space-y-6 relative">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4 text-emerald-400" />
                                Full Name
                            </label>
                            <input
                                name="name"
                                type="text"
                                defaultValue={profile?.name || ""}
                                required
                                placeholder="Your full name or shop name"
                                className="w-full rounded-lg bg-secondary/30 border border-white/10 px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4 text-emerald-400" />
                                WhatsApp Number
                            </label>
                            <input
                                name="whatsapp_number"
                                type="tel"
                                defaultValue={profile?.whatsapp_number || ""}
                                required
                                placeholder="+12 345 678 9000"
                                className="w-full rounded-lg bg-secondary/30 border border-white/10 px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                            />
                            <p className="text-xs text-muted-foreground/70">
                                This number will be used for product inquiries from buyers.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-emerald-400/80 animate-pulse">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Changes are saved instantly</span>
                        </div>
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            <Save className="h-5 w-5" />
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Info Card */}
            <div className="glass-card rounded-xl p-6 border border-white/10 bg-white/5">
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Email Address</p>
                        <p className="text-sm text-white font-medium break-all">{user?.email}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Account Status</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                            {profile?.status || "active"}
                        </span>
                    </div>
                </div>
                {/* Debug Info */}
                <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                        Internal ID: {user?.id}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                        Saved Number: {profile?.whatsapp_number || "None"}
                    </p>
                </div>
            </div>
        </div>
    );
}
