import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

/**
 * Premium Athletic SaaS typography:
 * - Space Grotesk → brand / page titles / stat values (geometric, strong)
 * - DM Sans → UI body / forms / tables (high readability, not Inter)
 * latin-ext for Vietnamese diacritics
 */
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PT Desk — lộ trình ăn · tập",
  description:
    "Công cụ cá nhân theo dõi InBody, thiết kế và theo dõi lộ trình tập luyện & dinh dưỡng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${display.variable} ${body.variable} h-full`}
      style={{ colorScheme: "dark" }}
    >
      <body className="flex min-h-full flex-col antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
