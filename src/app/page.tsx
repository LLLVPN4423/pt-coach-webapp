"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePtStore } from "@/hooks/usePtStore";

export default function Home() {
  const router = useRouter();
  const { hydrated, profile, plan } = usePtStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!profile || !plan) router.replace("/onboarding");
    else router.replace("/today");
  }, [hydrated, profile, plan, router]);

  return (
    <div className="flex flex-1 items-center justify-center py-20 text-[var(--muted)]">
      Đang mở PT Desk…
    </div>
  );
}
