import { useState } from "react";
import { Link, useParams } from "react-router";
import { ChevronDown, Info, Check, ExternalLink } from "lucide-react";
import { TacticalPitch } from "../components/TacticalPitch";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { clsx } from "clsx";

const MOCK_PLAYER = {
  id: "kevin-stoger",
  name: "Kevin Stöger",
  club: "Bochum",
  nation: "Austria",
  league: "Bundesliga",
  position: "CAM",
  role: "Advanced Creator",
  secondaryRole: "Free-Roam Creator",
  season: "2023-2024",
  age: 29,
  born: 1993,
  matches: 32,
  avgMins: 2668,
  goalline: 90,
  confidence: "Hybrid",
  reliability: "High",
  stats: {
    attack: 88,
    creativity: 95,
    possession: 67,
    defending: 43
  },
  roleFit: [
    { role: "Advanced Creator", score: 91.8 },
    { role: "Free-Roam Creator", score: 91.3 },
    { role: "Playmaker", score: 88.5 }
  ],
  radar: [
    { subject: "Creativity", val: 95 },
    { subject: "Attack", val: 88 },
    { subject: "Progression", val: 80 },
    { subject: "Final Third Delivery", val: 96 },
    { subject: "Possession", val: 67 },
    { subject: "Flair Ball Carrying", val: 75 }
  ]
};

const TABS = ['Overview', 'Analysis', 'Similar Players'];

