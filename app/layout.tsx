import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todos",
  description: "Personal todo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="h-14 shrink-0 border-b border-zinc-200 bg-white flex items-center px-6">
          <span className="font-semibold tracking-tight">Todos</span>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <nav className="w-60 shrink-0 border-r border-zinc-200 bg-white overflow-y-auto p-4">
            <p className="text-sm text-zinc-400">Navigation</p>
          </nav>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
