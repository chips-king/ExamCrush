import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { ThemeToggle } from "@/components/ThemeToggle";
import "katex/dist/katex.min.css";
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
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("examcrush:theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}`,
          }}
        />
      </head>
      <body>
        <header className="border-b border-line bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-black tracking-tight">
              ExamCrush
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-ink/75 transition hover:bg-white hover:text-ink"
              >
                前台
              </Link>
              <Link
                href="/favorites"
                className="rounded-md px-3 py-2 text-ink/75 transition hover:bg-white hover:text-ink"
              >
                收藏
              </Link>
              <Link
                href="/mistakes"
                className="rounded-md px-3 py-2 text-ink/75 transition hover:bg-white hover:text-ink"
              >
                错题本
              </Link>
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-ink/75 transition hover:bg-white hover:text-ink"
              >
                后台
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-73px)] max-w-6xl px-4 py-6 md:py-8">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