export function Player() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const player = MOCK_PLAYER;

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-10 min-h-screen text-slate-200 font-sans bg-[#0B101E] selection:bg-cyan-500/30 pb-32">
      {/* Header Block */}
      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <div className="flex-1 bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 relative z-10">
            <div className="flex items-start gap-6">
              <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center text-2xl font-black text-white shadow-xl border border-white/10 shrink-0 relative">
                <div className="absolute inset-[-2px] bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full -z-10 blur-[2px]"></div>
                KS
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-cyan-500/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]">
                    {player.position}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    Active Scout
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-sm">{player.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-[13px] text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0F1423] rounded-md border border-white/5">
                    <div className="w-4 h-4 bg-white text-black rounded-[3px] flex items-center justify-center text-[8px] font-bold">BO</div> 
                    {player.club}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span className="text-slate-400">{player.league}</span>
                </div>
              </div>
            </div>
            
            {/* Small Tactical Pitch Visualisation */}
            <div className="hidden md:block w-24 shrink-0 transition-transform duration-500 hover:scale-105">
              <TacticalPitch position={player.position} className="w-full !p-1.5 bg-[#0a0f1c]/80 shadow-inner rounded-xl border-white/10" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            <InfoBox label="POSITION" value={player.position} />
            <InfoBox label="ROLE TAG" value={player.role} />
            <InfoBox label="NATION" value={player.nation} />
            <InfoBox label="SEASON" value={player.season} />
          </div>
        </div>
        
        <div className="w-full xl:w-[420px] bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-500 flex flex-col justify-center">
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>
          <div className="flex justify-between items-center gap-8 h-full relative z-10">
            <div className="shrink-0 flex items-center justify-center transition-transform duration-500 hover:scale-105">
              <GoallineProgress score={player.goalline} />
            </div>
            <div className="flex-1 bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] rounded-2xl p-5 border border-white/5 h-full flex flex-col justify-center shadow-inner">
              <div className="text-[10px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">Tactical Profile</div>
              <div className="space-y-3.5 text-[13px]">
                <div className="flex justify-between items-center group/row">
                  <span className="text-slate-400 font-medium group-hover/row:text-slate-300 transition-colors">Primary Role</span>
                  <span className="text-white font-bold">{player.role}</span>
                </div>
                <div className="flex justify-between items-start group/row">
                  <span className="text-slate-400 font-medium group-hover/row:text-slate-300 transition-colors pt-0.5">Secondary Role</span>
                  <span className="text-white font-bold text-right leading-tight max-w-[100px]">{player.secondaryRole}</span>
                </div>
                <div className="w-full h-px bg-white/5 my-1"></div>
                <div className="flex justify-between items-center group/row">
                  <span className="text-slate-400 font-medium group-hover/row:text-slate-300 transition-colors">Confidence</span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {player.confidence}
                  </span>
                </div>
                <div className="flex justify-between items-center group/row">
                  <span className="text-slate-400 font-medium group-hover/row:text-slate-300 transition-colors">Reliability</span>
                  <span className="text-white font-bold">{player.reliability}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#131A2B]/80 border border-white/5 rounded-full p-2 backdrop-blur-md mb-8 shadow-xl relative z-20">
        <div className="flex gap-1 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 whitespace-nowrap",
                activeTab === tab 
                  ? "bg-cyan-500/10 text-cyan-50 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.15)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <Link to="/compare" className="mt-4 sm:mt-0 px-6 py-2.5 bg-gradient-to-r from-[#1A2235] to-[#1E293B] text-white text-[13px] font-bold rounded-full border border-white/10 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all duration-300 flex items-center gap-2 group">
          Compare Player
          <ExternalLink className="size-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-6 backdrop-blur-md shadow-2xl sticky top-8 hover:border-cyan-500/10 transition-colors duration-500">
            <h3 className="text-xs font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-6 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">Player Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <SidebarInfoBox label="NATION" value={player.nation} />
              <SidebarInfoBox label="LEAGUE" value={player.league} />
              <SidebarInfoBox label="CLUB" value={player.club} isCyan />
              <SidebarInfoBox label="AGE" value={player.age} />
              <SidebarInfoBox label="BORN" value={player.born} />
              <SidebarInfoBox label="MATCHES" value={player.matches} />
              <SidebarInfoBox label="AVG MINS" value={player.avgMins} />
              <SidebarInfoBox label="SEASON" value={player.season} />
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          <div className={clsx("transition-opacity duration-300", "opacity-100")}>
            {activeTab === 'Overview' && <OverviewTab player={player} />}
            {activeTab === 'Analysis' && <AnalysisTab />}
            {activeTab === 'Similar Players' && <SimilarPlayersTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ player }: any) {
  return (
    <div className="space-y-6">
      {/* Top Main Block */}
      <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl flex flex-col lg:flex-row gap-8 hover:border-cyan-500/10 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"></div>
        <div className="lg:w-1/3 relative z-10">
          <div className="text-[10px] text-cyan-400/80 uppercase tracking-[0.2em] font-extrabold mb-3 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">OVERVIEW</div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-3 leading-none drop-shadow-sm">{player.name}</h2>
          <div className="text-[13px] text-slate-300 font-semibold flex items-center gap-2 flex-wrap">
            <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/5">{player.club}</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/5">{player.position}</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/5">{player.nation}</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          <StatBlock label="Attack" val={player.stats.attack} />
          <StatBlock label="Creativity" val={player.stats.creativity} />
          <StatBlock label="Possession" val={player.stats.possession} />
          <StatBlock label="Defending" val={player.stats.defending} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tactical Profile Details */}
        <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
          <h3 className="text-[15px] font-extrabold text-white mb-6 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
            Tactical Profile
          </h3>
          <div className="space-y-4">
            <TacticalRow label="Exact Position" val={player.position} />
            <TacticalRow label="Primary Role" val={player.role} />
            <TacticalRow label="Secondary Role" val={player.secondaryRole} />
            <TacticalRow label="Role Confidence" val={player.confidence} />
            <TacticalRow label="Reliability" val={player.reliability} />
          </div>
        </div>

        {/* Role Fit */}
        <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
          <h3 className="text-[15px] font-extrabold text-white mb-6 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
            Role Fit
          </h3>
          <div className="space-y-5 mt-4">
            {player.roleFit.map((rf: any) => (
              <RoleFitBar key={rf.role} role={rf.role} score={rf.score} />
            ))}
          </div>
        </div>
      </div>

      {/* Position Radar */}
      <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
        <h3 className="text-lg font-extrabold text-white mb-1 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-cyan-400 rounded-full"></div>
          Position Radar
        </h3>
        <div className="text-[13px] text-slate-400 mb-8 pl-3.5 font-medium">Attacking Midfield Profile / Advanced Creator</div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 relative bg-[#0F1423]/50 rounded-[20px] border border-white/5 p-4 shadow-inner flex items-center justify-center min-h-[350px]">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius={100} data={player.radar.map((d: any, i: number) => ({ ...d, id: `point-${i}` }))}>
                <PolarGrid key="grid" polarRadius={[20, 40, 60, 80, 100]} stroke="#2A3655" strokeDasharray="3 3" />
                <PolarRadiusAxis key="axis-radius" angle={30} domain={[0, 100]} tickCount={6} tick={false} axisLine={false} />
                <PolarAngleAxis key="axis-angle" dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} tickSize={14} />
                <Radar key="radar-poly" name={player.name} dataKey="val" stroke="#00E5FF" strokeWidth={2} fill="url(#radarGradient)" fillOpacity={1} dot={{ r: 3, fill: '#00E5FF', strokeWidth: 0 }} isAnimationActive={false} />
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <p className="text-[13px] text-slate-300 mb-8 leading-relaxed bg-[#0F1423] p-5 rounded-xl border border-white/5 shadow-inner">
              CAM radar uses role-specific dimensions derived from the same normalized profile data that powers OVR, role fit, and category analysis.
            </p>
            
            <h4 className="text-[10px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-4">PRIMARY STRENGTHS</h4>
            <div className="flex gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#151C2D] to-[#0A0F1C] border border-white/5 rounded-xl p-5 flex-1 shadow-md hover:-translate-y-1 transition-transform duration-300">
                <div className="text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wide">Final Third Delivery</div>
                <div className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.2)]">96</div>
              </div>
              <div className="bg-gradient-to-br from-[#151C2D] to-[#0A0F1C] border border-white/5 rounded-xl p-5 flex-1 shadow-md hover:-translate-y-1 transition-transform duration-300">
                <div className="text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wide">Creativity</div>
                <div className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.2)]">95</div>
              </div>
            </div>
            
            <h4 className="text-[10px] font-extrabold text-orange-400/80 uppercase tracking-[0.2em] mb-4">WATCH AREA</h4>
            <div className="bg-gradient-to-br from-[#151C2D] to-[#0A0F1C] border border-orange-500/20 rounded-xl p-5 w-[calc(50%-0.5rem)] shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wide">Possession</div>
              <div className="text-3xl font-black text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.2)]">52</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisTab() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="text-[10px] text-cyan-400/80 uppercase tracking-[0.2em] font-extrabold mb-2">ANALYSIS</div>
        <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Deep Player Analysis</h2>
        <p className="text-[13px] text-slate-400 max-w-3xl leading-relaxed">Role fit, scouting context, advanced metrics, and report entry points stay here while Similar Players now has its own dedicated top-level tab.</p>
      </div>

      <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
        <div className="text-[10px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-2">PLAYER INTELLIGENCE</div>
        <h3 className="text-xl font-extrabold text-white mb-3">Scouting Insights</h3>
        <p className="text-[13px] text-slate-400 mb-8 max-w-2xl leading-relaxed">Compact role-based intelligence across strengths, positional context, and data risk so the page stays readable.</p>
        
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-6">
          <button className="text-[13px] font-bold px-5 py-2.5 bg-gradient-to-r from-[#1A2235] to-[#1E293B] text-white rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.05)] transition-all">Strengths & Weaknesses</button>
          <button className="text-[13px] font-bold px-5 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full border border-transparent transition-all">League Context</button>
          <button className="text-[13px] font-bold px-5 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full border border-transparent transition-all">Risk & Suitability</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#151C2D] to-[#0A0F1C] border border-white/5 rounded-xl p-5 shadow-inner">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">Profile Shape</div>
            <div className="text-lg font-black text-white">Specialist</div>
          </div>
          <div className="bg-gradient-to-br from-[#151C2D] to-[#0A0F1C] border border-white/5 rounded-xl p-5 shadow-inner">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">Confidence</div>
            <div className="text-lg font-black text-emerald-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              High confidence
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="text-[10px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-4">STRENGTHS</div>
            <StrengthBox title="Premium supply profile" desc="96th percentile against Bundesliga CAMs, giving the advanced creator profile clear value in creativity." />
            <StrengthBox title="Strong final-third delivery" desc="96th percentile against Bundesliga CAMs, giving the advanced creator profile clear value in final third delivery." />
            <StrengthBox title="Reliable wide carrying threat" desc="93rd percentile against Bundesliga CAMs, giving the advanced creator profile clear value in carry threat." />
          </div>
          <div className="flex-1 space-y-4">
            <div className="text-[10px] font-extrabold text-orange-400/80 uppercase tracking-[0.2em] mb-4">WATCH AREAS</div>
            <div className="bg-gradient-to-br from-[#1A1423] to-[#110C16] border border-orange-500/30 rounded-xl p-6 shadow-lg relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="text-[15px] font-extrabold text-white mb-3 relative z-10">Passive defensive output</div>
              <p className="text-[13px] text-slate-400 leading-relaxed relative z-10">100th percentile against Bundesliga CAMs, which keeps the advanced creator profile from being more complete in defending. The supporting evidence is softer in possessions lost and pass completion %.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
        <div className="text-[10px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-2">RECRUITMENT INTELLIGENCE</div>
        <h3 className="text-xl font-extrabold text-white mb-3">Team Fit</h3>
        <p className="text-[13px] text-slate-400 mb-8 max-w-2xl leading-relaxed">Evaluate how the player fits a specific team, what role he would fill, and which alternative profiles also solve that job.</p>
        
        <div className="text-[13px] font-semibold text-slate-300 mb-3">Evaluate for team</div>
        <div className="w-full max-w-md bg-[#0A0F1C] border border-white/10 hover:border-cyan-500/30 rounded-xl px-5 py-3.5 mb-8 flex justify-between items-center text-[13px] font-bold text-white shadow-inner cursor-pointer transition-colors group">
          Bochum (Bundesliga) <ChevronDown className="size-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] border border-white/5 rounded-xl p-6 flex flex-col justify-center shadow-md hover:-translate-y-1 transition-transform">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">Fit Score</div>
            <div className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.2)] mb-2">80</div>
            <div className="text-[11px] text-white font-bold bg-white/5 w-fit px-2.5 py-1 rounded">Strong fit</div>
          </div>
          <div className="bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] border border-white/5 rounded-xl p-6 flex flex-col justify-center shadow-md hover:-translate-y-1 transition-transform">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">Best Role</div>
            <div className="text-lg font-black text-white leading-tight">Advanced Creator in CAM</div>
          </div>
          <div className="bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] border border-white/5 rounded-xl p-6 flex flex-col justify-center shadow-md hover:-translate-y-1 transition-transform">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">Target Slot</div>
            <div className="text-3xl font-black text-white">CAM</div>
          </div>
          <div className="bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] border border-white/5 rounded-xl p-6 flex flex-col justify-center shadow-md hover:-translate-y-1 transition-transform">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">Squad Impact</div>
            <div className="text-lg font-black text-white leading-tight">Depth option</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimilarPlayersTab() {
  return (
    <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
      <div className="text-[10px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-2">SCOUTING MATCHES</div>
      <h3 className="text-xl font-extrabold text-white mb-3">Similar Players</h3>
      <p className="text-[13px] text-slate-400 mb-8 max-w-3xl leading-relaxed">Find role-aware stylistic matches, younger alternatives, same-level options, and higher-level versions without drifting away from the player's real tactical lane.</p>

      <div className="space-y-6">
        <SimilarPlayerCard 
          name="Bruno Fernandes" 
          matchPct={98} 
          role="CAM • Advanced Creator" 
          club="Manchester Utd / Premier League" 
          ovr={91} 
          level={90} 
          shared="Creativity, Final Third Delivery, Key passes" 
          diff="Goals is stronger" 
        />
        <SimilarPlayerCard 
          name="Xavi Simons" 
          matchPct={98} 
          role="CAM • Advanced Creator" 
          club="RB Leipzig / Bundesliga" 
          ovr={91} 
          level={90} 
          shared="Creativity, Attack, Final Third Delivery" 
          diff="Possession is softer" 
        />
      </div>
    </div>
  );
}

