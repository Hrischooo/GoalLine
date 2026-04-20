import { useEffect, useMemo, useState } from 'react';
import PlayerAnalyticsReport from '../components/PlayerAnalyticsReport';
import PlayerBasicStatsReport from '../components/PlayerBasicStatsReport';
import PlayerHeroCard from '../components/PlayerHeroCard';
import PlayerRadarPanel from '../components/PlayerRadarPanel';
import PlayerScoutingReport from '../components/PlayerScoutingReport';
import PlayerStatsReport from '../components/PlayerStatsReport';
import ReportsNavigation from '../components/ReportsNavigation';
import RoleFitCard from '../components/RoleFitCard';
import ScoutingInsightsPanel from '../components/ScoutingInsightsPanel';
import SimilarPlayersTab from '../components/SimilarPlayersTab';
import TacticalProfileCard from '../components/TacticalProfileCard';
import TeamFitPanel from '../components/TeamFitPanel';
import '../styles/player-details.css';
import { buildLeagueComparisonProfile } from '../utils/leagueComparison';
import { buildPlayerReportsData } from '../utils/playerReports';
import { computeDisplayMetrics, formatStatValue, formatTextValue } from '../utils/playerMetrics';
import { buildRiskProfile } from '../utils/riskProfile';
import { rememberRecentPlayer } from '../utils/recentPlayers';
import { buildStrengthsWeaknessesProfile } from '../utils/strengthsWeaknesses';
import { buildSystemSuitabilityProfile } from '../utils/systemSuitability';
import { buildPlayerKey, getLeagueName, getPlayerByIdOrUniqueKey } from '../utils/dataset';
import { buildBasicReportSections } from '../utils/playerViews';

function getMetricModeStorageKey(playerKey) {
  return `goalline-player-metric-mode:${playerKey}`;
}

function buildPlayerViewUrl(playerKey, view = 'overview', report = 'analytics') {
  const params = new URLSearchParams();

  if (view !== 'overview') {
    params.set('view', view);
  }

  if (view === 'report') {
    params.set('report', report);
  }

  const query = params.toString();
  return `/player/${encodeURIComponent(playerKey)}${query ? `?${query}` : ''}`;
}

