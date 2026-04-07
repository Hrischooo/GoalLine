import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Search, ChevronDown, Info, SwapHorizontal } from 'lucide-react';
import { cn } from '../components/ui/utils';

export function Compare() {
  const [mode, setMode] = useState<'players' | 'teams'>('players');

  return (
    <div className="min-h-screen bg-[#0B101E] text-slate-200 font-sans pb-32 selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-10">
        <CompareHero mode={mode} setMode={setMode} />
        {mode === 'players' ? <PlayerCompareView /> : <TeamCompareView />}
      </div>
    </div>
  );
}

// ========================
// HERO SECTION
// ========================
function CompareHero({ mode, setMode }: { mode: 'players' | 'teams', setMode: (m: 'players' | 'teams') => void }) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-8">
      <div className="max-w-3xl relative">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
        <h2 className="text-[10px] font-extrabold tracking-[0.2em] text-cyan-400/80 uppercase mb-3 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)] relative z-10">
          {mode === 'players' ? 'Cross-League Compare' : 'Team Comparison'}
        </h2>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] mb-4 tracking-tight drop-shadow-sm relative z-10">
          {mode === 'players' 
            ? 'Scan role identity and output in one view.' 
            : 'Compare team structure, depth, and recruitment pressure.'}
        </h1>
        <p className="text-[13px] text-slate-400 max-w-2xl leading-relaxed relative z-10">
          {mode === 'players'
            ? 'Search any player in the unified database, compare them side by side, and see tactical profile, overall rating, and core production without leaving the page.'
            : 'Mirror two squads side by side and scan the stronger XI, the cleaner tactical profile, the safer depth map, and the clearer recruitment priorities.'}
        </p>
      </div>

      <div className="flex bg-[#131A2B]/80 backdrop-blur-md rounded-[32px] p-2 border border-white/5 shadow-2xl relative z-10 hover:border-cyan-500/20 transition-colors duration-500">
        <button 
          onClick={() => setMode('players')}
          className={cn(
            "flex flex-col items-center justify-center px-8 py-3 rounded-[24px] transition-all duration-500 min-w-[140px]",
            mode === 'players' ? "bg-gradient-to-br from-[#1A2235] to-[#1E293B] border border-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]" : "hover:bg-white/5 border border-transparent"
          )}
        >
          <span className={cn("text-[13px] font-black tracking-wide uppercase transition-colors", mode === 'players' ? "text-cyan-400" : "text-slate-400")}>PLAYERS</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 whitespace-nowrap">Role fit & profile</span>
        </button>
        <button 
          onClick={() => setMode('teams')}
          className={cn(
            "flex flex-col items-center justify-center px-8 py-3 rounded-[24px] transition-all duration-500 min-w-[140px]",
            mode === 'teams' ? "bg-gradient-to-br from-[#1A2235] to-[#1E293B] border border-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]" : "hover:bg-white/5 border border-transparent"
          )}
        >
          <span className={cn("text-[13px] font-black tracking-wide uppercase transition-colors", mode === 'teams' ? "text-cyan-400" : "text-slate-400")}>TEAMS</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 whitespace-nowrap">Squad & depth</span>
        </button>
      </div>
    </div>
  );
}

