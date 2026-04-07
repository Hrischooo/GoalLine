import { useParams, Link } from 'react-router';
import { teams, players } from '../data/mockData';
import { ArrowLeft, Users, TrendingUp, Target, Shield, Trophy, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

import { TacticalPitch } from '../components/TacticalPitch';

export function TeamPage() {
  const { id } = useParams();
  const team = teams.find((t) => t.id === id);

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-card rounded-2xl border border-border p-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Shield className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Team not found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          The team profile you're looking for doesn't exist or has been removed from the database.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all">
          <ArrowLeft className="size-5" />
          Return to Database
        </Link>
      </div>
    );
  }

  const teamPlayers = players.filter((p) => p.team === team.name);
  const bestXI = teamPlayers.slice(0, 11).sort((a,b) => b.stats.rating - a.stats.rating);

  // Calculate team averages
  const avgRating = teamPlayers.length > 0 
    ? teamPlayers.reduce((sum, p) => sum + p.stats.rating, 0) / teamPlayers.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to={`/league/${team.league === 'Premier League' ? 'epl' : team.league === 'La Liga' ? 'laliga' : team.league === 'Bundesliga' ? 'bundesliga' : team.league === 'Serie A' ? 'seriea' : 'ligue1'}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to {team.league}
      </Link>

      {/* Team Header */}
      <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/40 p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-chart-3/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-6xl md:text-[5rem] border border-primary/30 shadow-[0_0_50px_rgba(0,230,118,0.2)] flex-shrink-0 relative">
            <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 pointer-events-none"></div>
            {team.logo}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{team.name}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">{team.league}</span>
                  <span>•</span>
                  <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">Manager: {team.manager}</span>
                  <span>•</span>
                  <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">Est. {team.founded}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm font-medium text-muted-foreground">Recent Form</div>
                <div className="flex items-center gap-1.5">
                  {team.recentForm.map((result, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      result === 'W' ? 'bg-primary/20 text-primary border border-primary/30' :
                      result === 'D' ? 'bg-muted border border-border text-muted-foreground' :
                      'bg-destructive/20 text-destructive border border-destructive/30'
                    }`}>
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Played" value={team.stats.played.toString()} />
              <StatBox label="Wins" value={team.stats.wins.toString()} highlight />
              <StatBox label="Goals" value={team.stats.goalsFor.toString()} />
              <StatBox label="Points" value={team.stats.points.toString()} highlight />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Goals For"
          value={team.stats.goalsFor}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={Shield}
          label="Goals Against"
          value={team.stats.goalsAgainst}
          color="text-destructive"
          bgColor="bg-destructive/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Goal Difference"
          value={`${team.stats.goalsFor - team.stats.goalsAgainst > 0 ? '+' : ''}${
            team.stats.goalsFor - team.stats.goalsAgainst
          }`}
          color="text-chart-1"
          bgColor="bg-chart-1/10"
        />
        <StatCard
          icon={Trophy}
          label="Win Rate"
          value={`${Math.round((team.stats.wins / team.stats.played) * 100)}%`}
          color="text-chart-3"
          bgColor="bg-chart-3/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formation & Tactics */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="size-5 text-primary" />
            <h2 className="font-bold text-lg">Tactical Identity</h2>
          </div>
          
          <div className="bg-muted/30 rounded-xl border border-border/50 p-2 mb-6 aspect-square flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1e12dce30948?q=80&w=800')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
            <div className="relative z-10 w-full h-full flex flex-col pt-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">Base Formation</div>
              <div className="flex-grow">
                <TacticalPitch formation={team.formation} colorClass="text-primary" teamId={team.id} />
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-auto">
            <TacticsRow label="Playing Style" value={team.tacticalStyle.playingStyle} />
            <TacticsRow label="Defensive Line" value={team.tacticalStyle.defensiveLine} />
            <TacticsRow label="Pressing Intensity" value={team.tacticalStyle.pressingIntensity} />
            <TacticsRow label="Build-up Style" value={team.tacticalStyle.buildUpStyle} />
          </div>
        </div>

        {/* Top Performers (Best XI equivalent) */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <h2 className="font-bold text-lg">Key Players</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
              <span className="text-xs font-medium text-muted-foreground">Squad Avg</span>
              <span className="text-sm font-bold text-primary">{avgRating.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-3 pr-2">
            {bestXI.slice(0, 6).map((player, index) => (
              <Link
                key={player.id}
                to={`/player/${player.id}`}
                className="flex items-center gap-4 bg-muted/20 rounded-xl p-3 border border-border hover:border-primary/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border">
                  <img src={player.photo} alt={player.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm group-hover:text-primary transition-colors truncate">
                    {player.name}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">{player.position}</div>
                </div>
                <div className="flex items-center gap-4 md:gap-6 shrink-0">
                  <div className="text-center hidden md:block">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground mb-0.5">Goals</div>
                    <div className="text-sm font-bold">{player.stats.goals}</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground mb-0.5">Assists</div>
                    <div className="text-sm font-bold">{player.stats.assists}</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {player.stats.rating}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border text-center">
            <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              View All Players
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Season Statistics */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="font-bold text-lg">Advanced Metrics</h2>
          <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-background rounded-md border border-border">League Only</span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricBox label="Expected Goals (xG)" value={team.stats.xG.toFixed(1)} />
            <MetricBox label="Expected Goals Against (xGA)" value={team.stats.xGA.toFixed(1)} />
            <MetricBox label="xG Difference" value={(team.stats.xG - team.stats.xGA).toFixed(1)} highlight={(team.stats.xG - team.stats.xGA) > 0} />
            <MetricBox label="Possession" value={`${team.stats.possession}%`} />
            <MetricBox label="Pass Accuracy" value={`${team.stats.passAccuracy}%`} />
            <MetricBox label="PPDA" value={team.stats.ppda.toFixed(1)} />
            <MetricBox label="Goals/Match" value={(team.stats.goalsFor / team.stats.played).toFixed(2)} />
            <MetricBox label="Conceded/Match" value={(team.stats.goalsAgainst / team.stats.played).toFixed(2)} />
            <MetricBox label="Clean Sheets" value={Math.floor(team.stats.wins * 0.45).toString()} />
            <MetricBox label="Points/Match" value={(team.stats.points / team.stats.played).toFixed(2)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${bgColor}`}>
          <Icon className={`size-5 ${color}`} />
        </div>
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-black tracking-tight">{value}</div>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-black ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function MetricBox({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-muted/20 rounded-xl p-4 border border-border">
      <div className="text-xs font-medium text-muted-foreground mb-2 leading-tight">{label}</div>
      <div className={`text-xl font-bold ${highlight === true ? 'text-primary' : highlight === false ? 'text-destructive' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function TacticsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}