import { useState } from "react";
import { MOCK_PLAYERS } from "../data/mock";
import { PlayerCard } from "../components/PlayerCard";
import { ChevronDown, SlidersHorizontal, Settings2 } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import clsx from "clsx";
import { Link } from "react-router";

export function Players() {
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState([17, 39]);

  const leagues = ["Bundesliga", "Premier League"];
  const positions = ["GK", "DF", "MF", "FW"];

  const toggleSelection = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B101E] text-slate-200 font-sans pb-32 selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-10 flex flex-col xl:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full xl:w-[340px] shrink-0 space-y-8">
          <div className="relative">
            <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
            <h2 className="text-cyan-400/80 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-3 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)] relative z-10">Explore Players</h2>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4 relative z-10 drop-shadow-sm">
              Scout The Full Database
            </h1>
            <p className="text-slate-400 text-[13px] mb-8 leading-relaxed relative z-10 max-w-[280px]">
              Filter across leagues, roles, and advanced indicators without leaving the workspace.
            </p>
          </div>

          {/* Basic Filters Box */}
          <div className="bg-[#131A2B]/80 rounded-[24px] border border-white/5 p-8 shadow-2xl backdrop-blur-md space-y-8 hover:border-cyan-500/10 transition-colors duration-500">
            <h3 className="text-white font-black text-lg mb-2 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
              Basic Filters
            </h3>
            
            <div className="space-y-4">
              <label className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase">League</label>
              <div className="flex flex-wrap gap-2.5">
                {leagues.map(l => (
                  <button
                    key={l}
                    onClick={() => toggleSelection(l, selectedLeagues, setSelectedLeagues)}
                    className={clsx(
                      "px-5 py-2.5 rounded-full text-[13px] font-bold transition-all border shadow-sm",
                      selectedLeagues.includes(l)
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                        : "bg-[#0A0F1C] border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/[0.02]"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase">Position</label>
              <div className="flex gap-2.5">
                {positions.map(p => (
                  <button
                    key={p}
                    onClick={() => toggleSelection(p, selectedPositions, setSelectedPositions)}
                    className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all border shadow-sm",
                      selectedPositions.includes(p)
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                        : "bg-[#0A0F1C] border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/[0.02]"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase">Club</label>
              <button className="w-full bg-[#0A0F1C] border border-white/5 hover:border-cyan-500/30 transition-all rounded-xl p-4 flex justify-between items-center text-[13px] text-slate-300 font-bold shadow-inner group">
                All Clubs
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 text-[13px] font-bold">Age Range: <span className="text-cyan-400 ml-1">{ageRange[0]} - {ageRange[1]}</span></label>
              </div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5 group"
                value={ageRange}
                onValueChange={setAgeRange}
                max={39}
                min={17}
                step={1}
              >
                <Slider.Track className="bg-[#0A0F1C] border border-white/5 relative grow rounded-full h-2 overflow-hidden shadow-inner">
                  <Slider.Range className="absolute bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-transform cursor-grab active:cursor-grabbing" />
                <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-transform cursor-grab active:cursor-grabbing" />
              </Slider.Root>
            </div>
          </div>

          {/* Advanced Filters Box */}
          <div className="bg-[#131A2B]/80 rounded-[24px] border border-white/5 p-8 shadow-2xl backdrop-blur-md space-y-8 hover:border-cyan-500/10 transition-colors duration-500">
            <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-400" />
              Advanced Filters
            </h3>
            
            <div className="space-y-8">
              {[
                { label: "Goals P90 Min: 0", value: [0], max: 2 },
                { label: "Assists P90 Min: 0", value: [0], max: 1 },
                { label: "xG Diff Min: -5.9", value: [-5.9], max: 10, min: -10 },
                { label: "Key Pass Eff. Min: 0%", value: [0], max: 100 },
                { label: "Tackle Success Min: 0%", value: [0], max: 100 },
              ].map((filter, i) => (
                <div key={i} className="space-y-4">
                  <label className="text-slate-300 text-[13px] font-bold">{filter.label}</label>
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5 group"
                    defaultValue={filter.value}
                    max={filter.max}
                    min={filter.min || 0}
                    step={0.1}
                  >
                    <Slider.Track className="bg-[#0A0F1C] border border-white/5 relative grow rounded-full h-2 overflow-hidden shadow-inner">
                      <Slider.Range className="absolute bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-transform cursor-grab active:cursor-grabbing" />
                  </Slider.Root>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content (Grid) */}
        <main className="flex-1 min-w-0 xl:pt-4">
          {/* Top bar with Compare button */}
          <div className="flex justify-end mb-6">
            <Link to="/compare" className="bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-50 border border-cyan-500/30 px-6 py-3 rounded-full font-bold text-[13px] hover:from-cyan-500/30 hover:to-emerald-500/30 transition-all shadow-[0_0_15px_rgba(0,229,255,0.15)] uppercase tracking-wide">
              Compare two players
            </Link>
          </div>

          {/* Top bar */}
          <div className="bg-[#131A2B]/80 backdrop-blur-md rounded-[20px] border border-white/5 px-8 py-5 flex flex-col sm:flex-row justify-between items-center mb-8 shadow-lg gap-4 sm:gap-0">
            <p className="text-slate-400 text-[13px] font-bold">Showing <span className="text-white">24</span> of <span className="text-white">983</span> players</p>
            
            <div className="flex items-center gap-4">
               <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Sort by</span>
               <button className="bg-[#0A0F1C] border border-white/5 hover:border-cyan-500/30 transition-all rounded-xl px-5 py-2.5 flex items-center gap-3 text-[13px] text-white font-bold shadow-inner group">
                 Rating
                 <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
               </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PLAYERS.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}