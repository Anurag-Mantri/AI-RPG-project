"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // Added these imports

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter(); // Initialize router
  const pathname = usePathname(); // Get current page path

  useEffect(() => {
    // 1. Initial check for user and profile
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    };

    checkUser();

    // 2. Listen for auth changes (Login, Logout, Google Redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        
        // --- THE LOGIC BRIDGE ---
        // If logged in but NO profile exists, send to setup (unless already there)
        if (!userProfile && pathname !== "/setup-profile") {
          router.push("/setup-profile");
        }
      } else {
        setUser(null);
        setUsername(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]); // Re-run logic if page changes

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    
    if (data) {
      setUsername(data.username);
      return data.username;
    }
    return null;
  }

  return (
    <nav className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center px-8 fixed w-full z-50">
      <Link href="/" className="text-amber-500 font-black text-xl tracking-tighter mr-12 hover:opacity-80 transition-opacity">
        GEMINI QUEST
      </Link>

      <div className="flex gap-8 text-xs font-bold text-slate-400 tracking-widest uppercase">
        <Link href="/" className="hover:text-amber-500 transition-colors">HOME</Link>
        <Link href="/discover" className="hover:text-amber-500 transition-colors">DISCOVER</Link>
        <Link href="/create" className="hover:text-amber-500 transition-colors">CREATE</Link>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">
                {username || "Setting up..."}
            </span>
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center font-bold text-sm text-white border-2 border-amber-400 shadow-lg shadow-amber-900/20">
              {username ? username[0].toUpperCase() : "?"}
            </div>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="text-[10px] text-slate-500 hover:text-white uppercase font-bold transition-colors ml-2"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              SIGN UP
            </Link>
            <Link href="/login" className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg">
              <UserCircle size={16} /> LOG IN
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}