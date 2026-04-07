import { liveMatches, teams } from '../data/mockData';
import { Map, Shield, Target, Activity, TrendingUp, Layers } from 'lucide-react';
import { TacticalPitch } from '../components/TacticalPitch';

export function TacticalAnalysisPage() {
  const match = liveMatches[0];
  const homeTeam = teams.find((t) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match?.awayTeamId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20 uppercase tracking-widest">
            <Layers className="size-3" />
            Tactical Explorer
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Tactical Analysis Hub</h1>
          <p className="text-muted-foreground">Formation breakdowns, positional tracking, and tactical shape.</p>
        </div>
      </div>

      {/* Match Selection */}
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Active Analysis Protocol</div>
            <h2 className="text-2xl md:text-3xl font-black mb-3 text-foreground flex items-center gap-3">
              {match?.homeTeam} <span className="text-muted-foreground/50 mx-2 text-xl font-bold">vs</span> {match?.awayTeam}
            </h2>
            <div className="flex items-center gap-3 text-sm font-bold">
              <span className="px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-md animate-pulse">
                {match?.minute}' MATCH CLOCK
              </span>
              <span className="px-4 py-1 bg-muted/50 rounded-md border border-border text-foreground">
                SCORE: {match?.homeScore} - {match?.awayScore}
              </span>
            </div>
          </div>
          <div className="text-left md:text-right bg-muted/30 p-4 rounded-xl border border-border/50">
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Base Formations</div>
            <div className="text-lg font-black text-foreground">
              {homeTeam?.formation} <span className="text-muted-foreground/50 mx-1">/</span> {awayTeam?.formation}
            </div>
          </div>
        </div>
      </div>

      {/* Tactical Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Home Team */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-3 text-xl font-black text-foreground">
            <div className="p-2 bg-primary/20 text-primary rounded-xl">
              <Shield className="size-5" />
            </div>
            {match?.homeTeam} System
          </h3>

          {/* Formation */}
          <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-6 shadow-sm group hover:border-primary/50 transition-colors relative overflow-hidden flex flex-col h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 relative z-10">Structural Shape</h4>
            <div className="bg-gradient-to-b from-primary/10 to-transparent rounded-xl border border-primary/20 p-2 aspect-[3/4] relative z-10 flex flex-col items-center justify-center shadow-inner flex-grow">
              <TacticalPitch formation={homeTeam?.formation} colorClass="text-primary" teamId={homeTeam?.id} />
            </div>
            <div className="mt-4 flex justify-between items-center text-xs font-semibold px-2">
              <span className="text-muted-foreground">Formation</span>
              <span className="text-primary bg-primary/10 px-2 py-1 rounded-md">{homeTeam?.formation}</span>
            </div>
          </div>

          {/* Tactical Style */}
          <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-6 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-5">Tactical Identity Matrix</h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-muted-foreground font-semibold">Playing Style Profile</span>
                <span className="font-bold text-foreground">{homeTeam?.tacticalStyle.playingStyle}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-muted-foreground font-semibold">Defensive Line Height</span>
                <span className="font-bold text-foreground">{homeTeam?.tacticalStyle.defensiveLine}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-muted-foreground font-semibold">Build-up Phase Priority</span>
                <span className="font-bold text-foreground">{homeTeam?.tacticalStyle.buildUpStyle}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-muted-foreground font-semibold">Pressing Engagement</span>
                <span className="font-bold text-foreground">{homeTeam?.tacticalStyle.pressingIntensity}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Attack Pattern */}
            <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Progression Vectors</h4>
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/20 flex items-center justify-center mb-4">
                <Target className="size-10 text-primary/50" />
              </div>
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-start gap-2 bg-muted/30 p-2 rounded border border-border/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-0.5 shadow-[0_0_5px_rgba(0,230,118,0.5)]"></div>
                  <span className="text-foreground">Primary: Overload isolation on left flank</span>
                </div>
                <div className="flex items-start gap-2 bg-muted/30 p-2 rounded border border-border/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40 shrink-0 mt-0.5"></div>
                  <span className="text-foreground">Secondary: Central combination play</span>
                </div>
              </div>
            </div>

            {/* Pressing Zones */}
            <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Pressing Intensity Maps</h4>
              <div className="aspect-video bg-gradient-to-br from-destructive/10 to-transparent rounded-xl border border-destructive/20 flex items-center justify-center mb-4">
                <Activity className="size-10 text-destructive/50" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-muted/30 p-2 rounded border border-border/50">
                  <div className="text-muted-foreground font-bold uppercase mb-1 text-[9px]">Attacking 3rd</div>
                  <div className="font-black text-primary text-sm">42%</div>
                </div>
                <div className="bg-muted/30 p-2 rounded border border-border/50">
                  <div className="text-muted-foreground font-bold uppercase mb-1 text-[9px]">Middle 3rd</div>
                  <div className="font-black text-foreground text-sm">35%</div>
                </div>
                <div className="bg-muted/30 p-2 rounded border border-border/50">
                  <div className="text-muted-foreground font-bold uppercase mb-1 text-[9px]">Defending 3rd</div>
                  <div className="font-black text-foreground text-sm">23%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Away Team */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-3 text-xl font-black text-foreground">
            <div className="p-2 bg-chart-3/20 text-chart-3 rounded-xl">
              <Shield className="size-5" />
            </div>
            {match?.awayTeam} System
          </h3>

          {/* Formation */}
          <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-6 shadow-sm group hover:border-chart-3/50 transition-colors relative overflow-hidden flex flex-col h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 relative z-10">Structural Shape</h4>
            <div className="bg-gradient-to-b from-chart-3/10 to-transparent rounded-xl border border-chart-3/20 p-2 aspect-[3/4] relative z-10 flex flex-col items-center justify-center shadow-inner flex-grow">
              <TacticalPitch formation={awayTeam?.formation} colorClass="text-chart-3" isAway teamId={awayTeam?.id} />
            </div>
            <div className="mt-4 flex justify-between items-center text-xs font-semibold px-2">
              <span className="text-muted-foreground">Formation</span>
              <span className="text-chart-3 bg-chart-3/10 px-2 py-1 rounded-md">{awayTeam?.formation}</span>
            </div>
          </div>

          {/* Tactical Style */}
          <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-6 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-5">Tactical Identity Matrix</h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-muted-foreground font-semibold">Playing Style Profile</span>
                <span className="font-bold text-foreground">{awayTeam?.tacticalStyle.playingStyle}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-muted-foreground font-semibold">Defensive Line Height</span>
                <span className="font-bold text-foreground">{awayTeam?.tacticalStyle.defensiveLine}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-muted-foreground font-semibold">Build-up Phase Priority</span>
                <span className="font-bold text-foreground">{awayTeam?.tacticalStyle.buildUpStyle}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-muted-foreground font-semibold">Pressing Engagement</span>
                <span className="font-bold text-foreground">{awayTeam?.tacticalStyle.pressingIntensity}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Attack Pattern */}
            <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Progression Vectors</h4>
              <div className="aspect-video bg-gradient-to-br from-chart-3/10 to-transparent rounded-xl border border-chart-3/20 flex items-center justify-center mb-4">
                <Target className="size-10 text-chart-3/50" />
              </div>
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-start gap-2 bg-muted/30 p-2 rounded border border-border/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-chart-3 shrink-0 mt-0.5 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                  <span className="text-foreground">Primary: Rapid transitional counter-attacks</span>
                </div>
                <div className="flex items-start gap-2 bg-muted/30 p-2 rounded border border-border/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-chart-3/40 shrink-0 mt-0.5"></div>
                  <span className="text-foreground">Secondary: Wide overlapping crosses</span>
                </div>
              </div>
            </div>

            {/* Pressing Zones */}
            <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Pressing Intensity Maps</h4>
              <div className="aspect-video bg-gradient-to-br from-destructive/10 to-transparent rounded-xl border border-destructive/20 flex items-center justify-center mb-4">
                <Activity className="size-10 text-destructive/50" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-muted/30 p-2 rounded border border-border/50">
                  <div className="text-muted-foreground font-bold uppercase mb-1 text-[9px]">Attacking 3rd</div>
                  <div className="font-black text-chart-3 text-sm">28%</div>
                </div>
                <div className="bg-muted/30 p-2 rounded border border-border/50">
                  <div className="text-muted-foreground font-bold uppercase mb-1 text-[9px]">Middle 3rd</div>
                  <div className="font-black text-foreground text-sm">48%</div>
                </div>
                <div className="bg-muted/30 p-2 rounded border border-border/50">
                  <div className="text-muted-foreground font-bold uppercase mb-1 text-[9px]">Defending 3rd</div>
                  <div className="font-black text-foreground text-sm">24%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tactical Notes */}
      <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 p-8 shadow-lg mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <h3 className="text-lg font-black mb-6 flex items-center gap-3 relative z-10">
          <div className="p-2 bg-primary/20 text-primary rounded-xl">
            <TrendingUp className="size-5" />
          </div>
          Live Match Engine Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-background rounded-2xl p-6 border border-primary/30 shadow-[0_4px_20px_rgba(0,230,118,0.05)] relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
            <div className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              {match?.homeTeam} System Control
            </div>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Generating spatial dominance through advanced half-space positioning. The high defensive block compresses the pitch vertically.
            </p>
          </div>
          <div className="bg-background rounded-2xl p-6 border border-chart-3/30 shadow-[0_4px_20px_rgba(59,130,246,0.05)] relative overflow-hidden group hover:border-chart-3/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-chart-3"></div>
            <div className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-3 animate-pulse"></div>
              {match?.awayTeam} Tactical Response
            </div>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Operating a deep low-block structure to absorb pressure. Looking to launch direct transition attacks targeting the space behind fullbacks.
            </p>
          </div>
          <div className="bg-background rounded-2xl p-6 border border-chart-5/30 shadow-[0_4px_20px_rgba(245,158,11,0.05)] relative overflow-hidden group hover:border-chart-5/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-chart-5"></div>
            <div className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-5 animate-pulse"></div>
              Key Strategic Battleground
            </div>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              The outcome will be determined by central midfield superiority against quick offensive transitions in wide corridors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}