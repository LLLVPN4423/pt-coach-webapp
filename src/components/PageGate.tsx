"use client";

/** Always render a segment shell so Next never sees a dropped page tree. */
export function PageGate({
  ready,
  children,
  label = "Đang tải…",
}: {
  ready: boolean;
  children?: React.ReactNode;
  label?: string;
}) {
  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-[var(--muted)]">
        {label}
      </div>
    );
  }
  return <>{children}</>;
}
