import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { leagues, teams, players } from '../data/mockData';
import { Trophy, Calendar, Clock, ArrowRight, Search, SlidersHorizontal, ArrowDownAZ, Star } from 'lucide-react';
import { PlayerHoverCard, TeamHoverCard } from '../components/HoverCards';

const INITIAL_VISIBLE_PLAYERS = 12;

export function LeaguePage() {
  const { id } = useParams();
  const league = leagues.find((l) => l.id === id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [sortKey, setSortKey] = useState('rating');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PLAYERS);

  if (!league) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-card rounded-2xl border border-border p-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Trophy className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">League not found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          The competition you're looking for doesn't exist or has been removed from the dataset.
        </p>
        <Link to="/leagues" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all">
          <ArrowRight className="size-5" />
          View all leagues
        </Link>
      </div>
    );
  }

  const leagueTeams = teams.filter((t) => t.league === league.name);
  const sortedTeams = [...leagueTeams].sort((a, b) => b.stats.points - a.stats.points);

  const leaguePlayers = players.filter((p) => p.league === league.name);

  // Filters setup
  const clubs = ['all', ...Array.from(new Set(leaguePlayers.map(p => p.team))).sort()];
  const positions = ['all', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'];
  
  const sortOptions = [
    { value: 'rating', label: 'Overall Rating' },
    { value: 'goals', label: 'Goals' },
    { value: 'assists', label: 'Assists' },
    { value: 'xG', label: 'Expected Goals' },
    { value: 'keyPasses', label: 'Key Passes' },
    { value: 'tackles', label: 'Tackles' },
  ];

  // Filtering and sorting logic
  const filteredPlayers = useMemo(() => {
    let result = leaguePlayers;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.team.toLowerCase().includes(q) || 
        p.nationality.toLowerCase().includes(q)
      );
    }
    
    if (selectedClub !== 'all') {
      result = result.filter(p => p.team === selectedClub);
    }
    
    if (selectedPosition !== 'all') {
      result = result.filter(p => p.position === selectedPosition);
    }
    
    return result.sort((a, b) => {
      switch(sortKey) {
        case 'goals': return b.stats.goals - a.stats.goals;
        case 'assists': return b.stats.assists - a.stats.assists;
        case 'xG': return b.stats.xG - a.stats.xG;
        case 'keyPasses': return b.stats.keyPasses - a.stats.keyPasses;
        case 'tackles': return b.stats.tacklesPerGame - a.stats.tacklesPerGame;
        case 'rating':
        default: return b.stats.rating - a.stats.rating;
      }
    });
  }, [leaguePlayers, searchQuery, selectedClub, selectedPosition, sortKey]);

  const visiblePlayers = filteredPlayers.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      {/* League Header */}
      <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/40 p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute -right-12 -top-12 text-[12rem] opacity-5 select-none pointer-events-none grayscale blur-md transform rotate-12">
          {league.logo}
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-chart-3/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(0,230,118,0.2)] shrink-0 relative z-10">
          {league.logo}
        </div>
        
        <div className="flex-1 text-center md:text-left relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{league.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm font-medium text-muted-foreground">
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">{league.country}</span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">Season {league.season}</span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">{leagueTeams.length} Teams</span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">{leaguePlayers.length} Players</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl font-semibold transition-all shadow-sm"
          >
            Compare Players
          </Link>
          <Link
            to="/leagues"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all shadow-sm"
          >
            All Leagues
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams & Standings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-primary" />
                <h2 className="font-bold text-lg">League Standings</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/10">
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground w-12">#</th>
                    <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Team</th>
                    <th className="text-center py-4 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">P</th>
                    <th className="text-center py-4 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">W</th>
                    <th className="text-center py-4 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">D</th>
                    <th className="text-center py-4 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">L</th>
                    <th className="text-center py-4 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">GD</th>
                    <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider text-primary">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedTeams.map((team, index) => (
                    <tr
                      key={team.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3 px-6">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm border ${
                            index === 0
                              ? 'bg-chart-3/10 text-chart-3 border-chart-3/20'
                              : index < 4
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : index >= sortedTeams.length - 3
                              ? 'bg-destructive/10 text-destructive border-destructive/20'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <TeamHoverCard team={team}>
                          <Link
                            to={`/team/${team.id}`}
                            className="flex items-center gap-3 hover:text-primary transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-sm shadow-sm group-hover:border-primary/50 transition-colors">
                              {team.logo}
                            </div>
                            <span className="font-bold text-foreground">{team.name}</span>
                          </Link>
                        </TeamHoverCard>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-muted-foreground">{team.stats.played}</td>
                      <td className="py-3 px-3 text-center font-medium text-muted-foreground">{team.stats.wins}</td>
                      <td className="py-3 px-3 text-center font-medium text-muted-foreground">{team.stats.draws}</td>
                      <td className="py-3 px-3 text-center font-medium text-muted-foreground">{team.stats.losses}</td>
                      <td className="py-3 px-3 text-center font-medium">
                        <span className={team.stats.goalsFor - team.stats.goalsAgainst > 0 ? 'text-primary' : team.stats.goalsFor - team.stats.goalsAgainst < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                          {team.stats.goalsFor - team.stats.goalsAgainst > 0 ? '+' : ''}
                          {team.stats.goalsFor - team.stats.goalsAgainst}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className="text-base font-black text-primary">{team.stats.points}</span>
                      </td>
                    </tr>
                  ))}
                  {sortedTeams.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground font-medium">
                        No team data available for this league.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Featured / Top Rated Players Leaderboard */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="size-5 text-chart-3" />
                <h2 className="font-bold text-lg">Top Rated Players</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {leaguePlayers.sort((a,b) => b.stats.rating - a.stats.rating).slice(0, 5).map((player, idx) => (
                <Link
                  key={player.id}
                  to={`/player/${player.id}`}
                  className="flex items-center gap-4 bg-muted/20 rounded-xl p-3 border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-chart-3/10 text-chart-3 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <img src={player.photo} alt={player.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-border" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate group-hover:text-primary transition-colors">{player.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{player.team}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-chart-3/10 text-chart-3 flex items-center justify-center font-bold text-sm shrink-0">
                    {player.stats.rating}
                  </div>
                </Link>
              ))}
              {leaguePlayers.length === 0 && (
                <div className="py-8 text-center text-muted-foreground font-medium text-sm">
                  No player data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Player Explorer */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20 uppercase tracking-widest">
            <SlidersHorizontal className="size-3" />
            Player Explorer
          </div>
          <h2 className="text-2xl font-bold mb-2">Scout League Players</h2>
          <p className="text-muted-foreground max-w-2xl">Filter and sort through all registered players in the {league.name} dataset.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-muted/30 rounded-xl border border-border p-4 md:p-5 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-input rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
            >
              {clubs.map(c => <option key={c} value={c}>{c === 'all' ? 'All Clubs' : c}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
            >
              {positions.map(p => <option key={p} value={p}>{p === 'all' ? 'All Positions' : p}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 relative">
            <ArrowDownAZ className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="w-full bg-background border border-input rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
            >
              {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {visiblePlayers.map(player => (
            <Link
              key={player.id}
              to={`/player/${player.id}`}
              className="bg-card rounded-xl border border-border hover:border-primary/50 transition-all overflow-hidden group shadow-sm hover:shadow-md flex flex-col h-full"
            >
              <div className="aspect-square overflow-hidden bg-muted relative">
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur-md border border-border shadow-sm flex items-center gap-1.5">
                  <Star className="size-3 text-primary" />
                  <span className="text-xs font-bold">{player.stats.rating}</span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-3">
                  <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors mb-1">
                    {player.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">{player.position}</p>
                    <p className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{player.age}y</p>
                  </div>
                </div>
                <div className="text-xs font-medium text-foreground mb-4 truncate py-1.5 px-2 bg-muted/50 rounded-md border border-border/50 text-center">
                  {player.team}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-border">
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Goals</div>
                    <div className="text-sm font-black">{player.stats.goals}</div>
                  </div>
                  <div className="text-center border-l border-border">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Assists</div>
                    <div className="text-sm font-black">{player.stats.assists}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {visiblePlayers.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-lg font-bold mb-2">No players found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters to find players.</p>
          </div>
        )}

        {filteredPlayers.length > visibleCount && (
          <div className="mt-8 text-center border-t border-border pt-8">
            <button
              onClick={() => setVisibleCount(c => c + INITIAL_VISIBLE_PLAYERS)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl font-bold transition-all shadow-sm"
            >
              Load More Players
              <ArrowDownAZ className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}