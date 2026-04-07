import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, ChevronDown, Activity, 
  MoreVertical, Eye, Plus, Star, Shield, Zap, Target,
  Crosshair, Layers, Filter
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router';

// Modes
const MODES = [
  'All Players', 
  'Similar Players', 
  'Role-Based Search', 
  'Team Fit Search', 
  'Hidden Gems', 
  'High Potential'
];

// Smart Filters
const SMART_FILTERS = [
  'Creative CAM',
  'Ball-winning DM',
  'Direct winger',
  'Possession CM',
  'Aerial CB'
];

// Mock Player Data
const MOCK_PLAYERS = [
  {
    id: 1,
    name: "Jude Bellingham",
    team: "Real Madrid",
    position: "CAM",
    ovr: 91,
    role: "Advanced Playmaker",
    strengths: ["Vision", "Finishing", "Creativity"],
    radarData: [
      { subject: 'ATT', A: 88, fullMark: 100 },
      { subject: 'CRE', A: 93, fullMark: 100 },
      { subject: 'POS', A: 90, fullMark: 100 },
      { subject: 'DEF', A: 65, fullMark: 100 },
      { subject: 'PHY', A: 85, fullMark: 100 },
    ]
  },
  {
    id: 2,
    name: "Rodri",
    team: "Man City",
    position: "DM",
    ovr: 92,
    role: "Deep-Lying Playmaker",
    strengths: ["Passing", "Positioning", "Composure"],
    radarData: [
      { subject: 'ATT', A: 70, fullMark: 100 },
      { subject: 'CRE', A: 85, fullMark: 100 },
      { subject: 'POS', A: 96, fullMark: 100 },
      { subject: 'DEF', A: 89, fullMark: 100 },
      { subject: 'PHY', A: 86, fullMark: 100 },
    ]
  },
  {
    id: 3,
    name: "Jamal Musiala",
    team: "Bayern Munich",
    position: "CAM",
    ovr: 89,
    role: "Attacking Midfielder",
    strengths: ["Dribbling", "Agility", "Flair"],
    radarData: [
      { subject: 'ATT', A: 85, fullMark: 100 },
      { subject: 'CRE', A: 91, fullMark: 100 },
      { subject: 'POS', A: 88, fullMark: 100 },
      { subject: 'DEF', A: 50, fullMark: 100 },
      { subject: 'PHY', A: 72, fullMark: 100 },
    ]
  },
  {
    id: 4,
    name: "Bukayo Saka",
    team: "Arsenal",
    position: "RW",
    ovr: 88,
    role: "Direct Winger",
    strengths: ["Pace", "Crossing", "Work Rate"],
    radarData: [
      { subject: 'ATT', A: 87, fullMark: 100 },
      { subject: 'CRE', A: 86, fullMark: 100 },
      { subject: 'POS', A: 82, fullMark: 100 },
      { subject: 'DEF', A: 60, fullMark: 100 },
      { subject: 'PHY', A: 78, fullMark: 100 },
    ]
  },
  {
    id: 5,
    name: "William Saliba",
    team: "Arsenal",
    position: "CB",
    ovr: 87,
    role: "Ball-Playing Defender",
    strengths: ["Tackling", "Strength", "Passing"],
    radarData: [
      { subject: 'ATT', A: 40, fullMark: 100 },
      { subject: 'CRE', A: 60, fullMark: 100 },
      { subject: 'POS', A: 84, fullMark: 100 },
      { subject: 'DEF', A: 90, fullMark: 100 },
      { subject: 'PHY', A: 88, fullMark: 100 },
    ]
  },
  {
    id: 6,
    name: "Rafael Leão",
    team: "AC Milan",
    position: "LW",
    ovr: 88,
    role: "Inside Forward",
    strengths: ["Pace", "Dribbling", "Finishing"],
    radarData: [
      { subject: 'ATT', A: 89, fullMark: 100 },
      { subject: 'CRE', A: 82, fullMark: 100 },
      { subject: 'POS', A: 75, fullMark: 100 },
      { subject: 'DEF', A: 35, fullMark: 100 },
      { subject: 'PHY', A: 84, fullMark: 100 },
    ]
  },
  {
    id: 7,
    name: "Florian Wirtz",
    team: "Bayer Leverkusen",
    position: "CAM",
    ovr: 89,
    role: "Advanced Playmaker",
    strengths: ["Vision", "Passing", "Agility"],
    radarData: [
      { subject: 'ATT', A: 84, fullMark: 100 },
      { subject: 'CRE', A: 94, fullMark: 100 },
      { subject: 'POS', A: 87, fullMark: 100 },
      { subject: 'DEF', A: 55, fullMark: 100 },
      { subject: 'PHY', A: 70, fullMark: 100 },
    ]
  },
  {
    id: 8,
    name: "Declan Rice",
    team: "Arsenal",
    position: "DM",
    ovr: 88,
    role: "Box-to-Box Midfielder",
    strengths: ["Interceptions", "Stamina", "Passing"],
    radarData: [
      { subject: 'ATT', A: 72, fullMark: 100 },
      { subject: 'CRE', A: 76, fullMark: 100 },
      { subject: 'POS', A: 85, fullMark: 100 },
      { subject: 'DEF', A: 88, fullMark: 100 },
      { subject: 'PHY', A: 90, fullMark: 100 },
    ]
  }
];

