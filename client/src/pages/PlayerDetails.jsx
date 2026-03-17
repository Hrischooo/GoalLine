import { useEffect, useState } from 'react';
import '../styles/player-details.css';
import PlayerHeroCard from '../components/PlayerHeroCard';
import RoleFitCard from '../components/RoleFitCard';
import SimilarPlayersTab from '../components/SimilarPlayersTab';
import TacticalProfileCard from '../components/TacticalProfileCard';
import { computeDisplayMetrics, formatStatValue, formatTextValue } from '../utils/playerMetrics';
import { buildPlayerStatGroups, getLeagueName, getPlayerByIdOrUniqueKey } from '../utils/dataset';

const HIGHLIGHT_STATS = [
  ['Goals', 'goals'],
  ['Assists', 'assists'],
  ['xG', 'expected_goals'],
  ['Shots P90', 'shots_p90'],
  ['Key Passes', 'key_passes']
];

export default function PlayerDetails({ header, leagueFilter, playerIdentifier, players, ratingIndex, onBack, onCompare, onOpenPlayer }) {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setActiveTab('overview');
  }, [playerIdentifier]);

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

  const player = getPlayerByIdOrUniqueKey(players.data, playerIdentifier);

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

  const metrics = computeDisplayMetrics(player, ratingIndex);
  const statGroups = buildPlayerStatGroups(player);
  const leagueName = getLeagueName(player);

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

                <section className="highlights-grid">
                  {HIGHLIGHT_STATS.map(([label, key]) => (
                    <article className="highlight-card" key={key}>
                      <span>{label}</span>
                      <strong>{formatStatValue(player[key], 'N/A')}</strong>
                    </article>
                  ))}
                </section>

                <section className="overview-strip">
                  <article className="overview-card">
                    <span>Goals + Assists</span>
                    <strong>{formatStatValue(player.goals_and_assists, 'N/A')}</strong>
                  </article>
                  <article className="overview-card">
                    <span>Goals P90</span>
                    <strong>{formatStatValue(player.goals_p90, 'N/A')}</strong>
                  </article>
                  <article className="overview-card">
                    <span>Assists P90</span>
                    <strong>{formatStatValue(player.assists_p90, 'N/A')}</strong>
                  </article>
                  <article className="overview-card">
                    <span>xG Non-Penalty</span>
                    <strong>{formatStatValue(player.exp_npg, 'N/A')}</strong>
                  </article>
                </section>

                <section className="groups-grid">
                  {statGroups.map((group) => (
                    <article className="group-card" key={group.title}>
                      <div className="group-card__header">
                        <h3>{group.title}</h3>
                      </div>

                      <div className="group-card__stats">
                        {group.items.map((item) => (
                          <div className="stat-row" key={item.key}>
                            <span>{item.label}</span>
                            <strong>{formatStatValue(item.value, 'N/A')}</strong>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </section>
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
