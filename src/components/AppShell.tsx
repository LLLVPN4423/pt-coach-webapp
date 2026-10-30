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
  { href: "/today", label: "Hôm nay", icon: IconHome, bottom: true },
  { href: "/plan", label: "Lộ trình", icon: IconDumbbell, bottom: true },
  { href: "/progress", label: "Tiến độ", icon: IconActivity, bottom: true },
  { href: "/library", label: "Thư viện", icon: IconCalendar, bottom: true },
  { href: "/body", label: "Cơ thể", icon: IconActivity, bottom: false },
  { href: "/settings", label: "Cài đặt", icon: IconSettings, bottom: true },
];

function NavLinks({
  variant,
}: {
  variant: "side" | "top" | "bottom";
}) {
  const pathname = usePathname();
  const items =
    variant === "bottom" ? NAV.filter((n) => n.bottom) : NAV;
  return (
    <>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        if (variant === "bottom") {
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link nav-link-bottom ${active ? "is-active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            className={`nav-link ${active ? "is-active" : ""} ${
              variant === "top" ? "!gap-1 !px-2 !py-1.5 !text-xs" : ""
            }`}
          >
            <Icon size={variant === "top" ? 14 : 16} />
            <span className={variant === "top" ? "hidden md:inline" : ""}>
              {label}
            </span>
          </Link>
        );
      })}
    </>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrated, profile } = usePtStore();
  const hideNav = pathname === "/onboarding" || pathname === "/";

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-[var(--muted)]">
        Đang tải PT Desk…
      </div>
    );
  }

  if (hideNav || !profile) {
    return (
      <div className="app-frame">
        <div className="app-main-wrap">
          <main className="app-content !pb-8">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <Link href="/today" className="mb-4 px-2">
          <p className="brand-mark text-lg text-[var(--text)]">PT Desk</p>
          <p className="mt-0.5 text-[11px] font-medium text-[var(--muted)]">
            Premium athletic coach
          </p>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5">
          <NavLinks variant="side" />
        </nav>
        <p className="mt-auto px-2 pt-4 text-[10px] leading-relaxed text-[var(--muted)]">
          Cá nhân · không thay thế bác sĩ
        </p>
      </aside>

      <div className="app-main-wrap">
        <header className="app-topbar">
          <Link href="/today" className="min-w-0">
            <span className="brand-mark text-base sm:text-lg">PT Desk</span>
          </Link>
          <nav className="app-topbar-nav flex max-w-[70%] items-center gap-0.5 overflow-x-auto">
            <NavLinks variant="top" />
          </nav>
        </header>

        <main className="app-content">{children}</main>

        <footer className="hidden border-t border-[var(--line)] px-4 py-3 text-center text-[10px] text-[var(--muted)] md:block">
          GIF ©{" "}
          <a
            href="https://gymvisual.com/"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gym visual
          </a>{" "}
          · personal / educational use
        </footer>
      </div>

      <nav className="app-bottom-nav" aria-label="Điều hướng chính">
        <NavLinks variant="bottom" />
      </nav>
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
