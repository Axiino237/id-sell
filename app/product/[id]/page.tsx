import { Navbar } from "@/components/shared/Navbar";
import { AdUnit } from "@/components/shared/AdUnit";
import { createClient } from "@/utils/supabase/server";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { MessageCircle, ShieldCheck, Share2 } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: product } = await supabase.from("products").select("title, description, images").eq("id", id).single();

    if (!product) {
        return {
            title: "Product Not Found",
        }
    }

    const previousImages = (await parent).openGraph?.images || []

    return {
        title: `${product.title} | AntyGravity`,
        description: product.description || "Buy this great product on AntyGravity!",
        openGraph: {
            images: [product.images?.[0] || "", ...previousImages],
        },
    }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from("products")
        .select(`
      *,
      users:seller_id (name, whatsapp_number)
    `)
        .eq("id", id)
        .single();

    if (!product) {
        notFound();
    }


    const seller = product.users;
    const whatsappMessage = `Hi, I'm interested in "${product.title}" listed on AntyGravity for $${product.price}. Is it still available? Link: https://antygravity.com/product/${product.id}`;
    const whatsappLink = getWhatsAppLink(seller?.whatsapp_number || "", whatsappMessage);

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />

            <main className="container mx-auto px-4 max-w-5xl py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary/20">
                            {product.images && product.images[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images?.slice(1).map((img: string, i: number) => (
                                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary/20">
                                    <Image src={img} alt={`${product.title} ${i}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>

                        {/* Ad Space below images */}
                        <AdUnit slotId="product-detail-left" className="h-[250px] mt-8" />
                    </div>

                    {/* Product Details */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{product.title}</h1>
                            <p className="text-3xl font-bold text-emerald-400">${product.price}</p>
                            <p className="text-sm text-muted-foreground mt-4">
                                Listed {new Date(product.created_at).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="glass-card rounded-xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white">Seller Information</h3>
                                <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                                    <ShieldCheck className="h-3 w-3" /> Verified
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-white">
                                    {seller?.name?.[0]?.toUpperCase() || "S"}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{seller?.name || "Unknown Seller"}</p>
                                    <p className="text-xs text-muted-foreground">Member since 2026</p>
                                </div>
                            </div>

                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-bold text-white hover:bg-[#128C7E] transition-all shadow-lg shadow-[#25D366]/20"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Chat on WhatsApp
                            </a>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-lg font-semibold text-white">Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-border">
                            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                                <Share2 className="h-4 w-4" /> Share Product
                            </button>
                        </div>

                        {/* Ad Space in details */}
                        <AdUnit slotId="product-detail-bottom" className="h-[250px]" />
                    </div>
                </div>
            </main>
        </div>
    );
}
