import { useEffect, useMemo, useState } from 'react';
import '../styles/player-details.css';
import PlayerBasicStatsReport from '../components/PlayerBasicStatsReport';
import PlayerHeroCard from '../components/PlayerHeroCard';
import PlayerScoutingReport from '../components/PlayerScoutingReport';
import RoleFitCard from '../components/RoleFitCard';
import SimilarPlayersTab from '../components/SimilarPlayersTab';
import TacticalProfileCard from '../components/TacticalProfileCard';
import { computeDisplayMetrics, formatStatValue, formatTextValue } from '../utils/playerMetrics';
import { buildPlayerKey, getLeagueName, getPlayerByIdOrUniqueKey } from '../utils/dataset';
import { buildBasicReportSections } from '../utils/playerViews';
import { rememberRecentPlayer } from '../utils/recentPlayers';

function getMetricModeStorageKey(playerKey) {
  return `goalline-player-metric-mode:${playerKey}`;
}

export default function PlayerDetails({ header, leagueFilter, playerIdentifier, players, ratingIndex, onBack, onCompare, onOpenPlayer }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [metricMode, setMetricMode] = useState('advanced');

  useEffect(() => {
    setActiveTab('overview');
  }, [playerIdentifier]);

  const player = getPlayerByIdOrUniqueKey(players.data, playerIdentifier);
  const metrics = player ? computeDisplayMetrics(player, ratingIndex) : null;
  const leagueName = player ? getLeagueName(player) : '';
  const playerKey = player ? buildPlayerKey(player) : '';
  const basicSections = useMemo(() => (player && metrics ? buildBasicReportSections(player, metrics) : []), [metrics, player]);

  useEffect(() => {
    if (!playerKey || typeof window === 'undefined') {
      return;
    }

    const storedMetricMode = window.localStorage.getItem(getMetricModeStorageKey(playerKey));

    if (storedMetricMode === 'basic' || storedMetricMode === 'advanced') {
      setMetricMode(storedMetricMode);
    } else {
      setMetricMode('advanced');
    }
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

  if (!player) {
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

        <PlayerHeroCard leagueName={leagueName} metrics={metrics} player={player} />

        <section className="details-layout">
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
                  <dd>{formatTextValue(player.squad)}</dd>
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
              </dl>
            </div>
          </aside>

          <section className="analysis-panel">
            <div className="analysis-tabs">
              <button
                className={`analysis-tabs__button${activeTab === 'overview' ? ' analysis-tabs__button--active' : ''}`}
                onClick={() => setActiveTab('overview')}
                type="button"
              >
                Overview
              </button>
              <button
                className={`analysis-tabs__button${activeTab === 'similar' ? ' analysis-tabs__button--active' : ''}`}
                onClick={() => setActiveTab('similar')}
                type="button"
              >
                Similar Players
              </button>
            </div>

            {activeTab === 'overview' ? (
              <>
                <header className="analysis-hero">
                  <div className="analysis-hero__copy">
                    <p className="analysis-kicker">Player Analysis</p>
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
                  <RoleFitCard
                    topRoles={metrics.topTacticalRoles}
                    primaryRole={metrics.primaryTacticalRole}
                    secondaryRole={metrics.secondaryTacticalRole}
                  />
                </section>

                <div className="metric-mode-tabs">
                  <button
                    className={`metric-mode-tabs__button${metricMode === 'basic' ? ' metric-mode-tabs__button--active' : ''}`}
                    onClick={() => handleMetricModeChange('basic')}
                    type="button"
                  >
                    Basic Stats
                  </button>
                  <button
                    className={`metric-mode-tabs__button${metricMode === 'advanced' ? ' metric-mode-tabs__button--active' : ''}`}
                    onClick={() => handleMetricModeChange('advanced')}
                    type="button"
                  >
                    Advanced Metrics
                  </button>
                </div>

                <div className={`metric-mode-panel${metricMode === 'advanced' ? ' metric-mode-panel--advanced' : ' metric-mode-panel--basic'}`}>
                  {metricMode === 'advanced' ? (
                    <PlayerScoutingReport metrics={metrics} playerName={player.player} />
                  ) : (
                    <PlayerBasicStatsReport playerName={player.player} sections={basicSections} />
                  )}
                </div>
              </>
            ) : (
              <SimilarPlayersTab
                currentPlayer={player}
                leagueFilter={leagueFilter}
                onOpenPlayer={onOpenPlayer}
                players={players.data}
                ratingIndex={ratingIndex}
              />
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
