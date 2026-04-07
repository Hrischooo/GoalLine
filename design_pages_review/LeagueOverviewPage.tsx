import { Link } from 'react-router';
import { leagues, teams, players } from '../data/mockData';
import { Database, Target, TrendingUp, Trophy, ArrowRight, BarChart3, Globe } from 'lucide-react';
import { useMemo } from 'react';

export function LeagueOverviewPage() {
  const totalLeagues = leagues.length;
  const totalPlayers = players.length;
  const highestRating = Math.max(...players.map(p => p.stats.rating));

  // Pre-calculate stats per league
  const leagueStats = useMemo(() => {
    return leagues.map(league => {
      const leagueTeams = teams.filter(t => t.league === league.name);
      const leaguePlayers = players.filter(p => p.league === league.name);
      const topPlayer = leaguePlayers.sort((a,b) => b.stats.rating - a.stats.rating)[0];

      return {
        ...league,
        teamCount: leagueTeams.length,
        playerCount: leaguePlayers.length,
        avgRating: leaguePlayers.length > 0 
          ? (leaguePlayers.reduce((sum, p) => sum + p.stats.rating, 0) / leaguePlayers.length).toFixed(2) 
          : '0.00',
        topPlayer
      };
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-background p-8 lg:p-12 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20 uppercase tracking-widest">
              <Globe className="size-3" />
              Multi-League Discovery
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight tracking-tight">
              Browse leagues as scouting environments.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Each competition opens into its own tactical explorer with leaderboards, role filters, and position-aware player discovery.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Leagues</div>
                <div className="text-4xl font-black text-foreground">{totalLeagues}</div>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Players</div>
                <div className="text-4xl font-black text-foreground">{totalPlayers}</div>
              </div>
              <div className="bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 p-5 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Top Rated</div>
                <div className="text-4xl font-black text-primary">{highestRating}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Leagues */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {leagueStats.map(league => (
          <Link
            key={league.id}
            to={`/league/${league.id}`}
            className="group bg-card/60 backdrop-blur-xl rounded-3xl border border-border/50 hover:border-primary/60 transition-all duration-500 overflow-hidden flex flex-col h-full shadow-xl hover:shadow-primary/20 hover:-translate-y-2"
          >
            <div className="p-6 border-b border-border/50 bg-muted/10 flex items-start justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-8xl opacity-5 select-none pointer-events-none grayscale blur-sm transform group-hover:scale-110 transition-transform duration-700">
                {league.logo}
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-4xl shadow-inner shrink-0">
                  {league.logo}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{league.name}</h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <span>{league.country}</span>
                    <span>•</span>
                    <span>{league.season}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Teams</div>
                  <div className="text-xl font-bold">{league.teamCount}</div>
                </div>
                <div className="text-center border-l border-r border-border px-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Players</div>
                  <div className="text-xl font-bold">{league.playerCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Avg Rat</div>
                  <div className="text-xl font-bold text-primary">{league.avgRating}</div>
                </div>
              </div>

              {league.topPlayer && (
                <div className="mt-auto bg-muted/40 rounded-xl p-4 border border-border/50">
                  <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                    <Trophy className="size-3 text-chart-3" /> Highest Rated
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={league.topPlayer.photo} alt={league.topPlayer.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{league.topPlayer.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{league.topPlayer.team}</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-chart-3/10 text-chart-3 flex items-center justify-center font-bold text-sm">
                      {league.topPlayer.stats.rating}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}