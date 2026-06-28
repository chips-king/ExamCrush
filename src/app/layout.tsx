import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamCrush 期末刷题",
  description: "轻量化期末刷题系统"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-line bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-black tracking-tight">
              ExamCrush
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-ink/75 transition hover:bg-white hover:text-ink"
              >
                前台
              </Link>
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-ink/75 transition hover:bg-white hover:text-ink"
              >
                后台
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-73px)] max-w-6xl px-4 py-6 md:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