const FilterSection = ({ title, options, isExpanded = true }: { title: string, options: string[], isExpanded?: boolean }) => {
  const [expanded, setExpanded] = useState(isExpanded);
  
  return (
    <div className="border-b border-border/50 pb-4">
      <button 
        className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {expanded && (
        <div className="mt-3 space-y-2.5">
          {options.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-border/80 flex items-center justify-center group-hover:border-primary transition-colors">
                <div className="w-2 h-2 rounded-sm bg-primary opacity-0 group-hover:opacity-20"></div>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export function ScoutingHubPage() {
  const [activeMode, setActiveMode] = useState(MODES[0]);
  const [activeSmartFilter, setActiveSmartFilter] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 w-full min-h-full">
      
      {/* Header & Navigation */}
      <div className="flex flex-col gap-5 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Scouting Hub
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Discover and evaluate tactical fits across global leagues.
            </p>
          </div>
        </div>

        {/* Modes Segmented Control */}
        <div className="flex bg-card/40 backdrop-blur-sm p-1 rounded-xl w-max overflow-x-auto border border-border/40 shadow-sm">
          {MODES.map(mode => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeMode === mode 
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      
      {/* Search & Smart Filters */}
      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors"/>
            <input 
              placeholder="Search players by name, team, or attributes..."
              className="w-full bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
            />
          </div>
          
          <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl hover:bg-card hover:border-border transition-all shadow-sm text-foreground">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Advanced Filters</span>
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide items-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 flex-shrink-0">
            Smart Filters:
          </span>
          {SMART_FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveSmartFilter(activeSmartFilter === filter ? null : filter)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeSmartFilter === filter
                  ? 'bg-primary/15 border-primary/30 text-primary shadow-[0_0_15px_rgba(0,230,118,0.15)]'
                  : 'bg-card/40 border-border/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-border/80'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Zap className={`w-3 h-3 ${activeSmartFilter === filter ? 'text-primary' : 'text-muted-foreground'}`} />
                {filter}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="flex gap-8 relative z-10 flex-1">
        
        {/* Advanced Filters Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden xl:flex flex-col gap-6">
          <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl p-5 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Filters
              </h3>
              <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Reset
              </button>
            </div>
            
            <div className="space-y-6">
              <FilterSection 
                title="Position" 
                options={['Goalkeeper (GK)', 'Center Back (CB)', 'Fullback (LB/RB)', 'Defensive Mid (DM)', 'Center Mid (CM)', 'Attacking Mid (CAM)', 'Winger (LW/RW)', 'Striker (ST)']} 
                isExpanded={true}
              />
              <FilterSection 
                title="Role / Archetype" 
                options={['Advanced Playmaker', 'Box-to-Box', 'Ball-Winning', 'Deep-Lying Playmaker', 'Inside Forward', 'Target Man']} 
                isExpanded={false}
              />
              <FilterSection 
                title="League" 
                options={['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1']} 
                isExpanded={false}
              />
              
              <div className="border-b border-border/50 pb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-foreground">OVR Range</span>
                  <span className="text-xs text-primary font-mono">75 - 99</span>
                </div>
                <div className="relative w-full h-1.5 bg-muted rounded-full">
                  <div className="absolute left-[25%] right-[0%] h-full bg-primary rounded-full shadow-[0_0_10px_rgba(0,230,118,0.3)]"></div>
                  <div className="absolute left-[25%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 border-primary shadow cursor-pointer"></div>
                  <div className="absolute right-[0%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 border-primary shadow cursor-pointer"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Showing <strong className="text-foreground">{MOCK_PLAYERS.length}</strong> players</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <button className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors bg-card/40 border border-border/40 px-3 py-1.5 rounded-lg">
                Overall (OVR)
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {MOCK_PLAYERS.map(player => (
              <div key={player.id} className="group relative bg-card/60 backdrop-blur-md border border-border/50 hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,230,118,0.06)] flex flex-col">
                
                {/* Header Profile */}
                <div className="p-5 border-b border-border/30 relative">
                  {/* Subtle gradient background based on rating */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-0.5">{player.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-3.5 h-3.5" />
                        {player.team}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-[0_0_15px_rgba(0,230,118,0.1)]">
                        <span className="text-lg font-bold text-primary font-mono">{player.ovr}</span>
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mt-1">{player.position}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/40">
                      {player.role}
                    </span>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="p-4 bg-muted/10 h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={150}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={player.radarData}>
                      <PolarGrid key="grid" stroke="var(--color-border)" strokeDasharray="3 3" />
                      <PolarAngleAxis 
                        key="angle"
                        dataKey="subject" 
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 500 }} 
                      />
                      <PolarRadiusAxis key="radius" angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        key="radar"
                        name={player.name}
                        dataKey="A"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        fill="var(--color-primary)"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Strengths & Actions */}
                <div className="p-5 pt-4 mt-auto">
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Strengths</div>
                    <div className="flex flex-wrap gap-1.5">
                      {player.strengths.map((str, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-background border border-border/50 rounded-md text-foreground">
                          {str}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                    <Link to={`/player/${player.id}`} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-lg text-sm font-semibold transition-colors shadow-[0_0_10px_rgba(0,230,118,0.2)]">
                      <Eye className="w-4 h-4" />
                      View Profile
                    </Link>
                    <button className="p-2 border border-border/50 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Add to Shortlist">
                      <Plus className="w-5 h-5" />
                    </button>
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