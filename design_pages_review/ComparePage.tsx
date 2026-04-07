import { useState } from 'react';
import { players } from '../data/mockData';
import { X, Plus, Search, GitCompare, RefreshCcw, BarChart3, Target } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function ComparePage() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const availablePlayers = players.filter((p) => !selectedPlayers.includes(p.id));
  const filteredPlayers = availablePlayers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const comparedPlayers = players.filter((p) => selectedPlayers.includes(p.id));

  const addPlayer = (playerId: string) => {
    if (selectedPlayers.length < 4) {
      setSelectedPlayers([...selectedPlayers, playerId]);
      setSearchTerm('');
      setShowSearch(false);
    }
  };

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
  };

  const clearAll = () => {
    setSelectedPlayers([]);
  };

  // Prepare radar chart data
  const radarData = [
    { stat: 'Goals', fullMark: 100 },
    { stat: 'Assists', fullMark: 100 },
    { stat: 'Pass Acc.', fullMark: 100 },
    { stat: 'Tackles', fullMark: 100 },
    { stat: 'Shots', fullMark: 100 },
  ].map(item => {
    const dataObj: any = { stat: item.stat, fullMark: item.fullMark };
    comparedPlayers.forEach(p => {
      if (item.stat === 'Goals') dataObj[p.id] = Math.min((p.stats.goals / 30) * 100, 100);
      if (item.stat === 'Assists') dataObj[p.id] = Math.min((p.stats.assists / 20) * 100, 100);
      if (item.stat === 'Pass Acc.') dataObj[p.id] = p.stats.passAccuracy;
      if (item.stat === 'Tackles') dataObj[p.id] = Math.min((p.stats.tacklesPerGame / 6) * 100, 100);
      if (item.stat === 'Shots') dataObj[p.id] = Math.min((p.stats.shotsPerGame / 6) * 100, 100);
    });
    return dataObj;
  });

  const colors = ['#00D084', '#3B82F6', '#F59E0B', '#EF4444'];
  const cssColors = ['var(--primary)', 'var(--chart-1)', 'var(--chart-3)', 'var(--chart-5)'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
        <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20 uppercase tracking-widest">
            <GitCompare className="size-3" />
            Cross-League Compare
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Scan role identity and output.</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Search any player in the database, compare them side by side, and see tactical profile, overall rating, and core production.
          </p>
        </div>
        {selectedPlayers.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg font-medium transition-colors border border-border"
          >
            <RefreshCcw className="size-4" />
            Reset Compare
          </button>
        )}
      </div>

      {/* Selected Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((index) => {
          const player = comparedPlayers[index];
          return (
            <div
              key={index}
              className={`bg-card rounded-2xl border-2 p-5 min-h-[160px] flex items-center justify-center transition-all ${
                player ? 'border-border shadow-sm' : 'border-dashed border-border/60 hover:border-primary/50 hover:bg-muted/30 cursor-pointer'
              }`}
              style={player ? { borderTopColor: colors[index], borderTopWidth: '4px' } : {}}
              onClick={() => !player && setShowSearch(true)}
            >
              {player ? (
                <div className="w-full relative group">
                  <button
                    onClick={(e) => { e.stopPropagation(); removePlayer(player.id); }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={player.photo}
                      alt={player.name}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-background shadow-md"
                    />
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-bold text-base truncate">{player.name}</h3>
                      <p className="text-xs text-muted-foreground truncate font-medium">{player.team}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{player.position}</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5 flex items-center justify-between border border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Rating</span>
                    <span className="text-lg font-black" style={{ color: colors[index] }}>
                      {player.stats.rating}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10">
                    <Plus className="size-6" />
                  </div>
                  <span className="text-sm font-semibold">Add Player {index + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Search Modal (Inline) */}
      {(showSearch || selectedPlayers.length === 0) && selectedPlayers.length < 4 && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Search Database to Add Player</h2>
            {showSearch && selectedPlayers.length > 0 && (
              <button onClick={() => setShowSearch(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-6" />
              </button>
            )}
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search players by name or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/50 border border-input rounded-xl pl-12 pr-4 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {filteredPlayers.slice(0, 12).map((player) => (
              <button
                key={player.id}
                onClick={() => addPlayer(player.id)}
                className="flex items-center gap-4 bg-muted/30 rounded-xl p-3 border border-border hover:border-primary/50 hover:bg-muted/80 transition-all text-left group"
              >
                <img src={player.photo} alt={player.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{player.name}</h4>
                  <p className="text-xs text-muted-foreground font-medium truncate">{player.team}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-primary">{player.stats.rating}</div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">{player.position.slice(0,3)}</div>
                </div>
              </button>
            ))}
            {filteredPlayers.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground font-medium">
                No players found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Visuals */}
      {comparedPlayers.length >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Radar Chart */}
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Target className="size-5 text-primary" />
              <h2 className="font-bold text-lg">Performance Profile</h2>
            </div>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  {comparedPlayers.map((player, index) => (
                    <Radar
                      key={`radar-${player.id}`}
                      name={player.name}
                      dataKey={player.id}
                      stroke={colors[index]}
                      fill={colors[index]}
                      fillOpacity={0.15}
                      strokeWidth={3}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '20px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Table */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              <h2 className="font-bold text-lg">Detailed Comparison</h2>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/10">
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground w-1/4">Metric</th>
                    {comparedPlayers.map((player, index) => (
                      <th
                        key={`th-${player.id}`}
                        className="text-center py-4 px-4 text-sm font-bold"
                        style={{ color: colors[index] }}
                      >
                        {player.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <ComparisonRow label="Overall Rating" players={comparedPlayers} getValue={(p) => p.stats.rating} isPrimary />
                  <ComparisonRow label="Goals" players={comparedPlayers} getValue={(p) => p.stats.goals} />
                  <ComparisonRow label="Assists" players={comparedPlayers} getValue={(p) => p.stats.assists} />
                  <ComparisonRow label="Expected Goals (xG)" players={comparedPlayers} getValue={(p) => p.stats.xG.toFixed(2)} />
                  <ComparisonRow label="Expected Assists (xA)" players={comparedPlayers} getValue={(p) => p.stats.xA.toFixed(2)} />
                  <ComparisonRow label="Matches Played" players={comparedPlayers} getValue={(p) => p.stats.matches} />
                  <ComparisonRow
                    label="Pass Accuracy"
                    players={comparedPlayers}
                    getValue={(p) => `${p.stats.passAccuracy}%`}
                  />
                  <ComparisonRow
                    label="Shots/Game"
                    players={comparedPlayers}
                    getValue={(p) => p.stats.shotsPerGame.toFixed(1)}
                  />
                  <ComparisonRow
                    label="Tackles/Game"
                    players={comparedPlayers}
                    getValue={(p) => p.stats.tacklesPerGame.toFixed(1)}
                  />
                  <ComparisonRow
                    label="Interceptions/Game"
                    players={comparedPlayers}
                    getValue={(p) => p.stats.interceptionsPerGame.toFixed(1)}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {comparedPlayers.length < 2 && !showSearch && selectedPlayers.length > 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-border border-dashed">
          <GitCompare className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Comparison Pending</h3>
          <p className="text-muted-foreground">Select at least 2 players to view the side-by-side analysis.</p>
        </div>
      )}
    </div>
  );
}

function ComparisonRow({
  label,
  players,
  getValue,
  isPrimary,
}: {
  label: string;
  players: any[];
  getValue: (player: any) => string | number;
  isPrimary?: boolean;
}) {
  const values = players.map((p) => getValue(p));
  const numericValues = values.map((v) => (typeof v === 'string' ? parseFloat(v) : v));
  const maxValue = Math.max(...numericValues.filter((v) => !isNaN(v)));

  return (
    <tr className={`hover:bg-muted/30 transition-colors ${isPrimary ? 'bg-primary/5' : ''}`}>
      <td className={`py-4 px-6 font-medium ${isPrimary ? 'text-primary font-bold' : 'text-foreground'}`}>{label}</td>
      {players.map((player) => {
        const value = getValue(player);
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        const isMax = !isNaN(numericValue) && numericValue === maxValue;

        return (
          <td key={`cell-${player.id}`} className="py-4 px-4 text-center">
            <span className={`font-bold ${isMax ? 'text-foreground' : 'text-muted-foreground'} ${isPrimary && isMax ? 'text-primary text-base' : ''}`}>
              {value}
            </span>
          </td>
        );
      })}
    </tr>
  );
}