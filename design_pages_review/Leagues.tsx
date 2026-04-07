import { Info } from "lucide-react";
import { MOCK_PLAYERS } from "../data/mock";
import { PlayerHoverCard } from "../components/PlayerHoverCard";
import { TeamCard } from "../components/TeamCard";
import { Link } from "react-router";

const TEAMS_DATA = [
  { id: '1', badge: 'AR', name: 'Arsenal', league: 'Premier League', country: 'England', rating: 88, manager: 'Mikel Arteta', formation: '4-3-3', strongestLine: 'Attack', formationFit: '82%', profileText: 'Balanced side with mixed creation and control profiles', form: ['W', 'W', 'W', 'W', 'L'] },
  { id: '2', badge: 'AV', name: 'Aston Villa', league: 'Premier League', country: 'England', rating: 88, manager: 'Unknown', formation: '4-3-3', strongestLine: 'Midfield', formationFit: '83%', profileText: 'Balanced side with mixed creation and control profiles', form: ['N/A'] },
  { id: '3', badge: 'BO', name: 'Bournemouth', league: 'Premier League', country: 'England', rating: 89, manager: 'Unknown', formation: '5-2-3', strongestLine: 'Midfield', formationFit: '86%', profileText: 'Balanced side with mixed creation and control profiles', form: ['N/A'] },
  { id: '4', badge: 'BR', name: 'Brentford', league: 'Premier League', country: 'England', rating: 89, manager: 'Unknown', formation: '4-3-3', strongestLine: 'Midfield', formationFit: '86%', profileText: 'Balanced side with mixed creation and control profiles', form: ['N/A'] }
];

