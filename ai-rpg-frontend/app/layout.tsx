import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import AuthInitializer from "@/components/AuthInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata works here because there is NO "use client" at the top
export const metadata: Metadata = {
  title: "Gemini Quest | AI RPG",
  description: "A text-based AI adventure engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 min-h-screen`}>
        <AuthInitializer />
        
        {/* All the auth/nav logic is now tucked inside this component */}
        <Navbar />

        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}