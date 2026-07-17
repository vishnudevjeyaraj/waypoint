// Public marketing pages (/, /about, /contact) share a simple header + footer.
// No app nav, no guard — anyone can view these.

import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Waypoint
          </Link>
          <nav className="flex items-center gap-5 sm:gap-6 text-sm">
            <Link
              href="/about"
              className="text-muted hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/start"
              className="border border-border rounded-[10px] px-4 py-2 font-medium hover:bg-surface-hover transition-colors"
            >
              Open app
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-border mt-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>
            Waypoint — a wellness and productivity tool, grounded in science.
          </span>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
