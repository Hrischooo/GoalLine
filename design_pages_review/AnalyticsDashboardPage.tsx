import { useState } from 'react';
import { teams, players, leagues } from '../data/mockData';
import { BarChart3, TrendingUp, Filter, Download, ChevronDown, Database, Eye } from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';

export function AnalyticsDashboardPage() {
  const [selectedLeague, setSelectedLeague] = useState('epl');
  const [selectedMetric, setSelectedMetric] = useState('xG');

  const leagueTeams = teams.filter((t) => {
    if (selectedLeague === 'epl') return t.league === 'Premier League';
    if (selectedLeague === 'laliga') return t.league === 'La Liga';
    if (selectedLeague === 'bundesliga') return t.league === 'Bundesliga';
    if (selectedLeague === 'seriea') return t.league === 'Serie A';
    if (selectedLeague === 'ligue1') return t.league === 'Ligue 1';
    return false;
  });

  // xG vs Goals scatter data
  const xGScatterData = leagueTeams.map((team) => ({
    name: team.name,
    x: team.stats.xG,
    y: team.stats.goalsFor,
  }));

  // Team performance trends
  const performanceData = leagueTeams.slice(0, 6).map((team) => ({
    name: team.name.substring(0, 10),
    xG: team.stats.xG,
    xGA: team.stats.xGA,
    goals: team.stats.goalsFor,
  }));

  //Possession vs Points
  const possessionData = leagueTeams.map((team) => ({
    name: team.name,
    possession: team.stats.possession,
    points: team.stats.points,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20 uppercase tracking-widest">
            <Eye className="size-3" />
            Performance Insights
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Advanced data visualization and league-wide trends.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
          <Download className="size-4" />
          Export Data Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-chart-3/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">League</label>
            <div className="relative">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all"
              >
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Primary Metric</label>
            <div className="relative">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all"
              >
                <option value="xG">Expected Goals (xG)</option>
                <option value="possession">Possession %</option>
                <option value="passing">Pass Completion %</option>
                <option value="defensive">PPDA (Pressing)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Season</label>
            <div className="relative">
              <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all">
                <option>2025/26 (Current)</option>
                <option>2024/25</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Dataset View</label>
            <div className="relative">
              <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all">
                <option>Team Aggregates</option>
                <option>Player Individual</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-5 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary mb-3">
              <div className="p-1.5 bg-primary/20 rounded-lg">
                <BarChart3 className="size-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Avg xG/Match</span>
            </div>
            <div className="text-3xl font-black mb-1">2.34</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <TrendingUp className="size-3" />
              <span>+8.2% vs last month</span>
            </div>
          </div>
        </div>
        <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-5 shadow-sm relative overflow-hidden group hover:border-chart-3/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-3/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-chart-3 mb-3">
              <div className="p-1.5 bg-chart-3/20 rounded-lg">
                <BarChart3 className="size-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Avg Possession</span>
            </div>
            <div className="text-3xl font-black mb-1">58.7%</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-chart-3">
              <TrendingUp className="size-3" />
              <span>+2.1% vs last month</span>
            </div>
          </div>
        </div>
        <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-5 shadow-sm relative overflow-hidden group hover:border-chart-5/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-5/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-chart-5 mb-3">
              <div className="p-1.5 bg-chart-5/20 rounded-lg">
                <BarChart3 className="size-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Pass Accuracy</span>
            </div>
            <div className="text-3xl font-black mb-1">86.2%</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-chart-5">
              <TrendingUp className="size-3" />
              <span>+1.4% vs last month</span>
            </div>
          </div>
        </div>
        <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-5 shadow-sm relative overflow-hidden group hover:border-destructive/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-destructive mb-3">
              <div className="p-1.5 bg-destructive/20 rounded-lg">
                <BarChart3 className="size-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Avg Goals/Match</span>
            </div>
            <div className="text-3xl font-black mb-1">2.68</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
              <TrendingUp className="size-3" />
              <span>+5.7% vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* xG vs Goals Scatter */}
        <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 p-6 shadow-md">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2">
            <Database className="size-4 text-primary" />
            Expected Goals vs Actual Goals Output
          </h3>
          <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={1}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                key="xaxis"
                dataKey="x"
                name="xG"
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                label={{ value: 'Expected Goals (xG)', position: 'insideBottom', offset: -15, fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                key="yaxis"
                dataKey="y"
                name="Goals"
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                label={{ value: 'Actual Goals Scored', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip
                key="tooltip"
                cursor={{ strokeDasharray: '3 3', stroke: 'var(--border)' }}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
              />
              <Scatter key="scatter1" data={xGScatterData} fill="var(--primary)" shape="circle" fillOpacity={0.8} r={6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Bar Chart */}
        <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 p-6 shadow-md">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2">
            <Database className="size-4 text-chart-3" />
            Top Teams - Attacking Overperformance
          </h3>
          <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={1}>
            <BarChart data={performanceData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
              <CartesianGrid key="grid-perf1" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                key="xaxis-perf1"
                dataKey="name" 
                stroke="var(--muted-foreground)" 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} 
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                key="yaxis-perf1"
                stroke="var(--muted-foreground)" 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                key="tooltip-perf1"
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar key="xg" dataKey="xG" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Expected Goals (xG)" />
              <Bar key="goals" dataKey="goals" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="Actual Goals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Possession vs Points Scatter */}
        <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 p-6 shadow-md">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2">
            <Database className="size-4 text-chart-5" />
            Possession Dominance vs Points Total
          </h3>
          <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={1}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
              <CartesianGrid key="grid2" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                key="xaxis2"
                dataKey="possession"
                name="Possession"
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                label={{ value: 'Average Possession %', position: 'insideBottom', offset: -15, fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                key="yaxis2"
                dataKey="points"
                name="Points"
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                label={{ value: 'Points Total', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip
                key="tooltip2"
                cursor={{ strokeDasharray: '3 3', stroke: 'var(--border)' }}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Scatter key="scatter2" data={possessionData} fill="var(--chart-5)" shape="circle" fillOpacity={0.8} r={6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Defensive Metrics */}
        <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 p-6 shadow-md">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2">
            <Database className="size-4 text-destructive" />
            Defensive Vulnerability (Expected Goals Against)
          </h3>
          <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={1}>
            <BarChart data={performanceData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
              <CartesianGrid key="grid-perf2" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                key="xaxis-perf2"
                dataKey="name" 
                stroke="var(--muted-foreground)" 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} 
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                key="yaxis-perf2"
                stroke="var(--muted-foreground)" 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                key="tooltip-perf2"
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar key="xga" dataKey="xGA" fill="var(--destructive)" radius={[4, 4, 0, 0]} name="Expected Goals Against (xGA)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 overflow-hidden shadow-md">
        <div className="px-6 py-5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            Advanced Team Statistics Matrix
          </h3>
          <button className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors px-3 py-1.5 bg-primary/10 rounded-lg">
            Configure Columns
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Node</th>
                <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Exp. Goals (xG)</th>
                <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Exp. Against (xGA)</th>
                <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Possession %</th>
                <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Pass Comp. %</th>
                <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Press Intensity (PPDA)</th>
                <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider text-foreground">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {leagueTeams.slice(0, 8).map((team, index) => (
                <tr key={team.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="py-4 px-6 font-bold group-hover:text-primary transition-colors">{team.name}</td>
                  <td className="py-4 px-4 text-center text-primary font-black">{team.stats.xG.toFixed(2)}</td>
                  <td className="py-4 px-4 text-center text-destructive font-black">{team.stats.xGA.toFixed(2)}</td>
                  <td className="py-4 px-4 text-center font-semibold">{team.stats.possession.toFixed(1)}%</td>
                  <td className="py-4 px-4 text-center font-semibold">{team.stats.passAccuracy.toFixed(1)}%</td>
                  <td className="py-4 px-4 text-center font-semibold">{team.stats.ppda.toFixed(1)}</td>
                  <td className="py-4 px-6 text-center font-black text-foreground text-lg">{team.stats.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}