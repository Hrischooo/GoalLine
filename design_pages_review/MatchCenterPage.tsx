import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { liveMatches, finishedMatches, leagues, teams } from '../data/mockData';
import {
  ArrowLeft,
  Radio,
  TrendingUp,
  Users,
  Clock,
  Activity,
  Target,
  BarChart3,
  Map,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';

type Tab = 'overview' | 'stats' | 'lineups' | 'timeline' | 'tactical' | 'heatmap';

export function MatchCenterPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const allMatches = [...liveMatches, ...finishedMatches];
  const match = allMatches.find((m) => m.id === id);

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8B93A7]">Match not found</p>
        <Link to="/live" className="text-[#00D084] hover:text-[#00A368] mt-4 inline-block text-sm">
          Back to live scores
        </Link>
      </div>
    );
  }

  const league = leagues.find((l) => l.id === match.leagueId);
  const homeTeam = teams.find((t) => t.id === match.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match.awayTeamId);

  // Momentum data
  const momentumData = [
    { min: 0, home: 50, away: 50 },
    { min: 15, home: 55, away: 45 },
    { min: 30, home: 60, away: 40 },
    { min: 45, home: 58, away: 42 },
    { min: 60, home: 52, away: 48 },
    { min: 75, home: 48, away: 52 },
    { min: 90, home: 54, away: 46 },
  ];

  // Team comparison radar
  const comparisonData = match.stats ? [
    { stat: 'Shots', home: (match.stats.shots.home / 20) * 100, away: (match.stats.shots.away / 20) * 100, id: 'shots' },
    { stat: 'Possession', home: match.stats.possession.home, away: match.stats.possession.away, id: 'possession' },
    { stat: 'Pass Acc.', home: match.stats.passAccuracy.home, away: match.stats.passAccuracy.away, id: 'passacc' },
    { stat: 'Attacks', home: 75, away: 65, id: 'attacks' },
    { stat: 'Dangerous', home: 68, away: 58, id: 'dangerous' },
  ] : [];

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'lineups', label: 'Lineups', icon: Users },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'tactical', label: 'Tactical', icon: Map },
    { id: 'heatmap', label: 'Heatmap', icon: Zap },
  ];

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link to="/live" className="inline-flex items-center gap-1 text-[#8B93A7] hover:text-white transition-colors text-sm">
        <ArrowLeft className="size-4" />
        Back to live scores
      </Link>

      {/* Match Header */}
      <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm">
            {match.status === 'live' && (
              <span className="px-2 py-1 bg-[#FF4842]/10 text-[#FF4842] rounded font-medium flex items-center gap-1">
                <Radio className="size-3" />
                {match.minute}'
              </span>
            )}
            {match.status === 'finished' && (
              <span className="px-2 py-1 bg-[#8B93A7]/10 text-[#8B93A7] rounded font-medium">FT</span>
            )}
            <span className="text-[#8B93A7]">{league?.name}</span>
          </div>
          <div className="text-sm text-[#8B93A7]">
            {new Date(match.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Score */}
        <div className="grid grid-cols-3 gap-8 items-center mb-6">
          <div className="text-right">
            <Link to={`/team/${match.homeTeamId}`} className="inline-block">
              <div className="text-4xl mb-2">{homeTeam?.logo || '⚽'}</div>
              <h2 className="text-xl font-semibold hover:text-[#00D084] transition-colors">
                {match.homeTeam}
              </h2>
            </Link>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold tabular-nums">
              {match.homeScore !== undefined ? match.homeScore : '-'} - {match.awayScore !== undefined ? match.awayScore : '-'}
            </div>
            {match.stats && (
              <div className="mt-2 text-sm text-[#8B93A7]">
                xG: {match.stats.xG.home.toFixed(1)} - {match.stats.xG.away.toFixed(1)}
              </div>
            )}
          </div>
          <div className="text-left">
            <Link to={`/team/${match.awayTeamId}`} className="inline-block">
              <div className="text-4xl mb-2">{awayTeam?.logo || '⚽'}</div>
              <h2 className="text-xl font-semibold hover:text-[#00D084] transition-colors">
                {match.awayTeam}
              </h2>
            </Link>
          </div>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-center gap-6 text-sm text-[#8B93A7] pt-4 border-t border-[#1E2D3D]">
          <span>{match.venue}</span>
          {match.referee && (
            <>
              <span>•</span>
              <span>Ref: {match.referee}</span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-1 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#00D084] text-white'
                    : 'text-[#8B93A7] hover:text-white hover:bg-[#1E2D3D]'
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && match.stats && (
        <div className="space-y-4">
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Possession" homeValue={`${match.stats.possession.home}%`} awayValue={`${match.stats.possession.away}%`} />
            <StatCard label="Shots" homeValue={match.stats.shots.home} awayValue={match.stats.shots.away} />
            <StatCard label="Shots on Target" homeValue={match.stats.shotsOnTarget.home} awayValue={match.stats.shotsOnTarget.away} />
            <StatCard label="Corners" homeValue={match.stats.corners.home} awayValue={match.stats.corners.away} />
            <StatCard label="Fouls" homeValue={match.stats.fouls.home} awayValue={match.stats.fouls.away} />
            <StatCard label="Pass Accuracy" homeValue={`${match.stats.passAccuracy.home}%`} awayValue={`${match.stats.passAccuracy.away}%`} />
          </div>

          {/* Momentum Chart */}
          <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-5">
            <h3 className="text-sm font-semibold mb-4">Match Momentum</h3>
            <ResponsiveContainer width="100%" height={200} minWidth={1} minHeight={1}>
              <LineChart data={momentumData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D3D" />
                <XAxis dataKey="min" stroke="#8B93A7" tick={{ fill: '#8B93A7', fontSize: 11 }} label={{ value: 'Minutes', position: 'insideBottom', offset: -5, fill: '#8B93A7' }} />
                <YAxis domain={[0, 100]} stroke="#8B93A7" tick={{ fill: '#8B93A7', fontSize: 11 }} label={{ value: 'Control %', angle: -90, position: 'insideLeft', fill: '#8B93A7' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141D2B',
                    border: '1px solid #1E2D3D',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="home" stroke="#00D084" strokeWidth={2} name={match.homeTeam} />
                <Line type="monotone" dataKey="away" stroke="#3B82F6" strokeWidth={2} name={match.awayTeam} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Team Comparison Radar */}
          <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-5">
            <h3 className="text-sm font-semibold mb-4">Team Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1}>
              <RadarChart data={comparisonData}>
                <PolarGrid stroke="#1E2D3D" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: '#8B93A7', fontSize: 11 }} />
                <Radar
                  name={match.homeTeam}
                  dataKey="home"
                  stroke="#00D084"
                  fill="#00D084"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name={match.awayTeam}
                  dataKey="away"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'stats' && match.stats && (
        <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D]">
          <div className="px-5 py-3 border-b border-[#1E2D3D]">
            <h3 className="text-sm font-semibold">Detailed Statistics</h3>
          </div>
          <div className="p-5 space-y-4">
            <StatRow label="Expected Goals (xG)" homeValue={match.stats.xG.home.toFixed(2)} awayValue={match.stats.xG.away.toFixed(2)} />
            <StatRow label="Possession" homeValue={`${match.stats.possession.home}%`} awayValue={`${match.stats.possession.away}%`} homePercent={match.stats.possession.home} awayPercent={match.stats.possession.away} />
            <StatRow label="Shots" homeValue={match.stats.shots.home} awayValue={match.stats.shots.away} homePercent={(match.stats.shots.home / (match.stats.shots.home + match.stats.shots.away)) * 100} awayPercent={(match.stats.shots.away / (match.stats.shots.home + match.stats.shots.away)) * 100} />
            <StatRow label="Shots on Target" homeValue={match.stats.shotsOnTarget.home} awayValue={match.stats.shotsOnTarget.away} homePercent={(match.stats.shotsOnTarget.home / (match.stats.shotsOnTarget.home + match.stats.shotsOnTarget.away)) * 100} awayPercent={(match.stats.shotsOnTarget.away / (match.stats.shotsOnTarget.home + match.stats.shotsOnTarget.away)) * 100} />
            <StatRow label="Corners" homeValue={match.stats.corners.home} awayValue={match.stats.corners.away} homePercent={(match.stats.corners.home / (match.stats.corners.home + match.stats.corners.away)) * 100} awayPercent={(match.stats.corners.away / (match.stats.corners.home + match.stats.corners.away)) * 100} />
            <StatRow label="Fouls" homeValue={match.stats.fouls.home} awayValue={match.stats.fouls.away} homePercent={(match.stats.fouls.home / (match.stats.fouls.home + match.stats.fouls.away)) * 100} awayPercent={(match.stats.fouls.away / (match.stats.fouls.home + match.stats.fouls.away)) * 100} />
            <StatRow label="Passes" homeValue={match.stats.passes.home} awayValue={match.stats.passes.away} homePercent={(match.stats.passes.home / (match.stats.passes.home + match.stats.passes.away)) * 100} awayPercent={(match.stats.passes.away / (match.stats.passes.home + match.stats.passes.away)) * 100} />
            <StatRow label="Pass Accuracy" homeValue={`${match.stats.passAccuracy.home}%`} awayValue={`${match.stats.passAccuracy.away}%`} homePercent={match.stats.passAccuracy.home} awayPercent={match.stats.passAccuracy.away} />
          </div>
        </div>
      )}

      {activeTab === 'timeline' && match.events && (
        <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-5">
          <h3 className="text-sm font-semibold mb-4">Match Events</h3>
          <div className="space-y-3">
            {match.events.map((event) => (
              <div key={event.id} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0F1928] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {event.minute}'
                </div>
                <div className="flex-1 bg-[#0F1928] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {event.type === 'goal' && <Target className="size-4 text-[#00D084]" />}
                    {event.type === 'yellow_card' && <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>}
                    {event.type === 'red_card' && <div className="w-3 h-4 bg-red-500 rounded-sm"></div>}
                    {event.type === 'substitution' && <Users className="size-4 text-[#3B82F6]" />}
                    <span className="font-medium text-sm">{event.player}</span>
                  </div>
                  {event.assistBy && <div className="text-xs text-[#8B93A7]">Assist: {event.assistBy}</div>}
                  {event.playerOut && <div className="text-xs text-[#8B93A7]">Out: {event.playerOut}</div>}
                </div>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${event.team === 'home' ? 'bg-[#00D084]' : 'bg-[#3B82F6]'}`}></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'lineups' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-5">
            <h3 className="text-sm font-semibold mb-4">{match.homeTeam}</h3>
            <div className="bg-gradient-to-b from-[#00D084]/10 to-transparent rounded-lg border border-[#00D084]/20 p-6 aspect-[3/4] flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00D084] mb-2">{homeTeam?.formation || '4-3-3'}</div>
                <div className="text-xs text-[#8B93A7]">Formation</div>
              </div>
            </div>
            <div className="text-sm text-[#8B93A7]">Lineup details would appear here</div>
          </div>
          <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-5">
            <h3 className="text-sm font-semibold mb-4">{match.awayTeam}</h3>
            <div className="bg-gradient-to-b from-[#3B82F6]/10 to-transparent rounded-lg border border-[#3B82F6]/20 p-6 aspect-[3/4] flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#3B82F6] mb-2">{awayTeam?.formation || '4-3-3'}</div>
                <div className="text-xs text-[#8B93A7]">Formation</div>
              </div>
            </div>
            <div className="text-sm text-[#8B93A7]">Lineup details would appear here</div>
          </div>
        </div>
      )}

      {activeTab === 'tactical' && (
        <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-5">
          <h3 className="text-sm font-semibold mb-4">Tactical Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0F1928] rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">{match.homeTeam} - Attack Pattern</h4>
              <div className="aspect-square bg-gradient-to-b from-[#00D084]/5 to-transparent rounded border border-[#1E2D3D] flex items-center justify-center">
                <Map className="size-12 text-[#00D084]/30" />
              </div>
            </div>
            <div className="bg-[#0F1928] rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">{match.awayTeam} - Attack Pattern</h4>
              <div className="aspect-square bg-gradient-to-b from-[#3B82F6]/5 to-transparent rounded border border-[#1E2D3D] flex items-center justify-center">
                <Map className="size-12 text-[#3B82F6]/30" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'heatmap' && (
        <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-5">
          <h3 className="text-sm font-semibold mb-4">Player Heatmaps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0F1928] rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">{match.homeTeam} - Team Heatmap</h4>
              <div className="aspect-[3/4] bg-gradient-to-br from-[#00D084]/20 via-[#00D084]/10 to-transparent rounded border border-[#1E2D3D] flex items-center justify-center">
                <Zap className="size-12 text-[#00D084]/30" />
              </div>
            </div>
            <div className="bg-[#0F1928] rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">{match.awayTeam} - Team Heatmap</h4>
              <div className="aspect-[3/4] bg-gradient-to-br from-[#3B82F6]/20 via-[#3B82F6]/10 to-transparent rounded border border-[#1E2D3D] flex items-center justify-center">
                <Zap className="size-12 text-[#3B82F6]/30" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, homeValue, awayValue }: { label: string; homeValue: string | number; awayValue: string | number }) {
  return (
    <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-4">
      <div className="text-xs text-[#8B93A7] text-center mb-3">{label}</div>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">{homeValue}</span>
        <span className="text-xl font-bold">{awayValue}</span>
      </div>
    </div>
  );
}

function StatRow({
  label,
  homeValue,
  awayValue,
  homePercent,
  awayPercent,
}: {
  label: string;
  homeValue: string | number;
  awayValue: string | number;
  homePercent?: number;
  awayPercent?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-semibold">{homeValue}</span>
        <span className="text-[#8B93A7]">{label}</span>
        <span className="font-semibold">{awayValue}</span>
      </div>
      {homePercent !== undefined && awayPercent !== undefined && (
        <div className="flex gap-1 h-1.5">
          <div
            className="bg-[#00D084] rounded-full transition-all"
            style={{ width: `${homePercent}%` }}
          ></div>
          <div
            className="bg-[#3B82F6] rounded-full transition-all"
            style={{ width: `${awayPercent}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}