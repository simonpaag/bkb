"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ROLE_LABELS } from "@/lib/labels";
import type { SessionUser } from "@/lib/types";
import { isAdmin } from "@/lib/types";

const LINKS = [
  { href: "/", label: "Oversigt" },
  { href: "/medlemmer", label: "Medlemmer" },
  { href: "/kanalen", label: "Kanalen" },
  { href: "/dokumenter", label: "Dokumenter" },
];

export function AppHeader({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = isAdmin(user);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-navy text-sand">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Logo light />
        <div className="hidden items-center gap-3 text-right sm:flex">
          <div>
            <div className="text-sm">{user.name}</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-brass">
              {ROLE_LABELS[user.role]}
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-sand/20 px-3 py-1.5 text-xs uppercase tracking-wider hover:border-brass hover:text-brass"
          >
            Log ud
          </button>
        </div>
      </div>
      <nav className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 text-sm whitespace-nowrap ${
                  active
                    ? "bg-brass text-navy-deep"
                    : "text-sand/80 hover:bg-white/10 hover:text-sand"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {admin ? (
            <Link
              href="/bestyrelsen"
              className={`rounded-full px-4 py-1.5 text-sm whitespace-nowrap ${
                pathname.startsWith("/bestyrelsen")
                  ? "bg-brass text-navy-deep"
                  : "text-sand/80 hover:bg-white/10 hover:text-sand"
              }`}
            >
              Bestyrelsen
            </Link>
          ) : null}
          <button
            onClick={logout}
            className="ml-auto rounded-full px-4 py-1.5 text-sm text-sand/70 sm:hidden"
          >
            Log ud
          </button>
        </div>
      </nav>
    </header>
  );
}
