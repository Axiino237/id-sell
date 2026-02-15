import { createClient } from "@/utils/supabase/server";
import { Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function AdminPromotionsPage() {
    const supabase = await createClient();

    // Fetch promotion requests with related product and seller details
    const { data: requests } = await supabase
        .from("promotion_requests")
        .select(`
      *,
      products:product_id (title, price, description),
      users:seller_id (name, whatsapp_number)
    `)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Promotion Requests</h1>
                <p className="text-muted-foreground mt-2">
                    Approve or reject product promotion requests.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests?.map((request) => (
                    <div key={request.id} className="glass-card rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-white truncate max-w-[200px]">
                                    {request.products?.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">by {request.users?.name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${request.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                {request.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="py-2 border-y border-border/50">
                            <p className="text-sm text-muted-foreground line-clamp-2">{request.products?.description}</p>
                            <p className="mt-2 font-bold text-white">${request.products?.price}</p>
                        </div>

                        {request.status === 'pending' && (
                            <div className="flex gap-3 pt-2">
                                <form action={async () => {
                                    "use server";
                                    const sb = await createClient();
                                    // Update promotion request status
                                    await sb.from("promotion_requests").update({ status: 'approved' }).eq('id', request.id);
                                    // Update product to be promoted
                                    await sb.from("products").update({ is_promoted: true }).eq('id', request.product_id);
                                }} className="flex-1">
                                    <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 border border-emerald-500/20">
                                        <Check className="h-4 w-4" />
                                        Approve
                                    </button>
                                </form>
                                <form action={async () => {
                                    "use server";
                                    const sb = await createClient();
                                    await sb.from("promotion_requests").update({ status: 'rejected' }).eq('id', request.id);
                                }} className="flex-1">
                                    <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/20 border border-rose-500/20">
                                        <X className="h-4 w-4" />
                                        Reject
                                    </button>
                                </form>
                            </div>
                        )}

                        <Link href={`/product/${request.product_id}`} className="block text-center text-xs text-muted-foreground hover:text-white mt-2 flex items-center justify-center gap-1">
                            View Product <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                ))}

                {(!requests || requests.length === 0) && (
                    <div className="col-span-full py-12 text-center text-muted-foreground glass-card rounded-xl">
                        No promotion requests found.
                    </div>
                )}
            </div>
        </div>
    );
}
