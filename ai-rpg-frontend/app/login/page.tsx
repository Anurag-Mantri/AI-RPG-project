"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    const endpoint = isRegister ? "/register" : "/login";
    const res = await fetch(`http://localhost:8000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      if (isRegister) {
        setIsRegister(false); // Move to login after registering
        alert("Account created! Please log in.");
      } else {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", username);
        router.push("/"); // Go home
      }
    } else {
      alert("Error: Check your credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-96 shadow-2xl">
        <h2 className="text-2xl font-bold text-amber-500 mb-6 uppercase tracking-tight text-center">
          {isRegister ? "Join the Quest" : "Welcome Back"}
        </h2>
        <input 
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mb-4 outline-none focus:border-amber-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="password"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mb-6 outline-none focus:border-amber-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          onClick={handleAuth}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-all"
        >
          {isRegister ? "REGISTER" : "LOG IN"}
        </button>
        <p className="mt-4 text-center text-slate-500 text-xs">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-amber-500 ml-1 hover:underline"
          >
            {isRegister ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}