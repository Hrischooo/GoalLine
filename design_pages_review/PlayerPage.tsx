import { useParams, Link } from 'react-router';
import { players } from '../data/mockData';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Activity, Target, Shield, Zap } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export function PlayerPage() {
  const { id } = useParams();
  const player = players.find((p) => p.id === id);

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-card rounded-2xl border border-border p-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Activity className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Player not found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          The player profile you're looking for doesn't exist or has been removed from the database.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all">
          <ArrowLeft className="size-5" />
          Return to Database
        </Link>
      </div>
    );
  }

  // Prepare radar chart data
  const radarData = [
    { stat: 'Attack', value: Math.min((player.stats.goals / 30) * 100, 100), fullMark: 100 },
    { stat: 'Pass', value: player.stats.passAccuracy, fullMark: 100 },
    { stat: 'Defend', value: Math.min((player.stats.tacklesPerGame / 6) * 100, 100), fullMark: 100 },
    { stat: 'Physical', value: Math.min((player.stats.minutesPlayed / 3000) * 100, 100), fullMark: 100 },
    { stat: 'Creativity', value: Math.min((player.stats.assists / 20) * 100, 100), fullMark: 100 },
  ];

  // Form chart data
  const formData = player.form.map((rating, index) => ({
    match: index + 1,
    rating,
  }));

  const avgFormRating = player.form.reduce((a, b) => a + b, 0) / player.form.length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="size-4" />
          Back to Database
        </Link>
      </div>

      {/* Player Header */}
      <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/40 p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-chart-3/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden bg-muted/50 ring-4 ring-border/50 shadow-[0_0_40px_rgba(0,230,118,0.15)] flex-shrink-0 relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img
              src={player.photo}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{player.name}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">{player.team}</span>
                  <span>•</span>
                  <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">{player.league}</span>
                  <span>•</span>
                  <span className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">{player.age} years</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Market Value</div>
                  <div className="text-xl font-bold">{player.marketValue}</div>
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-2xl font-bold text-primary-foreground">{player.stats.rating}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoBox label="Position" value={player.position} />
              <InfoBox label="Number" value={`#${player.number}`} />
              <InfoBox label="Nationality" value={player.nationality} />
              <InfoBox label="Matches" value={player.stats.matches.toString()} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Goals" value={player.stats.goals} trend="up" />
        <StatCard label="Assists" value={player.stats.assists} trend="up" />
        <StatCard label="Pass Acc." value={`${player.stats.passAccuracy}%`} trend="neutral" />
        <StatCard label="Shots/90" value={player.stats.shotsPerGame.toFixed(1)} trend="up" />
        <StatCard label="Tackles/90" value={player.stats.tacklesPerGame.toFixed(1)} trend="up" />
        <StatCard label="Minutes" value={(player.stats.minutesPlayed / 1000).toFixed(1) + 'k'} trend="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Target className="size-5 text-primary" />
            <h2 className="font-bold text-lg">Performance Profile</h2>
          </div>
          <div className="h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid key="grid" stroke="var(--border)" />
                <PolarAngleAxis key="angle" dataKey="stat" tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }} />
                <PolarRadiusAxis key="radius" angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  key="radar"
                  name={player.name}
                  dataKey="value"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Form Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              <h2 className="font-bold text-lg">Form (Last 10 Matches)</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-muted-foreground">Avg Rating</span>
              <span className="text-sm font-bold text-primary">{avgFormRating.toFixed(2)}</span>
            </div>
          </div>
          <div className="h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={formData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  key="xaxis"
                  dataKey="match" 
                  stroke="var(--muted-foreground)" 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis 
                  key="yaxis"
                  domain={[6, 10]} 
                  stroke="var(--muted-foreground)" 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  key="tooltip"
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
                  labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                />
                <Line
                  key="line"
                  type="monotone"
                  dataKey="rating"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--card)', stroke: 'var(--primary)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--background)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attacking Stats */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Attacking Output</h2>
          </div>
          <div className="p-6 space-y-4">
            <StatRow label="Goals" value={player.stats.goals} />
            <StatRow label="Assists" value={player.stats.assists} />
            <StatRow label="Expected Goals (xG)" value={player.stats.xG.toFixed(2)} />
            <StatRow label="Expected Assists (xA)" value={player.stats.xA.toFixed(2)} />
            <StatRow label="Shots per game" value={player.stats.shotsPerGame.toFixed(2)} />
            <StatRow label="Key Passes" value={player.stats.keyPasses?.toFixed(2) || '1.8'} />
            <StatRow label="Successful Dribbles" value={player.stats.successfulDribbles?.toFixed(2) || '2.1'} />
          </div>
        </div>

        {/* Defensive Stats */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Defending & Discipline</h2>
          </div>
          <div className="p-6 space-y-4">
            <StatRow label="Tackles per game" value={player.stats.tacklesPerGame.toFixed(2)} />
            <StatRow label="Interceptions per game" value={player.stats.interceptionsPerGame.toFixed(2)} />
            <StatRow label="Aerial Duals Won" value={player.stats.aerialWins?.toFixed(2) || '1.5'} />
            <StatRow label="Pass accuracy" value={`${player.stats.passAccuracy}%`} />
            <StatRow label="Yellow cards" value={player.stats.yellowCards} />
            <StatRow label="Red cards" value={player.stats.redCards} />
            <StatRow label="Minutes played" value={player.stats.minutesPlayed.toLocaleString()} />
          </div>
        </div>
      </div>

      {/* Tactical Roles */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Tactical Identity</h2>
        <div className="flex flex-wrap gap-2">
          {player.tacticalRoles.map((role, index) => (
            <span
              key={index}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold"
            >
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-bold truncate">{value}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          trend === 'up' ? 'bg-primary/10 text-primary' : 
          trend === 'down' ? 'bg-destructive/10 text-destructive' : 
          'bg-muted text-muted-foreground'
        }`}>
          {trend === 'up' && <TrendingUp className="size-3" />}
          {trend === 'down' && <TrendingDown className="size-3" />}
          {trend === 'neutral' && <Minus className="size-3" />}
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
