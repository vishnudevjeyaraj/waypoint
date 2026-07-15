"use client";

// One nav data source, two responsive layouts: a left sidebar on desktop
// (primary) and a bottom tab bar at narrow widths (fallback).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Map, TrendingUp, User, type LucideIcon } from "lucide-react";

const NAV: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/today", label: "Today", Icon: Sun },
  { href: "/route", label: "Route", Icon: Map },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
  { href: "/profile", label: "Profile", Icon: User },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  // Clicking the destination you're already on scrolls that page to top.
  const onNavClick = (href: string) => (e: React.MouseEvent) => {
    if (isActive(href)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Sidebar — desktop (primary) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-[220px] flex-col bg-surface border-r border-border px-4 py-6">
        <Link
          href="/today"
          className="px-3 mb-8 text-lg font-semibold tracking-tight text-text"
        >
          Waypoint
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavClick(href)}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-base transition-colors ${
                isActive(href)
                  ? "text-accent-text bg-accent-soft"
                  : "text-muted hover:text-text hover:bg-surface-hover"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Bottom bar — narrow widths (fallback) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-10 bg-surface border-t border-border flex justify-around pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {NAV.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavClick(href)}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
              isActive(href) ? "text-accent-text" : "text-muted"
            }`}
          >
            <Icon size={22} />
            <span className="text-[11px]">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
