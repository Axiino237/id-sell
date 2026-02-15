"use client";

import { useEffect } from "react";

type AdUnitProps = {
    slotId: string;
    format?: "auto" | "fluid" | "rectangle";
    className?: string;
};

export function AdUnit({ slotId, format = "auto", className = "" }: AdUnitProps) {
    useEffect(() => {
        try {
            // @ts-expect-error Google Ads
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error", err);
        }
    }, []);

    return (
        <div className={`overflow-hidden rounded-lg bg-secondary/20 flex items-center justify-center ${className}`}>
            {/* Placeholder for development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="p-4 text-center text-xs text-muted-foreground w-full h-full border border-dashed border-border flex items-center justify-center">
                    AdSense Slot: {slotId}
                </div>
            )}
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXX" // Replace with real ID
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