// ========================
// PLAYER VIEW COMPONENTS
// ========================
function PlayerCompareView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Player Selectors */}
      <div className="flex flex-col lg:flex-row gap-6 relative w-full mb-2">
        <PlayerSelectBox side="A" name="Xavi Simons" role="CAM • Advanced Creator" team="RB Leipzig / Bundesliga" initials="XS" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block bg-[#0B101E] p-2 rounded-full shadow-2xl">
          <button className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-50 text-[11px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-cyan-500/30 transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            Swap sides
          </button>
        </div>
        <PlayerSelectBox side="B" name="Dominic Solanke" role="ST • Complete Forward" team="Bournemouth / Premier League" initials="DS" />
      </div>

      {/* Direct Comparison Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2">
        <PlayerSummaryCard initials="XS" name="Xavi Simons" role="CAM • Advanced Creator" team="RB Leipzig / Bundesliga" ovr={91} pos="CAM" priRole="Advanced Creator" />
        
        <div className="flex flex-col items-center justify-center text-center p-8 bg-[#131A2B]/80 rounded-[24px] border border-white/5 backdrop-blur-md shadow-2xl hover:border-cyan-500/20 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>
          <div className="text-[11px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)] relative z-10">Direct Comparison</div>
          <h3 className="text-2xl font-black text-white leading-tight mb-6 relative z-10 drop-shadow-sm">Compare tactical identity, role fit, and production.</h3>
        </div>

        <PlayerSummaryCard initials="DS" name="Dominic Solanke" role="ST • Complete Forward" team="Bournemouth / Premier League" ovr={86} pos="ST" priRole="Complete Forward" />
      </div>

      {/* Overview Block */}
      <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
        <div className="text-[11px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
          Overview
        </div>
        <h3 className="text-xl font-extrabold text-white mb-8">High-Level Comparison</h3>
        
        <div className="flex flex-col gap-8">
          <ComparisonBarGroup label="Overall" valA={91} valB={86} />
          <ComparisonBarGroup label="Attack" valA={90} valB={93} />
          <ComparisonBarGroup label="Creativity" valA={95} valB={66} />
          <ComparisonBarGroup label="Possession" valA={72} valB={45} />
          <ComparisonBarGroup label="Defending" valA={40} valB={30} />
        </div>
      </div>

      {/* Radar Charts */}
      <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
        <div className="text-[11px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
          Position Radar
        </div>
        <h3 className="text-xl font-extrabold text-white mb-2">Position-aware profile shapes</h3>
        <p className="text-[13px] text-slate-400 mb-8 max-w-3xl leading-relaxed">Position-aware radar charts switch axes by role model, so different positions are shown side by side instead of forced onto one shared shape.</p>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <PlayerRadar 
            name="Xavi Simons" 
            role="Advanced Creator" 
            data={[
              { subject: 'Creativity', val: 95 },
              { subject: 'Attack', val: 85 },
              { subject: 'Progression', val: 88 },
              { subject: 'Final Third Delivery', val: 92 },
              { subject: 'Possession', val: 78 },
              { subject: 'Flair Ball Carrying', val: 94 },
            ]} 
          />
          <PlayerRadar 
            name="Dominic Solanke" 
            role="Complete Forward" 
            data={[
              { subject: 'Finishing', val: 88 },
              { subject: 'Shot Threat', val: 86 },
              { subject: 'Box Presence', val: 90 },
              { subject: 'Link Play', val: 76 },
              { subject: 'Aerial Threat', val: 82 },
              { subject: 'Attack', val: 85 },
            ]} 
          />
        </div>
      </div>

      {/* Advanced Metric Matchup */}
      <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="text-[11px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
              Scouting Comparison
            </div>
            <h3 className="text-xl font-extrabold text-white">Advanced Metric Matchup</h3>
            <p className="text-[13px] text-slate-400 mt-2 max-w-2xl">Mixed positions detected. Bar lengths use role-relative percentiles to keep the comparison honest.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex bg-[#1A2235] rounded-full p-1 border border-white/5 shadow-inner">
              <button className="px-5 py-2 text-[11px] font-extrabold text-slate-400 hover:text-white rounded-full transition-colors uppercase tracking-wider">Basic Stats</button>
              <button className="px-5 py-2 text-[11px] font-extrabold text-cyan-50 bg-cyan-500/10 border border-cyan-500/20 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.1)] uppercase tracking-wider">Advanced Metrics</button>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-300 bg-[#0F1423] px-5 py-2.5 rounded-full border border-white/5 shadow-inner">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>A wins: 19</span>
              <span className="w-px h-3 bg-white/20"></span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400"></div>B wins: 3</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="border border-white/5 rounded-[20px] bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] overflow-hidden shadow-xl hover:border-cyan-500/20 transition-all duration-300">
            <div className="flex justify-between items-center p-6 bg-[#131A2B]/50 border-b border-white/5">
              <div>
                <h4 className="text-[15px] font-extrabold text-white mb-1">Attacking</h4>
                <p className="text-[11px] text-slate-400 font-medium">Shot quality, finishing, and direct goal threat.</p>
              </div>
              <button className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors">Hide</button>
            </div>
            <div className="p-2 flex flex-col">
              <MetricRow label="xG Diff" valA="-0.3" pctA={38} valB="-0.6" pctB={31} />
              <MetricRow label="Finishing Ratio" valA="0.96" pctA={66} valB="0.97" pctB={55} inverse />
              <MetricRow label="Shots On Target %" valA="39.2%" pctA={79} valB="33%" pctB={34} />
              <MetricRow label="Goals / Shot" valA="0.09" pctA={72} valB="0.16" pctB={70} inverse />
              <MetricRow label="xG / Shot" valA="0.1" pctA={75} valB="0.18" pctB={85} inverse />
              <MetricRow label="Goals P90" valA="0.27" pctA={89} valB="0.51" pctB={81} inverse />
              <MetricRow label="Shots P90" valA="1.05" pctA={90} valB="0.95" pctB={58} />
            </div>
          </div>

          <CollapsedMetricGroup title="Playmaking" desc="Chance creation and line-breaking distribution." />
          <CollapsedMetricGroup title="Possession & Dribbling" desc="Ball carrying, retention, and progression under pressure." />
        </div>
      </div>

      {/* Tactical Profile */}
      <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
        <div className="text-[11px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
          Tactical Profile
        </div>
        <h3 className="text-xl font-extrabold text-white mb-6">Side-By-Side Role Identity</h3>
        
        <div className="flex flex-col rounded-[20px] overflow-hidden border border-white/5 bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] shadow-inner">
          <RoleIdentityRow label="Overall Rating" valA="91" valB="86" winA />
          <RoleIdentityRow label="Exact Position" valA="CAM" valB="ST" />
          <RoleIdentityRow label="Primary Role" valA="Advanced Creator" valB="Complete Forward" />
          <RoleIdentityRow label="Secondary Role" valA="Free-Roam Creator" valB="False 9" />
          <RoleIdentityRow label="Role Confidence" valA="Hybrid" valB="Medium" />
        </div>
      </div>
    </div>
  );
}

// ========================
// TEAM VIEW COMPONENTS
// ========================
function TeamCompareView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Team Selectors */}
      <div className="flex flex-col lg:flex-row gap-6 relative w-full mb-2">
        <TeamSelectBox side="A" name="Newcastle Utd" details="Premier League / N/A / 89 OVR" initials="NU" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block bg-[#0B101E] p-2 rounded-full shadow-2xl">
          <button className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-50 text-[11px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-cyan-500/30 transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            Swap teams
          </button>
        </div>
        <TeamSelectBox side="B" name="Manchester City" details="Premier League / 3-2-4-1 / 88 OVR" initials="MC" />
      </div>

      {/* Direct Comparison Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2">
        <TeamSummaryCard initials="NU" name="Newcastle Utd" details="Premier League / Unknown" rating={89} bestXi={89} autoBest="4-3-3" depth={66} />
        
        <div className="flex flex-col items-center justify-center text-center p-8 bg-[#131A2B]/80 rounded-[24px] border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>
          <div className="text-[11px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)] relative z-10">Scout Read</div>
          <h3 className="text-lg font-black text-white leading-tight mb-6 text-left self-start relative z-10">Mirror the current XI, the depth behind it, and the next recruitment pressure points.</h3>
          <div className="flex flex-col gap-3 w-full text-left relative z-10">
            <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] p-4 rounded-xl border border-white/5 text-[13px] text-slate-300 shadow-md font-medium leading-relaxed hover:-translate-y-0.5 transition-transform">Newcastle Utd hold the stronger midfield platform in the current XI.</div>
            <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] p-4 rounded-xl border border-white/5 text-[13px] text-slate-300 shadow-md font-medium leading-relaxed hover:-translate-y-0.5 transition-transform">Newcastle Utd carry the better squad depth and bench stability right now.</div>
            <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] p-4 rounded-xl border border-white/5 text-[13px] text-slate-300 shadow-md font-medium leading-relaxed hover:-translate-y-0.5 transition-transform">Manchester City project more buildup control and retention.</div>
          </div>
        </div>

        <TeamSummaryCard initials="MC" name="Manchester City" details="Premier League / Pep Guardiola" rating={88} bestXi={88} autoBest="4-2-3-1" depth={59} />
      </div>

      {/* Overview Block */}
      <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl hover:border-cyan-500/10 transition-all duration-500">
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-6">
          <button className="px-6 py-2.5 text-[13px] font-extrabold text-white bg-gradient-to-br from-[#1A2235] to-[#1E293B] rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.05)] transition-all">Overview</button>
          <button className="px-6 py-2.5 text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-full border border-transparent transition-all">Tactical Profile</button>
          <button className="px-6 py-2.5 text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-full border border-transparent transition-all">Squad & Depth</button>
          <button className="px-6 py-2.5 text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-full border border-transparent transition-all">Recruitment View</button>
        </div>

        <div className="text-[11px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
          Overview
        </div>
        <h3 className="text-xl font-extrabold text-white mb-8">Current Level & League Context</h3>
        
        <div className="flex flex-col rounded-[20px] overflow-hidden border border-white/5 bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] shadow-inner">
          <TeamContextRow label="Team Rating" sub="Level" valA={89} valB={88} />
          <TeamContextRow label="Best XI Rating" sub="Level" valA={89} valB={88} />
          <TeamContextRow label="Attack Line" sub="2 swing" valA={90} valB={92} />
          <TeamContextRow label="Midfield Line" sub="7 swing" valA={93} valB={86} />
          <TeamContextRow label="Defense Line" sub="Level" valA={85} valB={86} />
          <TeamContextRow label="Goalkeeper" sub="3 swing" valA={82} valB={85} />
          <TeamContextRow label="Depth Score" sub="7 swing" valA={66} valB={59} />
          <TeamContextRow label="Bench Stability" sub="3 swing" valA={65} valB={62} />
        </div>
      </div>

    </div>
  );
}

