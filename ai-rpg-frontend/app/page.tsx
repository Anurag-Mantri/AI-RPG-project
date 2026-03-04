import Link from 'next/link';
import { Play, Compass, PlusCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      
      {/* 1. RECENT ADVENTURES */}
      <section>
        <h2 className="flex items-center gap-2 text-amber-500 font-bold text-lg mb-6 uppercase tracking-widest">
          <Clock size={20} /> Continue Playing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* This would eventually be a map() of your SQL data */}
          <Link href="/play" className="group flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-amber-500/50 transition-all shadow-xl">
            <div>
              <h3 className="text-xl font-bold group-hover:text-amber-500 transition-colors">The Crimson Citadel</h3>
              <p className="text-slate-500 text-sm">Last played: 45 minutes ago • Level 4 Warrior</p>
            </div>
            <Play className="text-amber-500 group-hover:scale-125 transition-transform" fill="currentColor" size={24} />
          </Link>
        </div>
      </section>

      {/* 2. RECOMMENDED WORLDS */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="flex items-center gap-2 text-white font-bold text-lg uppercase tracking-widest">
            <Compass size={20} /> Recommended Worlds
          </h2>
          <Link href="/discover" className="text-amber-500 text-xs font-bold hover:underline">VIEW ALL</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <WorldCard title="Neon City" tags={["Cyberpunk", "Hardcore"]} description="A rainy metropolis where data is more valuable than life." />
          <WorldCard title="Forgotten Tomb" tags={["Horror", "Fantasy"]} description="Deep beneath the earth, something ancient has woken up." />
          <WorldCard title="Starship Echo" tags={["Sci-Fi"]} description="You wake up alone on a drifting colony ship." />
          <Link href="/create" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-6 hover:bg-slate-900/50 transition-colors group">
            <PlusCircle size={40} className="text-slate-700 group-hover:text-amber-500 mb-2 transition-colors" />
            <span className="text-slate-500 font-bold text-sm">Create New World</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function WorldCard({ title, tags, description }: any) {
  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:scale-[1.02] transition-all cursor-pointer shadow-lg group">
      <div className="h-32 bg-slate-800 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="p-4">
        <div className="flex gap-2 mb-2">
          {tags.map((t: string) => (
            <span key={t} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">{t}</span>
          ))}
        </div>
        <h3 className="font-bold text-lg group-hover:text-amber-500 transition-colors">{title}</h3>
        <p className="text-slate-400 text-xs line-clamp-2 mt-1">{description}</p>
      </div>
    </div>
  );
}