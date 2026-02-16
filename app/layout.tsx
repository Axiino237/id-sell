import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Declare AMP custom elements for TypeScript
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'amp-auto-ads': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: string;
          'data-ad-client'?: string;
        },
        HTMLElement
      >;
    }
  }
}

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Games ID Sell | Marketplace",
  description: "The next generation of buying and selling game IDs.",
};

import { Footer } from "@/components/shared/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"
        ></script>
      </head>
      <body
        className={`${outfit.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <amp-auto-ads
          type="adsense"
          data-ad-client="ca-pub-4776704024331789"
        />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