function ProfileSidebar({ leagueName, onOpenTeam, player }) {
  return (
    <aside className="profile-panel">
      <div className="profile-panel__section">
        <div className="profile-panel__header">
          <h3>Player Info</h3>
        </div>

        <dl className="profile-meta">
          <div>
            <dt>Nation</dt>
            <dd>{formatTextValue(player.nation)}</dd>
          </div>
          <div>
            <dt>League</dt>
            <dd>{formatTextValue(leagueName, 'Unknown League')}</dd>
          </div>
          <div>
            <dt>Club</dt>
            <dd>
              {onOpenTeam ? (
                <button className="inline-link-button" onClick={onOpenTeam} type="button">
                  {formatTextValue(player.squad)}
                </button>
              ) : (
                formatTextValue(player.squad)
              )}
            </dd>
          </div>
          <div>
            <dt>Age</dt>
            <dd>{formatTextValue(player.age)}</dd>
          </div>
          <div>
            <dt>Born</dt>
            <dd>{formatTextValue(player.born)}</dd>
          </div>
          <div>
            <dt>Matches</dt>
            <dd>{formatStatValue(player.matches_played, 'N/A')}</dd>
          </div>
          <div>
            <dt>Avg Mins</dt>
            <dd>{formatStatValue(player.avg_mins_per_match, 'N/A')}</dd>
          </div>
          <div>
            <dt>Season</dt>
            <dd>{formatTextValue(player.season)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

export default function PlayerDetails({
  header,
  leagueFilter,
  playerIdentifier,
  playerReport = 'analytics',
  playerView = 'overview',
  players,
  teams = [],
  ratingIndex,
  onBack,
  onCompare,
  onNavigate,
  onOpenPlayer,
  onOpenTeam
}) {
  const [metricMode, setMetricMode] = useState('advanced');

  const player = getPlayerByIdOrUniqueKey(players.data, playerIdentifier);
  const metrics = player ? computeDisplayMetrics(player, ratingIndex) : null;
  const leagueName = player ? getLeagueName(player) : '';
  const playerKey = player ? buildPlayerKey(player) : '';
  const basicSections = useMemo(() => (player && metrics ? buildBasicReportSections(player, metrics) : []), [metrics, player]);
  const strengthsWeaknesses = useMemo(
    () => (player && metrics ? buildStrengthsWeaknessesProfile(player, metrics, players.data || [], ratingIndex) : null),
    [metrics, player, players.data, ratingIndex]
  );
  const leagueComparison = useMemo(
    () => (player && metrics ? buildLeagueComparisonProfile(player, metrics, players.data || [], ratingIndex) : null),
    [metrics, player, players.data, ratingIndex]
  );
  const riskProfile = useMemo(() => (player && metrics ? buildRiskProfile(player, metrics) : null), [metrics, player]);
  const systemSuitability = useMemo(
    () => (player && metrics ? buildSystemSuitabilityProfile(player, metrics, strengthsWeaknesses) : null),
    [metrics, player, strengthsWeaknesses]
  );
  const reportsData = useMemo(
    () => (player && metrics ? buildPlayerReportsData({ player, metrics, players: players.data || [], ratingIndex }) : { analyticsReport: null, statsReport: null }),
    [metrics, player, players.data, ratingIndex]
  );

  useEffect(() => {
    if (!playerKey || typeof window === 'undefined') {
      return;
    }

    const storedMetricMode = window.localStorage.getItem(getMetricModeStorageKey(playerKey));
    setMetricMode(storedMetricMode === 'basic' || storedMetricMode === 'advanced' ? storedMetricMode : 'advanced');
  }, [playerKey]);

  useEffect(() => {
    if (!playerKey || !player) {
      return;
    }

    rememberRecentPlayer({
      id: playerKey,
      league: leagueName,
      name: player.player,
      pos: player.pos,
      squad: player.squad
    });
  }, [leagueName, player, playerKey]);

  if (players.loading) {
    return (
      <main className="player-details-page">
        <div className="details-shell">
          {header}
          <header className="details-topbar">
            <button className="back-button" type="button" onClick={onBack}>
              Back to players
            </button>
          </header>
          <p className="details-message">Loading player analysis...</p>
        </div>
      </main>
    );
  }

  if (players.error) {
    return (
      <main className="player-details-page">
        <div className="details-shell">
          {header}
          <header className="details-topbar">
            <button className="back-button" type="button" onClick={onBack}>
              Back to players
            </button>
          </header>
          <p className="details-message details-message--error">Unable to load player: {players.error}</p>
        </div>
      </main>
    );
  }

  if (!player || !metrics) {
    return (
      <main className="player-details-page">
        <div className="details-shell">
          {header}
          <header className="details-topbar">
            <button className="back-button" type="button" onClick={onBack}>
              Back to players
            </button>
          </header>
          <p className="details-message">Player not found.</p>
        </div>
      </main>
    );
  }

  function handleMetricModeChange(nextMode) {
    setMetricMode(nextMode);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(getMetricModeStorageKey(playerKey), nextMode);
    }
  }

  function handleViewChange(nextView) {
    onNavigate?.(buildPlayerViewUrl(playerKey, nextView));
  }

  function handleReportChange(nextReport) {
    onNavigate?.(buildPlayerViewUrl(playerKey, 'report', nextReport));
  }

  const isReportView = playerView === 'report';

  return (
    <main className="player-details-page">
      <div className="details-shell">
        {header}
        <header className="details-topbar">
          <div className="details-topbar__actions">
            <button className="secondary-button" type="button" onClick={onCompare}>
              Compare this player
            </button>
            <button className="back-button" type="button" onClick={onBack}>
              Back to players
            </button>
          </div>
        </header>

        <PlayerHeroCard leagueName={leagueName} metrics={metrics} onOpenTeam={onOpenTeam} player={player} />

        <ReportsNavigation
          activeView={playerView}
          onCompare={onCompare}
          onSelectView={handleViewChange}
        />

        {isReportView ? (
          <section className="reports-view">
            <div className="report-view-switch">
              <button
                className={`report-view-switch__button${playerReport === 'analytics' ? ' report-view-switch__button--active' : ''}`}
                onClick={() => handleReportChange('analytics')}
                type="button"
              >
                Player Analytics
              </button>
              <button
                className={`report-view-switch__button${playerReport === 'stats' ? ' report-view-switch__button--active' : ''}`}
                onClick={() => handleReportChange('stats')}
                type="button"
              >
                Stats
              </button>
            </div>

            {playerReport === 'stats' ? (
              <PlayerStatsReport report={reportsData.statsReport} />
            ) : (
              <PlayerAnalyticsReport averageLabel={reportsData.analyticsReport.averageLabel} playerLabel={formatTextValue(player.player)} report={reportsData.analyticsReport} />
            )}
          </section>
        ) : (
          <section className="details-layout">
            <ProfileSidebar leagueName={leagueName} onOpenTeam={onOpenTeam} player={player} />

            <section className="analysis-panel">
              {playerView === 'overview' ? (
                <>
                  <header className="analysis-hero">
                    <div className="analysis-hero__copy">
                      <p className="analysis-kicker">Overview</p>
                      <h2>{formatTextValue(player.player, 'Unknown Player')}</h2>
                      <p className="analysis-subtitle">
                        {formatTextValue(player.squad)} / {formatTextValue(metrics.exactPosition)} / {formatTextValue(player.nation)}
                      </p>
                    </div>

                    <div className="score-grid">
                      <div className="score-tile">
                        <span>Attack</span>
                        <strong>{metrics.attackScore}</strong>
                      </div>
                      <div className="score-tile">
                        <span>Creativity</span>
                        <strong>{metrics.creativityScore}</strong>
                      </div>
                      <div className="score-tile">
                        <span>Possession</span>
                        <strong>{metrics.possessionScore}</strong>
                      </div>
                      <div className="score-tile">
                        <span>Defending</span>
                        <strong>{metrics.defendingScore}</strong>
                      </div>
                    </div>
                  </header>

                  <section className="tactical-grid">
                    <TacticalProfileCard metrics={metrics} />
                    <RoleFitCard topRoles={metrics.topTacticalRoles} primaryRole={metrics.primaryTacticalRole} secondaryRole={metrics.secondaryTacticalRole} />
                  </section>

                  <section className="analysis-radar-section">
                    <PlayerRadarPanel metrics={metrics} />
                  </section>
                </>
              ) : playerView === 'similar' ? (
                <SimilarPlayersTab currentPlayer={player} leagueFilter={leagueFilter} onOpenPlayer={onOpenPlayer} players={players.data} ratingIndex={ratingIndex} />
              ) : (
                <>
                  <header className="analysis-hero analysis-hero--compact">
                    <div className="analysis-hero__copy">
                      <p className="analysis-kicker">Analysis</p>
                      <h2>Deep Player Analysis</h2>
                      <p className="analysis-subtitle">Role fit, scouting context, advanced metrics, and report entry points stay here while Similar Players now has its own dedicated top-level tab.</p>
                    </div>
                  </header>

                  <section className="analysis-insights-grid">
                    <ScoutingInsightsPanel
                      comparison={leagueComparison}
                      playerIdentifier={playerIdentifier}
                      riskProfile={riskProfile}
                      strengthsWeaknesses={strengthsWeaknesses}
                      systemSuitability={systemSuitability}
                    />
                  </section>

                  <section className="analysis-transfer-section">
                    <TeamFitPanel
                      metrics={metrics}
                      onOpenPlayer={onOpenPlayer}
                      player={player}
                      playerIdentifier={playerIdentifier}
                      players={players.data || []}
                      ratingIndex={ratingIndex}
                      teams={teams}
                    />
                  </section>

                  <div className="metric-mode-tabs">
                    <button className={`metric-mode-tabs__button${metricMode === 'basic' ? ' metric-mode-tabs__button--active' : ''}`} onClick={() => handleMetricModeChange('basic')} type="button">
                      Basic Stats
                    </button>
                    <button className={`metric-mode-tabs__button${metricMode === 'advanced' ? ' metric-mode-tabs__button--active' : ''}`} onClick={() => handleMetricModeChange('advanced')} type="button">
                      Advanced Metrics
                    </button>
                  </div>

                  <div className={`metric-mode-panel${metricMode === 'advanced' ? ' metric-mode-panel--advanced' : ' metric-mode-panel--basic'}`}>
                    {metricMode === 'advanced' ? <PlayerScoutingReport metrics={metrics} playerName={player.player} /> : <PlayerBasicStatsReport playerName={player.player} sections={basicSections} />}
                  </div>

                  <section className="analysis-report-launchers">
                    <div className="analysis-report-launchers__header">
                      <div>
                        <p className="analysis-kicker">Reports</p>
                        <h3>Open Player Reports</h3>
                        <p className="analysis-subtitle">Jump into the cleaner report views from here without mixing them into the core analysis page.</p>
                      </div>
                    </div>

                    <div className="analysis-report-launchers__grid">
                      <button className="analysis-report-tile" onClick={() => handleReportChange('analytics')} type="button">
                        <span>Player Analytics</span>
                        <strong>Radar cards and generated peer insights</strong>
                        <small>Position-specific normalized metrics against league or positional averages.</small>
                      </button>
                      <button className="analysis-report-tile" onClick={() => handleReportChange('stats')} type="button">
                        <span>Stats</span>
                        <strong>Competition table and visual stat blocks</strong>
                        <small>Per-competition output, season summary, and position-aware donuts.</small>
                      </button>
                    </div>
                  </section>
                </>
              )}
            </section>
          </section>
        )}
      </div>
    </main>
  );
}