const LEADERBOARDS = [
  {
    title: 'Top Scorers',
    metric: 'Goals',
    players: [
      { id: 'l1', rank: 1, name: 'Erling Haaland', teamBadge: 'MC', team: 'Manchester City', role: 'ST - Complete Forward', value: 27, valueColor: 'text-emerald-400' },
      { id: 'l2', rank: 2, name: 'Cole Palmer', teamBadge: 'CH', team: 'Chelsea', role: 'RW - Wide Creator', value: 22, valueColor: 'text-emerald-400' },
      { id: 'l3', rank: 3, name: 'Alexander Isak', teamBadge: 'NU', team: 'Newcastle Utd', role: 'ST - Complete Forward', value: 21, valueColor: 'text-emerald-400' },
      { id: 'l4', rank: 4, name: 'Dominic Solanke', teamBadge: 'BO', team: 'Bournemouth', role: 'ST - Complete Forward', value: 19, valueColor: 'text-emerald-400' },
      { id: 'l5', rank: 5, name: 'Ollie Watkins', teamBadge: 'AV', team: 'Aston Villa', role: 'ST - Complete Forward', value: 19, valueColor: 'text-emerald-400' },
    ]
  },
  {
    title: 'Top Assisters',
    metric: 'Assists',
    players: [
      { id: 'l6', rank: 1, name: 'Ollie Watkins', teamBadge: 'AV', team: 'Aston Villa', role: 'ST - Complete Forward', value: 13, valueColor: 'text-emerald-400' },
      { id: 'l7', rank: 2, name: 'Cole Palmer', teamBadge: 'CH', team: 'Chelsea', role: 'RW - Wide Creator', value: 11, valueColor: 'text-emerald-400' },
      { id: 'l8', rank: 3, name: 'Anthony Gordon', teamBadge: 'NU', team: 'Newcastle Utd', role: 'LW - Balanced Winger', value: 10, valueColor: 'text-emerald-400' },
      { id: 'l9', rank: 4, name: 'Brennan Johnson', teamBadge: 'TO', team: 'Tottenham', role: 'RW - Balanced Winger', value: 10, valueColor: 'text-emerald-400' },
      { id: 'l10', rank: 5, name: 'Kevin De Bruyne', teamBadge: 'MC', team: 'Manchester City', role: 'CAM - Advanced Creator', value: 10, valueColor: 'text-emerald-400' },
    ]
  },
  {
    title: 'Highest OVR',
    metric: 'Final OVR',
    players: [
      { id: 'l11', rank: 1, name: 'Martin Ødegaard', teamBadge: 'AR', team: 'Arsenal', role: 'CAM - Advanced Creator', value: 92, valueColor: 'text-emerald-400' },
      { id: 'l12', rank: 2, name: 'Bruno Fernandes', teamBadge: 'MU', team: 'Manchester Utd', role: 'CAM - Advanced Creator', value: 91, valueColor: 'text-emerald-400' },
      { id: 'l13', rank: 3, name: 'Declan Rice', teamBadge: 'AR', team: 'Arsenal', role: 'CM - Two-Way CM', value: 90, valueColor: 'text-emerald-400' },
      { id: 'l14', rank: 4, name: 'Bruno Guimarães', teamBadge: 'NU', team: 'Newcastle Utd', role: 'CM - Two-Way CM', value: 89, valueColor: 'text-emerald-400' },
      { id: 'l15', rank: 5, name: 'Cole Palmer', teamBadge: 'CH', team: 'Chelsea', role: 'RW - Wide Creator', value: 89, valueColor: 'text-emerald-400' },
    ]
  },
  {
    title: 'Most Creative',
    metric: 'Creator Index',
    players: [
      { id: 'l16', rank: 1, name: 'Bruno Fernandes', teamBadge: 'MU', team: 'Manchester Utd', role: 'CAM - Advanced Creator', value: 968.2, valueColor: 'text-emerald-400' },
      { id: 'l17', rank: 2, name: 'Martin Ødegaard', teamBadge: 'AR', team: 'Arsenal', role: 'CAM - Advanced Creator', value: 915, valueColor: 'text-emerald-400' },
      { id: 'l18', rank: 3, name: 'Pascal Groß', teamBadge: 'BR', team: 'Brighton', role: 'CM - Deep Playmaker', value: 873.3, valueColor: 'text-emerald-400' },
      { id: 'l19', rank: 4, name: 'Bukayo Saka', teamBadge: 'AR', team: 'Arsenal', role: 'RW - Wide Creator', value: 821, valueColor: 'text-emerald-400' },
      { id: 'l20', rank: 5, name: 'Andreas Pereira', teamBadge: 'FU', team: 'Fulham', role: 'CAM - Advanced Creator', value: 728.4, valueColor: 'text-emerald-400' },
    ]
  },
  {
    title: 'Best Progressors',
    metric: 'Progression Index',
    players: [
      { id: 'l21', rank: 1, name: 'Rodri', teamBadge: 'MC', team: 'Manchester City', role: 'DM - Regista', value: 489.6, valueColor: 'text-emerald-400' },
      { id: 'l22', rank: 2, name: 'Martin Ødegaard', teamBadge: 'AR', team: 'Arsenal', role: 'CAM - Advanced Creator', value: 469.4, valueColor: 'text-emerald-400' },
      { id: 'l23', rank: 3, name: 'Pascal Groß', teamBadge: 'BR', team: 'Brighton', role: 'CM - Deep Playmaker', value: 415.2, valueColor: 'text-emerald-400' },
      { id: 'l24', rank: 4, name: 'Bruno Fernandes', teamBadge: 'MU', team: 'Manchester Utd', role: 'CAM - Advanced Creator', value: 412.7, valueColor: 'text-emerald-400' },
      { id: 'l25', rank: 5, name: 'Declan Rice', teamBadge: 'AR', team: 'Arsenal', role: 'CM - Two-Way CM', value: 380.8, valueColor: 'text-emerald-400' },
    ]
  },
  {
    title: 'Best Defenders',
    metric: 'Defender Index',
    players: [
      { id: 'l26', rank: 1, name: 'Antonee Robinson', teamBadge: 'FU', team: 'Fulham', role: 'LB - Attacking Full-Back', value: 272.9, valueColor: 'text-emerald-400' },
      { id: 'l27', rank: 2, name: 'James Tarkowski', teamBadge: 'EV', team: 'Everton', role: 'CB - Stopper', value: 269.5, valueColor: 'text-emerald-400' },
      { id: 'l28', rank: 3, name: 'Joachim Andersen', teamBadge: 'CP', team: 'Crystal Palace', role: 'CB - Stopper', value: 250.7, valueColor: 'text-emerald-400' },
      { id: 'l29', rank: 4, name: 'Jarrad Branthwaite', teamBadge: 'EV', team: 'Everton', role: 'CB - Stopper', value: 227.1, valueColor: 'text-emerald-400' },
      { id: 'l30', rank: 5, name: 'Murillo', teamBadge: 'NF', team: 'Nott\'ham Forest', role: 'CB - Stopper', value: 226.2, valueColor: 'text-emerald-400' },
    ]
  }
];

