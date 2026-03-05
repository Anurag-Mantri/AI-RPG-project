import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutGrid, Compass, PlusCircle, UserCircle } from "lucide-react";
import AuthInitializer from "@/components/AuthInitializer"; // Import the fix

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gemini Quest | AI RPG",
  description: "A text-based AI adventure engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col`}
      >
        {/* This handles the guest_id logic safely */}
        <AuthInitializer />

        {/* GLOBAL NAVIGATION BAR */}
        <nav className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center px-8 fixed w-full z-50">
          <Link href="/" className="text-amber-500 font-black text-xl tracking-tighter mr-12 hover:opacity-80 transition-opacity">
            GEMINI QUEST
          </Link>

          <div className="flex gap-8 text-xs font-bold text-slate-400 tracking-widest">
            <Link href="/" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
              <LayoutGrid size={16} /> HOME
            </Link>
            <Link href="/discover" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
              <Compass size={16} /> DISCOVER
            </Link>
            <Link href="/create" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
              <PlusCircle size={16} /> CREATE
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Link the buttons to your login page */}
            <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              SIGN UP
            </Link>
            <Link href="/login" className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-900/20">
              <UserCircle size={16} /> LOG IN
            </Link>
          </div>
        </nav>

        <main className="flex-1 pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}