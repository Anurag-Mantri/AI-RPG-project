"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SetupProfile() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: pgError } = await supabase
      .from('profiles')
      .insert({ id: user.id, username: username });

    if (pgError) {
      setError("This username is already taken.");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-96 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-amber-500 mb-2 uppercase italic tracking-tighter">Identity Found</h2>
            <p className="text-slate-400 text-sm mb-6">What is your adventurer's name?</p>
            
            <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 mb-2 outline-none focus:border-amber-500 text-center text-lg"
                placeholder="Ex: ShadowWalker"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            
            <button 
                onClick={handleSave}
                disabled={!username}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-all"
            >
                FINISH SETUP
            </button>
        </div>
    </div>
  );
}