const EXPLORER_PLAYERS = [
  { id: 'e1', name: 'Martin Ødegaard', badge: 'AR', role: 'CAM - Advanced Creator', team: 'Arsenal', league: 'Premier League', ovr: 92, confidence: 'Hybrid', finalOvr: 92, goals: 8, assists: 10,
    fullPlayer: MOCK_PLAYERS[0]
  },
  { id: 'e2', name: 'Bruno Fernandes', badge: 'MU', role: 'CAM - Advanced Creator', team: 'Manchester Utd', league: 'Premier League', ovr: 91, confidence: 'Hybrid', finalOvr: 91, goals: 10, assists: 8,
    fullPlayer: MOCK_PLAYERS[1]
  },
  { id: 'e3', name: 'Declan Rice', badge: 'AR', role: 'CM - Two-Way CM', team: 'Arsenal', league: 'Premier League', ovr: 90, confidence: 'Hybrid', finalOvr: 90, goals: 7, assists: 8,
    fullPlayer: MOCK_PLAYERS[4]
  },
  { id: 'e4', name: 'Bruno Guimarães', badge: 'NU', role: 'CM - Two-Way CM', team: 'Newcastle Utd', league: 'Premier League', ovr: 89, confidence: 'Hybrid', finalOvr: 89, goals: 6, assists: 7,
    fullPlayer: MOCK_PLAYERS[0] // fallback
  }
];

