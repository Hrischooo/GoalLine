import { Link } from "react-router";
import { ChevronRight, TrendingUp, Activity, Star, Target } from "lucide-react";
import { MOCK_PLAYERS } from "../data/mock";
import { PlayerCard } from "../components/PlayerCard";

export function Home() {
  const STAT_LEADERS = [
    { title: "Top Goals (P90)", player: "Harry Kane", team: "FC Bayern", value: "1.14", metric: "G/90", icon: Target, color: "text-emerald-400" },
    { title: "Key Pass Eff.", player: "Declan Rice", team: "Arsenal", value: "17.0", metric: "%", icon: Activity, color: "text-cyan-400" },
    { title: "Progression", player: "M. Ødegaard", team: "Arsenal", value: "17.1", metric: "P/90", icon: TrendingUp, color: "text-purple-400" },
    { title: "Highest xG Diff", player: "Florian Wirtz", team: "Leverkusen", value: "+2.1", metric: "Diff", icon: Star, color: "text-amber-400" },
  ];

  const TOP_TEAMS = [
    { name: "Arsenal", rating: 88, form: ["W","W","W","D","W"], fit: "82%", attack: 85, defend: 90 },
    { name: "Man City", rating: 89, form: ["W","W","L","W","W"], fit: "86%", attack: 92, defend: 84 },
    { name: "Leverkusen", rating: 86, form: ["W","D","W","W","W"], fit: "88%", attack: 89, defend: 81 },
    { name: "Real Madrid", rating: 87, form: ["W","W","W","L","W"], fit: "80%", attack: 90, defend: 83 },
  ];

  return (
    <div className="min-h-screen bg-[#0B101E] text-slate-200 font-sans pb-32 selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-10 space-y-12">
        
        {/* Hero Section / Full Database */}
        <section className="bg-gradient-to-br from-[#131A2B]/80 to-[#0A0F1C]/80 rounded-[32px] border border-white/5 p-8 sm:p-12 relative overflow-hidden shadow-2xl backdrop-blur-md group hover:border-cyan-500/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[80px] translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-12">
            <div className="flex-1 space-y-6 max-w-3xl">
              <h2 className="text-cyan-400/80 text-[11px] font-extrabold tracking-[0.2em] uppercase mb-2 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">Full Database Scouting Workspace</h2>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight drop-shadow-sm">
                GoalLine turns raw football data into player decisions.
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mt-4">
                Browse the full player database, open detailed scouting screens with complete stat objects, and compare any two players in the dataset.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-6">
                <Link to="/compare" className="bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-50 border border-cyan-500/30 px-8 py-3.5 rounded-full font-black text-sm hover:from-cyan-500/30 hover:to-emerald-500/30 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.15)] uppercase tracking-wide">
                  Open compare
                </Link>
                <Link to="/leagues" className="bg-white/5 text-white border border-white/10 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/10 transition-all hover:border-white/20 uppercase tracking-wide">
                  Explore leagues
                </Link>
                <Link to="/players" className="bg-white/5 text-white border border-white/10 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/10 transition-all hover:border-white/20 uppercase tracking-wide">
                  Browse players
                </Link>
              </div>
            </div>

            <div className="xl:w-80 space-y-4 shrink-0">
              <div className="text-slate-400 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                Live dataset
              </div>
              
              <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] rounded-[20px] p-6 border border-white/5 hover:-translate-y-1 transition-transform shadow-lg">
                <h3 className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">Profiles loaded</h3>
                <p className="text-white text-4xl font-black tracking-tight">983</p>
              </div>
              <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] rounded-[20px] p-6 border border-white/5 hover:-translate-y-1 transition-transform shadow-lg">
                <h3 className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">Rows loaded</h3>
                <p className="text-white text-4xl font-black tracking-tight">983</p>
              </div>
              <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] rounded-[20px] p-6 border border-white/5 hover:-translate-y-1 transition-transform shadow-lg">
                <h3 className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">Season dataset</h3>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-2xl font-black tracking-tight drop-shadow-sm">2023-2024</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (Global Stat Leaders + Trending) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Global Stat Leaders */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {STAT_LEADERS.map((stat, idx) => {
                const Icon = stat.icon;
            return (
              <div key={idx} className="bg-gradient-to-br from-[#131A2B]/80 to-[#0A0F1C]/80 rounded-[24px] border border-white/5 p-6 backdrop-blur-md hover:border-cyan-500/20 transition-all shadow-xl group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0F1423] border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[9px] font-extrabold tracking-[0.2em] uppercase block mb-1">{stat.title}</span>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-white text-2xl font-black leading-none drop-shadow-sm">{stat.value}</span>
                      <span className="text-slate-400 text-[10px] font-bold">{stat.metric}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-slate-300 font-bold text-[13px]">{stat.player}</span>
                  <span className="text-slate-500 text-[11px] font-medium">{stat.team}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Trending Players Spotlight */}
        <section className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
                <h2 className="text-cyan-400/80 text-[11px] font-extrabold tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">Scout's Notebook</h2>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">Trending Performers</h3>
            </div>
            <Link to="/players" className="text-cyan-400 text-[11px] font-extrabold flex items-center gap-1.5 group hover:text-cyan-300 transition-colors uppercase tracking-widest bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 shadow-inner">
              View Database <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_PLAYERS.slice(0, 2).map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>
      </div>

      {/* Right Sidebar (Top Teams & Stats) */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#131A2B]/80 to-[#0A0F1C]/80 rounded-[24px] border border-white/5 p-6 backdrop-blur-md shadow-xl group hover:border-emerald-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-4 bg-emerald-400 rounded-full"></div>
            <h2 className="text-emerald-400/80 text-[11px] font-extrabold tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">Power Rankings</h2>
          </div>
          
          <div className="space-y-5">
            {TOP_TEAMS.map((team, idx) => (
              <div key={idx} className="flex flex-col gap-3 group/team p-3 -mx-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-black text-sm w-4 text-center group-hover/team:text-emerald-400 transition-colors">{idx + 1}</span>
                    <h3 className="text-white font-bold text-[15px]">{team.name}</h3>
                  </div>
                  <div className="bg-[#050A14] border border-emerald-500/20 px-2 py-1 rounded text-emerald-400 font-black text-xs shadow-inner">
                    {team.rating}
                  </div>
                </div>
                
                <div className="flex justify-between items-end gap-4 px-7">
                   <div className="flex-1 space-y-1">
                     <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                       <span>Atk</span>
                       <span className="text-cyan-400">{team.attack}</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-400/80 rounded-full" style={{ width: `${team.attack}%` }}></div>
                     </div>
                   </div>
                   <div className="flex-1 space-y-1">
                     <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                       <span>Def</span>
                       <span className="text-purple-400">{team.defend}</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-400/80 rounded-full" style={{ width: `${team.defend}%` }}></div>
                     </div>
                   </div>
                </div>
                
                <div className="flex gap-1 mt-1 pl-7">
                  {team.form.map((f, i) => (
                    <div key={i} className={`w-4 h-4 rounded-[3px] flex items-center justify-center text-[8px] font-black 
                      ${f === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                        f === 'L' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                        'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <Link to="/leagues" className="mt-6 flex items-center justify-center w-full py-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors rounded-xl text-[11px] font-extrabold uppercase tracking-widest border border-emerald-500/20">
            View full rankings
          </Link>
        </div>

        {/* Global OVR Distribution (Mock Chart) */}
        <div className="bg-gradient-to-br from-[#131A2B]/80 to-[#0A0F1C]/80 rounded-[24px] border border-white/5 p-6 backdrop-blur-md shadow-xl group hover:border-cyan-500/20 transition-all duration-300">
           <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
            <h2 className="text-cyan-400/80 text-[11px] font-extrabold tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">Dataset Health</h2>
          </div>
          <div className="flex items-end gap-1 h-24 mb-4">
             {[4, 12, 25, 45, 60, 85, 100, 75, 40, 20, 8, 2].map((height, i) => (
               <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/20 to-cyan-400/80 rounded-t-sm hover:from-cyan-400 hover:to-cyan-300 transition-colors cursor-crosshair relative group/bar" style={{ height: `${height}%` }}>
                  <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#050A14] border border-cyan-500/30 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none z-10 transition-opacity">
                    {height * 12}
                  </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 tracking-wider">
             <span>&lt; 65</span>
             <span>75</span>
             <span>85+</span>
          </div>
        </div>
      </div>
    </div>

    {/* League Discovery */}
        <section className="bg-gradient-to-br from-[#131A2B]/80 to-[#0A0F1C]/80 rounded-[32px] border border-white/5 p-8 sm:p-12 relative overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <h2 className="text-cyan-400/80 text-[11px] font-extrabold tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">League Discovery</h2>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                Start From The Competition Layer
              </h1>
              <p className="text-slate-400 text-[15px] max-w-xl mt-2">
                Open a league workspace to scout role types, leaders, and filtered player pools.
              </p>
            </div>
            <Link to="/leagues" className="bg-white/5 border border-white/10 px-8 py-3.5 rounded-full text-sm font-bold hover:bg-white/10 transition-colors shrink-0 flex items-center gap-2 group uppercase tracking-wide">
              View all leagues
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Premier League */}
            <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] rounded-[24px] border border-white/5 p-8 space-y-8 hover:border-cyan-500/30 transition-all cursor-pointer group shadow-xl">
              <div className="flex justify-between items-start">
                <div className="flex gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl flex items-center justify-center font-black text-white text-xl border border-white/10 shadow-lg relative clip-shield">
                    <div className="absolute inset-[-2px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full -z-10 blur-[2px]"></div>
                    PL
                  </div>
                  <div className="pt-1">
                    <h3 className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-1.5">League Overview</h3>
                    <h2 className="text-white text-3xl font-black tracking-tight mb-1 group-hover:text-cyan-50 transition-colors">Premier League</h2>
                    <p className="text-slate-400 text-xs font-medium">England / 2023-2024 / 1st Division</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">Avg OVR</p>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black px-4 py-2.5 rounded-xl text-xl shadow-[inset_0_0_10px_rgba(34,211,238,0.1)] drop-shadow-md">72.1</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#0F1423] rounded-[16px] p-5 border border-white/5 shadow-inner">
                   <p className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">Players</p>
                   <p className="text-white font-black text-2xl">516</p>
                 </div>
                 <div className="bg-[#0F1423] rounded-[16px] p-5 border border-white/5 shadow-inner">
                   <p className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">Clubs</p>
                   <p className="text-white font-black text-2xl">20</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="bg-[#0F1423] rounded-[16px] p-4 px-5 border border-white/5 flex justify-between items-center text-[13px] shadow-inner hover:bg-white/[0.02] transition-colors">
                   <span className="text-slate-400 font-medium">Top Scorer</span>
                   <span className="text-white font-bold">Erling Haaland (27)</span>
                 </div>
                 <div className="bg-[#0F1423] rounded-[16px] p-4 px-5 border border-white/5 flex justify-between items-center text-[13px] shadow-inner hover:bg-white/[0.02] transition-colors">
                   <span className="text-slate-400 font-medium">Top Assister</span>
                   <span className="text-white font-bold">Ollie Watkins (13)</span>
                 </div>
                 <div className="flex justify-between items-center pt-4 px-2">
                   <span className="text-slate-400 text-[11px] font-medium uppercase tracking-[0.1em]">Top Rated <span className="text-white font-black ml-2">Martin Ødegaard</span></span>
                   <Link to="/leagues" className="text-cyan-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-widest">Open league <ChevronRight className="w-4 h-4" /></Link>
                 </div>
              </div>
            </div>

            {/* Bundesliga */}
            <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] rounded-[24px] border border-white/5 p-8 space-y-8 hover:border-cyan-500/30 transition-all cursor-pointer group shadow-xl">
              <div className="flex justify-between items-start">
                <div className="flex gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl flex items-center justify-center font-black text-white text-xl border border-white/10 shadow-lg relative clip-shield">
                    <div className="absolute inset-[-2px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full -z-10 blur-[2px]"></div>
                    BL
                  </div>
                  <div className="pt-1">
                    <h3 className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-1.5">League Overview</h3>
                    <h2 className="text-white text-3xl font-black tracking-tight mb-1 group-hover:text-cyan-50 transition-colors">Bundesliga</h2>
                    <p className="text-slate-400 text-xs font-medium">Germany / 2023-2024 / 1st Division</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">Avg OVR</p>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black px-4 py-2.5 rounded-xl text-xl shadow-[inset_0_0_10px_rgba(34,211,238,0.1)] drop-shadow-md">71.0</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#0F1423] rounded-[16px] p-5 border border-white/5 shadow-inner">
                   <p className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">Players</p>
                   <p className="text-white font-black text-2xl">467</p>
                 </div>
                 <div className="bg-[#0F1423] rounded-[16px] p-5 border border-white/5 shadow-inner">
                   <p className="text-slate-500 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2">Clubs</p>
                   <p className="text-white font-black text-2xl">18</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="bg-[#0F1423] rounded-[16px] p-4 px-5 border border-white/5 flex justify-between items-center text-[13px] shadow-inner hover:bg-white/[0.02] transition-colors">
                   <span className="text-slate-400 font-medium">Top Scorer</span>
                   <span className="text-white font-bold">Harry Kane (36)</span>
                 </div>
                 <div className="bg-[#0F1423] rounded-[16px] p-4 px-5 border border-white/5 flex justify-between items-center text-[13px] shadow-inner hover:bg-white/[0.02] transition-colors">
                   <span className="text-slate-400 font-medium">Top Assister</span>
                   <span className="text-white font-bold">Alex Grimaldo (13)</span>
                 </div>
                 <div className="flex justify-between items-center pt-4 px-2">
                   <span className="text-slate-400 text-[11px] font-medium uppercase tracking-[0.1em]">Top Rated <span className="text-white font-black ml-2">Florian Wirtz</span></span>
                   <Link to="/leagues" className="text-cyan-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-widest">Open league <ChevronRight className="w-4 h-4" /></Link>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}