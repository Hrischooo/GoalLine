import { Link } from 'react-router';
import { players, teams, leagues } from '../data/mockData';
import { Database, Target, TrendingUp, Award, Users, ChevronDown, ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import { PlayerHoverCard } from '../components/HoverCards';

export function HomePage() {
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate dataset metrics
  const totalPlayers = players.length;
  const totalTeams = teams.length;
  const totalRows = players.length;
  const seasonDataset = '2025/26';

  // Filter players for discovery section
  const filteredPlayers = players.filter((player) => {
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    const matchesLeague = selectedLeague === 'all' || player.league === selectedLeague;
    const matchesSearch = searchQuery === '' || 
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.nationality.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPosition && matchesLeague && matchesSearch;
  });

  // Top performers
  const topScorers = [...players].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 5);
  const topRated = [...players].sort((a, b) => b.stats.rating - a.stats.rating).slice(0, 5);

  const positions = ['all', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'];
  const uniqueLeagues = ['all', ...Array.from(new Set(players.map(p => p.league)))];

  function scrollToPlayers() {
    const section = document.getElementById('players-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-background p-8 lg:p-12 shadow-2xl backdrop-blur-xl">
        {/* Ambient background glows */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-chart-3/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5 border border-primary/20">
              <Database className="size-4" />
              <span>Full database scouting workspace</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight tracking-tight">
              FootStats turns raw football data into player decisions.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Browse the full player database, open detailed scouting screens with complete stat objects, and compare any two players in the dataset.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
              >
                <Target className="size-5" />
                Open Compare
              </Link>
              <Link
                to="/league/epl"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-xl font-semibold transition-all"
              >
                Explore Leagues
              </Link>
              <button
                onClick={scrollToPlayers}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-xl font-semibold transition-all"
              >
                Browse Players
                <ChevronDown className="size-4" />
              </button>
            </div>
          </div>

          {/* Dataset Metrics */}
          <div className="lg:col-span-5">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-border">
                <span className="text-sm font-medium text-muted-foreground">Live dataset</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50"></div>
                  <span className="text-sm font-bold text-primary">Full Database</span>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Profiles loaded</div>
                  <div className="text-3xl font-bold tabular-nums tracking-tight">{totalPlayers.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Rows loaded</div>
                  <div className="text-3xl font-bold tabular-nums tracking-tight">{totalRows.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Season dataset</div>
                  <div className="text-2xl font-bold tracking-tight">{seasonDataset}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* League Discovery Section */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div className="flex-1">
            <div className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">League Discovery</div>
            <h2 className="text-3xl font-bold mb-2">Start From The Competition Layer</h2>
            <p className="text-muted-foreground max-w-2xl">Open a league workspace to scout role types, leaders, and filtered player pools.</p>
          </div>
          <Link
            to="/league/epl"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 font-semibold transition-colors"
          >
            View all leagues
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {leagues.map((league) => (
            <Link
              key={league.id}
              to={`/league/${league.id}`}
              className="bg-card/70 backdrop-blur-lg rounded-2xl border border-border/50 hover:border-primary/60 transition-all duration-300 p-6 group relative overflow-hidden shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-5xl mb-4">{league.logo}</div>
                <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors">
                  {league.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">{league.country}</p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                  <span className="text-muted-foreground font-medium">Season</span>
                  <span className="font-bold">{league.season}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Performers */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Scorers */}
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/40 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="size-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Top Scorers</h3>
            </div>
            <Link to="/analytics" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-semibold">
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topScorers.map((player, index) => (
              <PlayerHoverCard key={player.id} player={player}>
                <Link
                  to={`/player/${player.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted ring-2 ring-border group-hover:ring-primary/50 transition-all">
                    <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {player.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{player.team}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold">{player.stats.goals}</div>
                    <div className="text-xs text-muted-foreground">goals</div>
                  </div>
                </Link>
              </PlayerHoverCard>
            ))}
          </div>
        </div>

        {/* Top Rated */}
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/40 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-chart-3/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-chart-3" />
              </div>
              <h3 className="font-bold text-lg">Highest Rated</h3>
            </div>
            <Link to="/analytics" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-semibold">
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topRated.map((player, index) => (
              <PlayerHoverCard key={player.id} player={player}>
                <Link
                  to={`/player/${player.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-chart-3/10 text-chart-3 flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:bg-chart-3 group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted ring-2 ring-border group-hover:ring-chart-3/50 transition-all">
                    <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {player.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{player.team}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-primary">{player.stats.rating}</div>
                    <div className="text-xs text-muted-foreground">rating</div>
                  </div>
                </Link>
              </PlayerHoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* Player Discovery Section */}
      <section id="players-section" className="scroll-mt-8">
        <div className="mb-6">
          <div className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Player Discovery</div>
          <h2 className="text-3xl font-bold mb-2">Browse The Full Database</h2>
          <p className="text-muted-foreground max-w-2xl">Filter by position and league to find your next target player.</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Search */}
            <div className="md:col-span-5">
              <label className="block text-sm font-semibold mb-3 text-foreground">Search Players</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, team, or nationality..."
                  className="w-full bg-muted/50 border border-input rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Position Filter */}
            <div className="md:col-span-4">
              <label className="block text-sm font-semibold mb-3 text-foreground">Position</label>
              <div className="flex flex-wrap gap-2">
                {positions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPosition === pos
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
                    }`}
                  >
                    {pos === 'all' ? 'All' : pos}
                  </button>
                ))}
              </div>
            </div>

            {/* League Filter */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-3 text-foreground">League</label>
              <div className="relative">
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="w-full bg-muted/50 border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all font-medium"
                >
                  {uniqueLeagues.map((league) => (
                    <option key={league} value={league}>
                      {league === 'all' ? 'All Leagues' : league}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Player Results Count */}
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-bold">{filteredPlayers.length}</span> of <span className="text-foreground font-bold">{players.length}</span> players
          </span>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredPlayers.slice(0, 24).map((player) => (
            <PlayerHoverCard key={player.id} player={player}>
              <Link
                to={`/player/${player.id}`}
                className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 hover:border-primary/60 transition-all duration-300 overflow-hidden group shadow-lg hover:shadow-primary/10 hover:-translate-y-1 block"
              >
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 w-12 h-12 rounded-xl bg-primary/90 backdrop-blur-sm text-primary-foreground flex items-center justify-center text-base font-bold shadow-lg">
                    {player.stats.rating}
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors mb-1">
                      {player.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{player.position}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mb-4 truncate font-medium">{player.team}</div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-border">
                    <div>
                      <div className="text-muted-foreground font-medium mb-1">Goals</div>
                      <div className="font-bold text-foreground">{player.stats.goals}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-medium mb-1">Assists</div>
                      <div className="font-bold text-foreground">{player.stats.assists}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-medium mb-1">Apps</div>
                      <div className="font-bold text-foreground">{player.stats.matches}</div>
                    </div>
                  </div>
                </div>
              </Link>
            </PlayerHoverCard>
          ))}
        </div>

        {filteredPlayers.length > 24 && (
          <div className="text-center mt-8">
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-xl font-semibold transition-all shadow-sm"
            >
              View All {filteredPlayers.length} Players
              <ArrowRight className="size-5" />
            </Link>
          </div>
        )}

        {filteredPlayers.length === 0 && (
          <div className="text-center py-16">
            <Users className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No players found</h3>
            <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters</p>
            <button
              onClick={() => {
                setSelectedPosition('all');
                setSelectedLeague('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
