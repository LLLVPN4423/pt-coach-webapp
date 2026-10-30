import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
