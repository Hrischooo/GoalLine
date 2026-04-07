import { useState } from 'react';
import { Link } from 'react-router';
import { liveMatches, upcomingMatches, finishedMatches, leagues } from '../data/mockData';
import { Radio, Calendar, CheckCircle, Clock, ChevronDown, Filter } from 'lucide-react';

type MatchStatus = 'all' | 'live' | 'scheduled' | 'finished';

export function LiveScoresPage() {
  const [statusFilter, setStatusFilter] = useState<MatchStatus>('all');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');

  const allMatches = [...liveMatches, ...upcomingMatches, ...finishedMatches];
  
  const filteredMatches = allMatches.filter((match) => {
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    const matchesLeague = leagueFilter === 'all' || match.leagueId === leagueFilter;
    return matchesStatus && matchesLeague;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20 uppercase tracking-widest">
            <Radio className="size-3" />
            Live Dashboard
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Live Scores</h1>
          <p className="text-muted-foreground">Real-time football match updates and results.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-card/60 backdrop-blur-md px-4 py-2 rounded-xl border border-border/50 shadow-sm">
          <span className="text-muted-foreground font-medium">Auto-refresh:</span>
          <div className="flex items-center gap-1.5 text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,230,118,0.8)]"></div>
            <span className="font-bold">ON</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10">
          {/* Status Filter */}
          <div className="md:col-span-6 lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Match Status</label>
            <div className="flex gap-2">
              {(['all', 'live', 'scheduled', 'finished'] as MatchStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'bg-background text-muted-foreground hover:text-foreground border border-border hover:border-primary/50'
                  }`}
                >
                  {status === 'all' && 'All'}
                  {status === 'live' && (
                    <span className="flex items-center justify-center gap-1.5">
                      <Radio className="size-3" /> Live
                    </span>
                  )}
                  {status === 'scheduled' && 'Upcoming'}
                  {status === 'finished' && 'Finished'}
                </button>
              ))}
            </div>
          </div>

          {/* League Filter */}
          <div className="md:col-span-6 lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Competition</label>
            <div className="relative">
              <select
                value={leagueFilter}
                onChange={(e) => setLeagueFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all"
              >
                <option value="all">All Leagues</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Match Sections Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Matches Column */}
        <div className="lg:col-span-2 space-y-6">
          {liveMatches.length > 0 && (statusFilter === 'all' || statusFilter === 'live') && (
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(212,24,61,0.6)]"></div>
                <h2 className="font-bold text-lg">Live Now</h2>
                <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded-md text-muted-foreground">{liveMatches.length}</span>
              </div>
              <div className="space-y-4">
                {liveMatches
                  .filter(m => leagueFilter === 'all' || m.leagueId === leagueFilter)
                  .map((match) => (
                    <Link
                      key={match.id}
                      to={`/match/${match.id}`}
                      className="block bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 hover:border-primary/60 transition-all duration-300 group shadow-md hover:shadow-xl hover:shadow-primary/5"
                    >
                      <div className="p-5 md:p-6">
                        {/* Match Header */}
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="px-2.5 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-1.5 animate-pulse">
                              <Radio className="size-3" />
                              {match.minute}'
                            </span>
                            <span className="text-muted-foreground uppercase tracking-wider">
                              {leagues.find(l => l.id === match.leagueId)?.name}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground px-2.5 py-1 bg-muted/50 rounded-md">{match.venue}</span>
                        </div>

                        {/* Teams & Score */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold group-hover:text-primary transition-colors">{match.homeTeam}</span>
                            <span className="text-3xl font-black text-foreground">{match.homeScore}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold group-hover:text-primary transition-colors">{match.awayTeam}</span>
                            <span className="text-3xl font-black text-foreground">{match.awayScore}</span>
                          </div>
                        </div>

                        {/* Match Stats */}
                        {match.stats && (
                          <div className="pt-5 border-t border-border/50">
                            <div className="grid grid-cols-5 gap-2 text-xs text-center">
                              <div className="bg-muted/30 rounded-lg py-2">
                                <div className="text-muted-foreground font-semibold mb-1 uppercase text-[10px] tracking-wider">Poss.</div>
                                <div className="font-bold">{match.stats.possession.home}% - {match.stats.possession.away}%</div>
                              </div>
                              <div className="bg-muted/30 rounded-lg py-2">
                                <div className="text-muted-foreground font-semibold mb-1 uppercase text-[10px] tracking-wider">Shots</div>
                                <div className="font-bold">{match.stats.shots.home} - {match.stats.shots.away}</div>
                              </div>
                              <div className="bg-muted/30 rounded-lg py-2">
                                <div className="text-muted-foreground font-semibold mb-1 uppercase text-[10px] tracking-wider">Target</div>
                                <div className="font-bold">{match.stats.shotsOnTarget.home} - {match.stats.shotsOnTarget.away}</div>
                              </div>
                              <div className="bg-muted/30 rounded-lg py-2">
                                <div className="text-muted-foreground font-semibold mb-1 uppercase text-[10px] tracking-wider">Corners</div>
                                <div className="font-bold">{match.stats.corners.home} - {match.stats.corners.away}</div>
                              </div>
                              <div className="bg-primary/10 rounded-lg py-2 border border-primary/20">
                                <div className="text-primary font-semibold mb-1 uppercase text-[10px] tracking-wider">xG</div>
                                <div className="font-bold text-primary">{match.stats.xG.home.toFixed(1)} - {match.stats.xG.away.toFixed(1)}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                ))}
              </div>
            </div>
          )}

          {/* Finished Matches */}
          {finishedMatches.length > 0 && (statusFilter === 'all' || statusFilter === 'finished') && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-4 px-1">
                <CheckCircle className="size-5 text-muted-foreground" />
                <h2 className="font-bold text-lg text-muted-foreground">Finished</h2>
                <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded-md text-muted-foreground">{finishedMatches.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finishedMatches
                  .filter(m => leagueFilter === 'all' || m.leagueId === leagueFilter)
                  .map((match) => (
                    <Link
                      key={match.id}
                      to={`/match/${match.id}`}
                      className="block bg-card/40 backdrop-blur-sm rounded-xl border border-border hover:border-primary/50 transition-all p-5 group hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span className="px-2 py-0.5 bg-muted rounded">FT</span>
                          <span>{leagues.find(l => l.id === match.leagueId)?.name}</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="space-y-2.5 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm truncate pr-2 group-hover:text-primary transition-colors">{match.homeTeam}</span>
                          <span className="text-xl font-black">{match.homeScore}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm truncate pr-2 group-hover:text-primary transition-colors">{match.awayTeam}</span>
                          <span className="text-xl font-black">{match.awayScore}</span>
                        </div>
                      </div>
                      {match.stats && (
                        <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2 text-[10px] text-center">
                          <div className="bg-primary/5 rounded py-1.5 border border-primary/10">
                            <div className="text-primary font-bold mb-0.5 uppercase">xG</div>
                            <div className="font-bold text-primary">{match.stats.xG.home.toFixed(1)} - {match.stats.xG.away.toFixed(1)}</div>
                          </div>
                          <div className="bg-muted/50 rounded py-1.5">
                            <div className="text-muted-foreground font-bold mb-0.5 uppercase">Poss</div>
                            <div className="font-bold">{match.stats.possession.home}% - {match.stats.possession.away}%</div>
                          </div>
                          <div className="bg-muted/50 rounded py-1.5">
                            <div className="text-muted-foreground font-bold mb-0.5 uppercase">Shots</div>
                            <div className="font-bold">{match.stats.shots.home} - {match.stats.shots.away}</div>
                          </div>
                        </div>
                      )}
                    </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Upcoming */}
        <div className="lg:col-span-1">
          {upcomingMatches.length > 0 && (statusFilter === 'all' || statusFilter === 'scheduled') && (
            <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-lg p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-chart-3" />
                  <h2 className="font-bold text-lg">Upcoming</h2>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded-md text-muted-foreground">{upcomingMatches.length} Matches</span>
              </div>
              <div className="space-y-3">
                {upcomingMatches
                  .filter(m => leagueFilter === 'all' || m.leagueId === leagueFilter)
                  .map((match) => (
                    <Link
                      key={match.id}
                      to={`/match/${match.id}`}
                      className="block bg-background rounded-xl border border-border hover:border-chart-3/50 transition-all p-4 group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span className="px-2 py-0.5 bg-chart-3/10 text-chart-3 border border-chart-3/20 rounded">
                            {leagues.find(l => l.id === match.leagueId)?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <Clock className="size-3 text-chart-3" />
                          <span>
                            {new Date(match.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold truncate flex-1 group-hover:text-chart-3 transition-colors">{match.homeTeam}</span>
                        <span className="text-muted-foreground font-black px-3 text-xs">VS</span>
                        <span className="font-bold truncate flex-1 text-right group-hover:text-chart-3 transition-colors">{match.awayTeam}</span>
                      </div>
                    </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-16 bg-card/60 backdrop-blur-md rounded-2xl border border-border border-dashed shadow-sm">
          <Filter className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-bold mb-1">No Matches Found</h3>
          <p className="text-sm text-muted-foreground">Adjust your filters to see more matches.</p>
        </div>
      )}
    </div>
  );
}