/* HELPER COMPONENTS */

const InfoBox = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-[#151C2D]/50 border border-white/5 rounded-xl p-4 flex flex-col justify-center hover:bg-[#151C2D] transition-colors">
    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.1em] mb-1.5">{label}</div>
    <div className="text-[15px] font-bold text-white">{value}</div>
  </div>
);

const SidebarInfoBox = ({ label, value, isCyan = false }: { label: string, value: string | number, isCyan?: boolean }) => (
  <div className="bg-[#0A0F1C]/80 border border-white/5 rounded-xl p-3.5 hover:border-white/10 transition-colors">
    <div className="text-[10px] text-slate-500 uppercase tracking-[0.1em] font-extrabold mb-1.5">{label}</div>
    <div className={clsx("text-[13px] font-bold truncate", isCyan ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(0,229,255,0.2)]" : "text-white")}>{value}</div>
  </div>
);

const GoallineProgress = ({ score }: { score: number }) => {
  const size = 130;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  
  return (
    <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-2xl">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#151C2D" strokeWidth={strokeWidth} />
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={radius} 
          fill="none" 
          stroke="url(#progressGradient)" 
          strokeWidth={strokeWidth} 
          strokeDasharray={circ} 
          strokeDashoffset={offset} 
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff9d" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center scale-100 group-hover:scale-110 transition-transform duration-300">
        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-extrabold uppercase tracking-[0.2em] mb-0.5">
          GOALLINE
        </div>
        <span className="text-[40px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none tracking-tighter drop-shadow-sm">{score}</span>
      </div>
    </div>
  );
};

const StatBlock = ({ label, val }: { label: string, val: number }) => (
  <div className="bg-gradient-to-br from-[#151C2D] to-[#0A0F1C] rounded-xl p-6 border border-white/5 flex flex-col justify-between shadow-md hover:-translate-y-1 transition-transform duration-300 group">
    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cyan-400 transition-colors">{label}</span>
    <span className="text-4xl font-black text-white mt-4 leading-none">{val}</span>
  </div>
);

const TacticalRow = ({ label, val }: { label: string, val: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group">
    <span className="text-[13px] text-slate-400 font-medium group-hover:text-slate-300 transition-colors">{label}</span>
    <span className="text-[13px] text-white font-bold">{val}</span>
  </div>
);

const RoleFitBar = ({ role, score }: { role: string, score: number }) => (
  <div className="group cursor-default">
    <div className="flex justify-between items-end mb-2.5">
      <span className="text-[13px] font-bold text-slate-300 group-hover:text-white transition-colors">{role}</span>
      <span className="text-[13px] font-black text-white">{score.toFixed(1)}</span>
    </div>
    <div className="h-2.5 w-full bg-[#0A0F1C] rounded-full overflow-hidden border border-white/5 shadow-inner">
      <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%` }}></div>
    </div>
  </div>
);

const StrengthBox = ({ title, desc }: { title: string, desc: string }) => (
  <div className="bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] border border-cyan-500/20 rounded-xl p-6 shadow-md hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300">
    <div className="text-[15px] font-extrabold text-white mb-2">{title}</div>
    <p className="text-[13px] text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const SimilarPlayerCard = ({ name, matchPct, role, club, ovr, level, shared, diff }: any) => (
  <div className="bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] border border-white/5 hover:border-cyan-500/20 rounded-[20px] p-6 sm:p-8 shadow-xl transition-all duration-300 group">
    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-6">
      <div>
        <h4 className="text-2xl font-black text-white mb-2 group-hover:text-cyan-50 transition-colors">{name}</h4>
        <div className="text-[13px] text-cyan-400 font-bold mb-1.5">{role}</div>
        <div className="text-[13px] text-slate-400 font-medium">{club}</div>
      </div>
      <div className="text-left md:text-right bg-[#151C2D] px-5 py-3 rounded-xl border border-white/5 shadow-inner">
        <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em] mb-1.5">Style Match</div>
        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{matchPct}%</div>
      </div>
    </div>

    <div className="flex flex-col lg:flex-row gap-4 mb-8">
      <div className="flex-1 bg-[#131A2B]/80 border border-white/5 rounded-xl p-5 shadow-inner">
        <div className="text-[10px] text-cyan-400/80 uppercase tracking-[0.2em] font-extrabold mb-3">SHARED TRAITS</div>
        <div className="flex gap-2 flex-wrap">
          {shared.split(', ').map((s: string) => <span key={s} className="px-4 py-1.5 bg-white/5 rounded-full text-[11px] text-slate-200 font-bold border border-white/5">{s}</span>)}
        </div>
      </div>
      <div className="flex-1 bg-[#131A2B]/80 border border-white/5 rounded-xl p-5 shadow-inner">
        <div className="text-[10px] text-orange-400/80 uppercase tracking-[0.2em] font-extrabold mb-3">KEY DIFFERENCE</div>
        <div className="px-4 py-1.5 bg-orange-500/10 text-orange-200 rounded-full text-[11px] font-bold border border-orange-500/20 w-fit">{diff}</div>
      </div>
    </div>

    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[13px] font-bold text-white transition-colors flex items-center gap-2 group/btn">
      Open Profile <ExternalLink className="size-4 text-slate-400 group-hover/btn:text-cyan-400 transition-colors" />
    </button>
  </div>
);