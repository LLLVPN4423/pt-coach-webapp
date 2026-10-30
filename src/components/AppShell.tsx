"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconActivity,
  IconCalendar,
  IconDumbbell,
  IconHome,
  IconSettings,
} from "@/components/icons";
import { PtStoreProvider, usePtStore } from "@/hooks/usePtStore";

const NAV = [
  { href: "/today", label: "Hôm nay", icon: IconHome },
  { href: "/plan", label: "Lộ trình", icon: IconDumbbell },
  { href: "/library", label: "Thư viện", icon: IconCalendar },
  { href: "/body", label: "Cơ thể", icon: IconActivity },
  { href: "/settings", label: "Cài đặt", icon: IconSettings },
];

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrated, profile } = usePtStore();
  const hideNav = pathname === "/onboarding" || pathname === "/";

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-[var(--muted)]">
        Đang tải bàn PT…
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {!hideNav && profile && (
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/today" className="group flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]">
                PT Desk
              </span>
              <span className="hidden text-xs text-[var(--muted)] sm:inline">
                lộ trình ăn · tập
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition ${
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
      )}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      {!hideNav && profile && (
        <footer className="border-t border-[var(--line)] py-3 text-center text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1">
            <IconCalendar size={12} /> Công cụ cá nhân · không thay thế bác sĩ /
            PT chuyên nghiệp
          </span>
        </footer>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PtStoreProvider>
      <ShellInner>{children}</ShellInner>
    </PtStoreProvider>
  );
}
