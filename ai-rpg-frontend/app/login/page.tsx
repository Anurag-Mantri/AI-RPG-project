"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const checkProfileAndRedirect = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // No profile found, go to setup
      router.push("/setup-profile");
    } else {
      // Profile exists, go home
      router.push("/");
    }
  };

  const handleEmailLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else if (data.user) {
      checkProfileAndRedirect(data.user.id);
    }
  };

  const handleGoogleLogin = async () => {
    // For Google, the redirect happens automatically. 
    // We handle the "check" on the Home page or Navbar once they return.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) alert(error.message);
  };

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else {
        alert("Success! Check your email for a confirmation link.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-96 shadow-2xl">
        <h2 className="text-2xl font-bold text-amber-500 mb-6 text-center italic">QUEST LOG</h2>
        
        {/* Google Login Button */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black font-bold py-3 rounded-lg mb-4 flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-1 border-slate-700" />
          <span className="px-3 text-slate-500 text-xs">OR</span>
          <hr className="flex-1 border-slate-700" />
        </div>

        <input 
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mb-3 outline-none focus:border-amber-500"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mb-6 outline-none focus:border-amber-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <div className="flex gap-2">
          <button onClick={handleEmailLogin} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-all">
            LOG IN
          </button>
          <button onClick={handleSignUp} className="flex-1 border border-amber-600 text-amber-500 hover:bg-amber-600/10 font-bold py-3 rounded-lg transition-all">
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
}