export function Leagues() {
  return (
    <div className="min-h-screen bg-[#0B101E] text-slate-200 font-sans pb-32 selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-10 space-y-8">
        
        {/* Header section */}
        <div className="bg-[#131A2B]/80 backdrop-blur-md rounded-[32px] border border-white/5 p-8 sm:p-10 flex flex-col xl:flex-row justify-between items-start xl:items-center shadow-2xl relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-500 gap-8">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/4 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex gap-6 items-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl flex items-center justify-center font-black text-white text-3xl border border-white/10 shadow-lg relative clip-shield">
               <div className="absolute inset-[-2px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full -z-10 blur-[2px]"></div>
               PL
            </div>
            <div>
              <p className="text-cyan-400/80 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">League Detail</p>
              <h1 className="text-5xl font-black text-white tracking-tight mb-2 drop-shadow-sm">Premier League</h1>
              <p className="text-slate-400 text-sm font-medium">England / 2023-2024 / 1st Division</p>
              <div className="flex gap-3 mt-5">
                <button className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-white text-[13px] font-bold hover:bg-white/10 transition-colors uppercase tracking-wide">
                  All leagues
                </button>
                <Link to="/compare" className="px-5 py-2.5 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-50 text-[13px] font-bold hover:from-cyan-500/30 hover:to-emerald-500/30 transition-colors uppercase tracking-wide shadow-[0_0_15px_rgba(0,229,255,0.15)] flex items-center gap-2">
                  Open compare
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-8 xl:gap-12 relative z-10 bg-[#0A0F1C] p-6 rounded-[20px] border border-white/5 shadow-inner">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">Players</p>
              <p className="text-white text-2xl font-black">516</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">Clubs</p>
              <p className="text-white text-2xl font-black">20</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">Average OVR</p>
              <p className="text-emerald-400 text-2xl font-black drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">72.1</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">Top Rated</p>
              <p className="text-white text-2xl font-black">Martin Ødegaard (92)</p>
            </div>
          </div>
        </div>

        {/* Tactical Units - Teams Grid */}
        <div className="bg-[#131A2B]/80 backdrop-blur-md rounded-[32px] border border-white/5 p-8 sm:p-10 shadow-2xl hover:border-cyan-500/10 transition-colors duration-500">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4 sm:gap-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-cyan-400 rounded-full"></div>
              <h2 className="text-cyan-400/80 text-[11px] font-extrabold tracking-[0.2em] uppercase">Tactical Units</h2>
            </div>
            <p className="text-slate-400 text-[13px] font-bold bg-[#0A0F1C] px-4 py-2 rounded-xl shadow-inner">20 club profiles</p>
          </div>
          <h3 className="text-3xl font-black text-white mb-8">Teams</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {TEAMS_DATA.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>

        {/* League Insights - Leaderboards Grid */}
        <div className="bg-[#131A2B]/80 backdrop-blur-md rounded-[32px] border border-white/5 p-8 sm:p-10 shadow-2xl hover:border-cyan-500/10 transition-colors duration-500">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
              <h2 className="text-cyan-400/80 text-[11px] font-extrabold tracking-[0.2em] uppercase">League Insights</h2>
            </div>
            <h3 className="text-3xl font-black text-white">Leaderboards</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {LEADERBOARDS.map((board, idx) => (
              <div key={idx} className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] rounded-[24px] border border-white/5 p-6 shadow-lg hover:border-cyan-500/20 transition-all duration-300 group">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                  <h4 className="text-white font-black text-base">{board.title}</h4>
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider bg-[#0A0F1C] px-3 py-1 rounded-md shadow-inner">{board.metric}</span>
                </div>
                
                <div className="space-y-4">
                  {board.players.map((player) => (
                    <div key={player.id} className="flex items-center gap-4 group/row hover:bg-white/[0.02] p-2 -mx-2 rounded-xl transition-colors">
                      <span className="text-slate-500 font-black text-[13px] w-4 text-center group-hover/row:text-cyan-400 transition-colors">{player.rank}</span>
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl flex items-center justify-center font-black text-slate-300 text-[11px] border border-white/10 shadow-inner shrink-0">
                        {player.teamBadge}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h5 className="text-white font-bold text-[14px] truncate">{player.name}</h5>
                        <p className="text-slate-400 text-[11px] truncate mt-0.5">{player.role}</p>
                      </div>
                      <span className={`font-black text-lg ${player.valueColor} drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]`}>{player.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explorer Controls */}
        <div className="bg-[#131A2B]/80 backdrop-blur-md rounded-[32px] border border-white/5 p-8 sm:p-10 shadow-2xl hover:border-cyan-500/10 transition-colors duration-500">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
                <h2 className="text-cyan-400/80 text-[11px] font-extrabold tracking-[0.2em] uppercase">Explorer Controls</h2>
              </div>
              <h3 className="text-3xl font-black text-white">Filter And Rank</h3>
            </div>
            <button className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-white text-[11px] font-extrabold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Reset filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-8">
            {['Top Rated', 'Top Scorers', 'Top Assisters', 'Best Creators', 'Best Progressors', 'Best Defenders', 'Best By Tactical Role'].map((btn, i) => (
              <button key={i} className={`px-5 py-2.5 rounded-full border text-[12px] font-bold transition-all shadow-sm ${i === 0 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.1)]' : 'bg-[#0A0F1C] border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/[0.02]'}`}>
                {btn}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[
              { label: 'Search', type: 'input', placeholder: 'Search player or club' },
              { label: 'Club', type: 'select', options: ['All Clubs'] },
              { label: 'Exact Position', type: 'select', options: ['All Positions'] },
              { label: 'Position Group', type: 'select', options: ['All Position Groups'] },
              { label: 'Nation', type: 'select', options: ['All Nations'] },
              { label: 'Primary Role', type: 'select', options: ['All Primary Roles'] },
              { label: 'Secondary Role', type: 'select', options: ['All Secondary Roles'] },
              { label: 'Role Confidence', type: 'select', options: ['Any Confidence'] },
              { label: 'Age Min', type: 'input', placeholder: 'Any' },
              { label: 'Age Max', type: 'input', placeholder: 'Any' },
            ].map((field, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest pl-1">{field.label}</label>
                {field.type === 'input' ? (
                  <input type="text" placeholder={field.placeholder} className="w-full bg-[#0A0F1C] border border-white/5 rounded-[12px] px-4 py-3 text-[13px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 shadow-inner transition-colors" />
                ) : (
                  <select className="w-full bg-[#0A0F1C] border border-white/5 rounded-[12px] px-4 py-3 text-[13px] font-bold text-white focus:outline-none focus:border-cyan-500/50 shadow-inner transition-colors appearance-none bg-no-repeat" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: "right 1rem center" }}>
                    {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                )}
              </div>
            ))}
            
            <div className="space-y-2 lg:col-start-1 lg:col-span-2 mt-4">
              <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest pl-1">Sort By</label>
              <select className="w-full bg-[#0A0F1C] border border-white/5 rounded-[12px] px-4 py-3 text-[13px] font-bold text-white focus:outline-none focus:border-cyan-500/50 shadow-inner transition-colors appearance-none bg-no-repeat" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: "right 1rem center" }}>
                <option>Overall Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* League Explorer - Players List */}
        <div className="bg-[#131A2B]/80 backdrop-blur-md rounded-[32px] border border-white/5 p-8 sm:p-10 shadow-2xl hover:border-cyan-500/10 transition-colors duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
                <h2 className="text-cyan-400/80 text-[11px] font-extrabold tracking-[0.2em] uppercase">League Explorer</h2>
              </div>
              <h3 className="text-3xl font-black text-white">Players</h3>
            </div>
            <p className="text-slate-400 text-[13px] font-bold bg-[#0A0F1C] px-5 py-2.5 rounded-xl shadow-inner">Showing <span className="text-white">24</span> of 516</p>
          </div>
          
          <div className="space-y-4">
            {EXPLORER_PLAYERS.map(player => (
              <div key={player.id} className="bg-gradient-to-br from-[#1A2235] to-[#151C2D] rounded-[20px] border border-white/5 p-5 flex flex-col xl:flex-row items-start xl:items-center gap-6 hover:border-cyan-500/30 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-5 w-full xl:w-[350px] shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center font-black text-white text-sm shadow-inner shrink-0 border border-white/10" style={{ clipPath: "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)" }}>
                    {player.badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-black text-[15px] leading-tight truncate group-hover:text-cyan-50 transition-colors">{player.name}</h4>
                    <p className="text-cyan-400 text-[11px] font-bold mt-1 truncate uppercase tracking-widest">{player.role}</p>
                    <p className="text-slate-400 text-[11px] font-medium mt-0.5 truncate">{player.team} / {player.league}</p>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
                  <PlayerHoverCard player={player.fullPlayer}>
                    <div className="bg-[#0A0F1C] rounded-[12px] p-3 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors shadow-inner h-full">
                      <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">OVR <Info className="w-3 h-3 text-slate-600" /></span>
                      <span className="text-white font-black text-lg drop-shadow-sm">{player.ovr}</span>
                    </div>
                  </PlayerHoverCard>
                  <div className="bg-[#0A0F1C] rounded-[12px] p-3 border border-white/5 flex flex-col justify-center shadow-inner h-full">
                    <span className="text-slate-500 text-[9px] font-extrabold uppercase tracking-widest mb-1">Confidence</span>
                    <span className="text-white font-bold text-[13px] flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      {player.confidence}
                    </span>
                  </div>
                  <div className="bg-[#0A0F1C] rounded-[12px] p-3 border border-white/5 flex flex-col justify-center shadow-inner h-full">
                    <span className="text-slate-500 text-[9px] font-extrabold uppercase tracking-widest mb-1">Final OVR</span>
                    <span className="text-white font-black text-[15px]">{player.finalOvr}</span>
                  </div>
                  <div className="bg-[#0A0F1C] rounded-[12px] p-3 border border-white/5 flex flex-col justify-center shadow-inner h-full">
                    <span className="text-slate-500 text-[9px] font-extrabold uppercase tracking-widest mb-1">Goals</span>
                    <span className="text-emerald-400 font-black text-[15px] drop-shadow-[0_0_5px_rgba(52,211,153,0.2)]">{player.goals}</span>
                  </div>
                  <div className="bg-[#0A0F1C] rounded-[12px] p-3 border border-white/5 flex flex-col justify-center shadow-inner h-full">
                    <span className="text-slate-500 text-[9px] font-extrabold uppercase tracking-widest mb-1">Assists</span>
                    <span className="text-emerald-400 font-black text-[15px] drop-shadow-[0_0_5px_rgba(52,211,153,0.2)]">{player.assists}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}