// ========================
// SHARED UI COMPONENTS
// ========================

function PlayerSelectBox({ side, name, role, team, initials }: any) {
  return (
    <div className="flex-1 bg-[#131A2B]/80 border border-white/5 hover:border-cyan-500/20 rounded-[24px] p-8 backdrop-blur-md shadow-2xl transition-all duration-300 group">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[11px] text-cyan-400/80 font-extrabold uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">Player {side}</span>
        <button className="text-[11px] text-slate-400 hover:text-cyan-400 font-extrabold uppercase tracking-widest transition-colors">Clear</button>
      </div>
      
      <div className="bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] border border-white/5 rounded-2xl p-5 mb-6 flex gap-5 items-center shadow-inner hover:border-white/10 transition-colors cursor-pointer">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center font-black text-white text-lg border border-white/10 shrink-0 shadow-lg relative">
          <div className="absolute inset-[-2px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full -z-10 blur-[2px]"></div>
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="text-base font-black text-white truncate mb-1">{name}</div>
          <div className="text-[11px] text-cyan-400 font-bold truncate mb-0.5">{role}</div>
          <div className="text-[11px] text-slate-400 font-medium truncate">{team}</div>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2 block">Search all players</label>
        <div className="relative">
          <input 
            type="text" 
            value={name} 
            readOnly 
            className="w-full bg-[#1A2235] border border-white/5 rounded-xl py-3 px-4 text-[13px] font-bold text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}

function PlayerSummaryCard({ initials, name, role, team, ovr, pos, priRole }: any) {
  return (
    <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl flex flex-col hover:border-cyan-500/20 transition-all duration-300 group">
      <div className="text-[11px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-8 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">Player {initials === 'XS' ? 'A' : 'B'}</div>
      
      <div className="flex items-center gap-5 mb-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center font-black text-white text-2xl border border-white/10 shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative">
          <div className="absolute inset-[-3px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full -z-10 blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          {initials}
        </div>
        <div className="flex flex-col">
          <div className="text-lg font-black text-white mb-1.5 flex items-center gap-2">
            {name}
          </div>
          <div className="text-[11px] text-cyan-400 font-bold mb-1">{role}</div>
          <div className="text-[11px] text-slate-400 font-medium">{team}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 mt-auto">
        <div className="flex flex-col">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1.5">OVR</div>
          <div className="text-2xl font-black text-white">{ovr}</div>
        </div>
        <div className="flex flex-col">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1.5">Position</div>
          <div className="text-lg font-black text-white">{pos}</div>
        </div>
        <div className="flex flex-col">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1.5">Primary Role</div>
          <div className="text-sm font-black text-white leading-tight">{priRole}</div>
        </div>
      </div>

      <button className="w-full bg-gradient-to-br from-[#1A2235] to-[#1E293B] hover:from-[#1E293B] hover:to-[#253046] border border-white/5 text-white text-[13px] font-bold py-3.5 rounded-xl transition-all shadow-md hover:border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,229,255,0.05)]">
        Open Profile
      </button>
    </div>
  );
}

function ComparisonBarGroup({ label, valA, valB }: any) {
  return (
    <div className="flex flex-col gap-2 mb-2">
      <div className="text-[10px] text-center text-slate-400 font-extrabold uppercase tracking-[0.2em] drop-shadow-md">{label}</div>
      <div className="space-y-[4px]">
        {/* Top Bar - A */}
        <div className="relative h-8 w-full bg-[#0F1423] border border-white/5 rounded-lg flex items-center overflow-hidden shadow-inner group">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg transition-all duration-1000 ease-out" style={{ width: `${valA}%` }}></div>
           <span className="absolute left-4 text-[13px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{valA}</span>
        </div>
        {/* Bottom Bar - B */}
        <div className="relative h-8 w-full bg-[#0F1423] border border-white/5 rounded-lg flex items-center overflow-hidden shadow-inner group">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="h-full bg-gradient-to-r from-[#1E293B] to-[#334155] rounded-lg transition-all duration-1000 ease-out" style={{ width: `${valB}%` }}></div>
           <span className="absolute left-4 text-[13px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{valB}</span>
        </div>
      </div>
    </div>
  );
}

function PlayerRadar({ name, role, data }: any) {
  const chartData = data.map((d: any, i: number) => ({ ...d, id: d.subject || `point-${i}` }));
  
  return (
    <div className="bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] border border-white/5 rounded-[20px] p-6 sm:p-8 shadow-xl hover:border-cyan-500/10 transition-colors duration-500">
      <div className="mb-6 text-center">
        <h4 className="text-xl font-black text-white mb-1.5">{name}</h4>
        <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">{role}</div>
      </div>
      <div className="h-[280px] w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart cx="50%" cy="50%" outerRadius={90} data={chartData}>
            <PolarGrid key="polar-grid" polarRadius={[20, 40, 60, 80, 100]} stroke="#2A3655" strokeDasharray="3 3" />
            <PolarRadiusAxis key="polar-radius" angle={30} domain={[0, 100]} tickCount={6} tick={false} axisLine={false} />
            <PolarAngleAxis key="polar-angle" dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} tickSize={14} />
            <Radar key="radar-polygon" name={name} dataKey="val" stroke="#00E5FF" strokeWidth={2} fill="url(#radarCompareGrad)" fillOpacity={1} dot={{ r: 3, fill: '#00E5FF', strokeWidth: 0 }} isAnimationActive={false} />
            <defs>
              <linearGradient id="radarCompareGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.05} />
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricRow({ label, valA, pctA, valB, pctB, inverse = false }: any) {
  const numValA = parseFloat(valA);
  const numValB = parseFloat(valB);
  let aWins = numValA > numValB;
  let bWins = numValB > numValA;
  if (inverse) {
    aWins = numValA < numValB;
    bWins = numValB < numValA;
  }
  if (isNaN(numValA)) { // string fallback
    aWins = pctA > pctB;
    bWins = pctB > pctA;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-b border-white/5 last:border-0 relative group hover:bg-[#151C2D]/50 transition-colors gap-4 sm:gap-0">
      {/* Player A Stats */}
      <div className="w-full sm:w-[120px] flex items-center justify-between bg-gradient-to-br from-[#151C2D] to-[#0A0F1C] border border-white/5 px-4 py-2 rounded-xl shadow-inner shrink-0 order-2 sm:order-1">
        <span className={cn("text-[15px] font-black", aWins ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]' : 'text-slate-300')}>{valA}</span>
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{pctA}th</span>
      </div>
      
      {/* Center Bar & Label */}
      <div className="flex-1 w-full px-0 sm:px-8 flex flex-col items-center z-10 order-1 sm:order-2">
        <div className="text-[11px] font-bold text-slate-300 mb-3 flex items-center gap-1.5 uppercase tracking-widest">
          {label} <Info size={12} className="text-slate-500" />
        </div>
        
        <div className="w-full flex items-center justify-center h-2 gap-1.5 px-4 sm:px-8">
          {/* A side */}
          <div className="flex-1 flex justify-end h-full bg-[#0A0F1C] rounded-l-full shadow-inner overflow-hidden">
            <div className="h-full bg-gradient-to-l from-emerald-400 to-cyan-500 rounded-l-full transition-all duration-1000 ease-out" style={{ width: `${pctA}%` }}></div>
          </div>
          {/* Center marker */}
          <div className="w-[3px] h-3 bg-slate-500 rounded-full"></div>
          {/* B side */}
          <div className="flex-1 flex justify-start h-full bg-[#0A0F1C] rounded-r-full shadow-inner overflow-hidden">
            <div className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-r-full transition-all duration-1000 ease-out" style={{ width: `${pctB}%` }}></div>
          </div>
        </div>
      </div>
      
      {/* Player B Stats */}
      <div className="w-full sm:w-[120px] flex items-center justify-between bg-gradient-to-br from-[#151C2D] to-[#0A0F1C] border border-white/5 px-4 py-2 rounded-xl shadow-inner shrink-0 order-3">
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{pctB}th</span>
        <span className={cn("text-[15px] font-black", bWins ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]' : 'text-slate-300')}>{valB}</span>
      </div>
    </div>
  );
}

function CollapsedMetricGroup({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] rounded-[20px] border border-white/5 cursor-pointer hover:border-cyan-500/20 shadow-lg transition-all duration-300 group gap-4 sm:gap-0">
       <div>
          <div className="text-[15px] font-extrabold text-white mb-1 group-hover:text-cyan-50 transition-colors">{title}</div>
          <div className="text-[11px] text-slate-400 font-medium">{desc}</div>
       </div>
       <div className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/20 self-start sm:self-auto">Open Group</div>
    </div>
  );
}

function RoleIdentityRow({ label, valA, valB, winA, winB }: any) {
  const isScore = !isNaN(parseFloat(valA));
  let aHigh = winA;
  let bHigh = winB;
  if (isScore && winA === undefined) {
    aHigh = parseFloat(valA) > parseFloat(valB);
    bHigh = parseFloat(valB) > parseFloat(valA);
  }

  return (
    <div className="flex items-center justify-between p-5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
      <div className={cn("text-[13px] font-black flex-1", aHigh ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]" : "text-slate-300")}>{valA}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-extrabold text-center flex-1 group-hover:text-slate-400 transition-colors">{label}</div>
      <div className={cn("text-[13px] font-black flex-1 text-right", bHigh ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]" : "text-slate-300")}>{valB}</div>
    </div>
  );
}

function TeamSelectBox({ side, name, details, initials }: any) {
  return (
    <div className="flex-1 bg-[#131A2B]/80 border border-white/5 hover:border-cyan-500/20 rounded-[24px] p-8 backdrop-blur-md shadow-2xl transition-all duration-300 group">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[11px] text-cyan-400/80 font-extrabold uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">Team {side}</span>
        <button className="text-[11px] text-slate-400 hover:text-cyan-400 font-extrabold uppercase tracking-widest transition-colors">Clear</button>
      </div>
      
      <div className="bg-gradient-to-br from-[#0F1423] to-[#0A0F1C] border border-white/5 rounded-2xl p-5 mb-6 flex gap-5 items-center shadow-inner hover:border-white/10 transition-colors cursor-pointer">
        <div className="w-14 h-16 rounded-t-lg rounded-b-[20px] bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center font-black text-white text-lg border border-white/10 shrink-0 shadow-lg relative clip-shield">
          <div className="absolute inset-[-2px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full -z-10 blur-[2px]"></div>
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="text-base font-black text-white truncate mb-1">{name}</div>
          <div className="text-[11px] text-slate-400 font-medium truncate">{details}</div>
        </div>
      </div>
    </div>
  );
}

function TeamSummaryCard({ initials, name, details, rating, bestXi, autoBest, depth }: any) {
  return (
    <div className="bg-[#131A2B]/80 border border-white/5 rounded-[24px] p-8 backdrop-blur-md shadow-2xl flex flex-col hover:border-cyan-500/20 transition-all duration-300 group">
      <div className="text-[11px] font-extrabold text-cyan-400/80 uppercase tracking-[0.2em] mb-8 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">Team {initials === 'NU' ? 'A' : 'B'}</div>
      
      <div className="flex items-center gap-5 mb-10">
        <div className="w-16 h-20 rounded-t-lg rounded-b-[24px] bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center font-black text-white text-2xl border border-white/10 shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative clip-shield">
          <div className="absolute inset-[-3px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full -z-10 blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          {initials}
        </div>
        <div className="flex flex-col">
          <div className="text-xl font-black text-white mb-1.5">{name}</div>
          <div className="text-[11px] text-slate-400 font-medium">{details}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 mt-auto">
        <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] border border-white/5 rounded-xl p-4 shadow-inner hover:-translate-y-0.5 transition-transform">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-2">Team Rating</div>
          <div className="text-xl font-black text-white">{rating}</div>
        </div>
        <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] border border-white/5 rounded-xl p-4 shadow-inner hover:-translate-y-0.5 transition-transform">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-2">Best XI</div>
          <div className="text-xl font-black text-white">{bestXi}</div>
        </div>
        <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] border border-white/5 rounded-xl p-4 shadow-inner hover:-translate-y-0.5 transition-transform">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-2">Auto Best</div>
          <div className="text-xl font-black text-white">{autoBest}</div>
        </div>
        <div className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] border border-white/5 rounded-xl p-4 shadow-inner hover:-translate-y-0.5 transition-transform">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-2">Depth Score</div>
          <div className="text-xl font-black text-white">{depth}</div>
        </div>
      </div>

      <button className="w-full bg-gradient-to-br from-[#1A2235] to-[#1E293B] hover:from-[#1E293B] hover:to-[#253046] border border-white/5 text-white text-[13px] font-bold py-3.5 rounded-xl transition-all shadow-md hover:border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,229,255,0.05)]">
        Open Team
      </button>
    </div>
  );
}

function TeamContextRow({ label, sub, valA, valB }: any) {
  const numA = parseFloat(valA);
  const numB = parseFloat(valB);
  const aWins = numA > numB;
  const bWins = numB > numA;

  return (
    <div className="flex items-center justify-between p-5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
      <div className={cn("text-[15px] font-black flex-1", aWins ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]" : "text-slate-300")}>{valA}</div>
      <div className="flex flex-col items-center flex-1">
        <div className="text-[13px] text-slate-200 font-bold mb-1 group-hover:text-white transition-colors">{label}</div>
        <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{sub}</div>
      </div>
      <div className={cn("text-[15px] font-black flex-1 text-right", bWins ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]" : "text-slate-300")}>{valB}</div>
    </div>
  );
}
