import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-card/30 backdrop-blur-md py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="space-y-2">
                        <p className="text-white font-bold text-lg">Games ID Sell</p>
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Games ID Sell. All rights reserved.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2 text-sm">
                        <p className="text-muted-foreground">
                            Developed by{" "}
                            <Link
                                href="https://www.axiino.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 font-medium transition-colors border-b border-primary/20 hover:border-primary/50"
                            >
                                Axiino
                            </Link>
                        </p>
                        <div className="flex gap-4 text-xs">
                            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
