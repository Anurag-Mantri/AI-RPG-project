"use client";
import React, { useState } from 'react';
import { Dice5, Send } from 'lucide-react';

export default function Game() {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState({ hp: 20, str: 10, dex: 10, int: 10 });
  const [loading, setLoading] = useState(false);

  interface Message {
    role: "user" | "ai";
    text: string;
    roll?: number;
    mod?: number;
    total_roll?: number;
    stat_used?: string;
  }

  
  const [story, setStory] = useState<Message[]>([]);

  const handleAction = async () => {
  if (!input) return;
  setLoading(true);

  // 1. Map history to exactly what ChatMessage expects
  const chatHistory = story.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    text: msg.text
  }));

  try {
    const response = await fetch("http://localhost:8000/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_input: input,
        history: chatHistory,
        // 2. Explicitly map stats to the backend's naming
        stats: {
          hp: stats.hp,
          strength: stats.str,     // Backend expects 'strength'
          dexterity: stats.dex,    // Backend expects 'dexterity'
          intelligence: stats.int, // Backend expects 'intelligence'
          level: 1
        },
        // 3. Ensure these are either valid strings or null
        adventure_id: null, 
        user_id: null,
        guest_id: "guest_123" 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server Error Detail:", errorData.detail);
      return;
    }

      const data = await response.json();
      
      setStory((prev) => [
        ...prev, 
        { role: "user", text: input },
        { role: "ai", 
          text: data.story_text, 
          roll: data.roll,
          mod: data.modifier,
          total_roll: data.total_roll,
          stat_used: data.stat_used
        }
      ]);

      setStats(prev => ({ ...prev, hp: data.hp, str: data.strength, dex: data.dexterity, int: data.intelligence }));

      setInput("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
};
























  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* LEFT SIDEBAR: Character Sheet */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
        <div>
          <h2 className="text-amber-500 font-bold text-xl tracking-wider mb-4 uppercase">Character</h2>
          <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-lg">
            <p className="text-red-400 text-xs font-bold uppercase mb-1">Health Points</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-red-500 transition-all duration-500" 
                  style={{ width: `${(stats.hp / 20) * 100}%` }}
                />
              </div>
              <span className="font-mono font-bold text-red-400">{stats.hp}/20</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-slate-500 text-xs font-bold uppercase px-1">Attributes</p>
          <StatRow label="Strength" value={stats.str} color="text-orange-400" />
          <StatRow label="Dexterity" value={stats.dex} color="text-green-400" />
          <StatRow label="Intelligence" value={stats.int} color="text-blue-400" />
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <p className="text-slate-500 text-[10px] italic">Powered by Gemini Pro & SQLite</p>
        </div>
      </aside>

      {/* MAIN CONTENT: Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center px-8 justify-between">
          <h1 className="text-2xl font-black text-amber-500 tracking-tighter">GEMINI QUEST</h1>
          <div className="flex gap-4 text-xs font-bold text-slate-400">
            <span>WORLD: DARK FANTASY</span>
            <span>DIFFICULTY: NORMAL</span>
          </div>
        </header>

        {/* Story Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
          {story.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <Dice5 size={48} className="animate-pulse opacity-20" />
              <p className="italic">The ink is dry. Write your first action to begin the chronicle...</p>
            </div>
          )}
          
          {story.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-5 shadow-lg ${
                msg.role === 'user' 
                ? 'bg-amber-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}>
                
                {/* Roll Logic Display */}
                {msg.role === 'ai' && msg.roll && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/50 text-[10px] font-bold uppercase tracking-widest text-amber-500">
                    <Dice5 size={14} />
                    <span>Roll: {msg.roll}</span>
                    <span className="text-slate-500">+</span>
                    <span>Mod: {msg.mod}</span>
                    <span className="text-slate-500">=</span>
                    <span className="text-white bg-amber-500/20 px-2 py-0.5 rounded">Total: {msg.total_roll}</span>
                    <span className="ml-auto text-slate-400">({msg.stat_used})</span>
                  </div>
                )}

                <p className="leading-relaxed text-md font-serif italic">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-slate-800 h-12 w-48 rounded-lg" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-900/80 border-t border-slate-800">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input 
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you do? (e.g., I attack the guard, I read the scroll...)"
              onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            />
            <button 
              onClick={handleAction}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 flex items-center gap-2"
            >
              <span>SEND</span>
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Small helper component for the sidebar rows
function StatRow({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
      <span className="text-slate-400 font-medium text-sm">{label}</span>
      <span className={`font-mono font-bold text-lg ${color}`}>{value}</span>
    </div>
  );
}