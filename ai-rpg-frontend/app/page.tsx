"use client";
import React, { useState } from 'react';
import { Dice5, Send } from 'lucide-react';

export default function Game() {
  const [input, setInput] = useState("");
  const [story, setStory] = useState<{role: string, text: string, roll?: number}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!input) return;
    setLoading(true);

    // Format the history for the backend
    // We only send the text and the role ("user" or "model")
    const chatHistory = story.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      text: msg.text
    }));

    try {
      const response = await fetch("http://localhost:8000/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_input: input,
          history: chatHistory 
        }),
      });

      const data = await response.json();
      
      setStory((prev) => [
        ...prev, 
        { role: "user", text: input },
        { role: "ai", text: data.story_text, roll: data.roll }
      ]);
      setInput("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
};

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-amber-500">Gemini Quest</h1>
      
      <div className="w-full max-w-2xl bg-slate-800 rounded-lg p-6 h-[500px] overflow-y-auto mb-6 border border-slate-700">
        {story.length === 0 && <p className="text-slate-400 italic">Begin your adventure by typing an action...</p>}
        {story.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-blue-300' : 'text-slate-100'}`}>
            {msg.roll && (
              <span className="inline-flex items-center bg-amber-600 text-white text-xs px-2 py-1 rounded mr-2">
                <Dice5 size={12} className="mr-1" /> Roll: {msg.roll}
              </span>
            )}
            <strong>{msg.role === 'user' ? "You: " : "DM: "}</strong>
            {msg.text}
          </div>
        ))}
        {loading && <p className="animate-pulse">The DM is thinking...</p>}
      </div>

      <div className="w-full max-w-2xl flex gap-2">
        <input 
          className="flex-1 bg-slate-700 border border-slate-600 rounded p-3 outline-none focus:border-amber-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I enter the dark cave..."
          onKeyDown={(e) => e.key === 'Enter' && handleAction()}
        />
        <button 
          onClick={handleAction}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-500 p-3 rounded transition-colors disabled:opacity-50"
        >
          <Send />
        </button>
      </div>
    </main>
  );
}