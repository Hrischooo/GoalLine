import { useEffect, useMemo, useState } from 'react';
import '../styles/home.css';
import ClubBadge from '../components/ClubBadge';
import { formatStatValue, formatTextValue } from '../utils/playerMetrics';
import { buildPlayerKey, getLeagueDisplayName, getLeagueName, getSeasonDatasetLabel, LEAGUE_FILTERS } from '../utils/dataset';

const INITIAL_VISIBLE_PLAYERS = 60;
const LOAD_MORE_PLAYERS = 60;

export default function Home({ header, leagueFilter, leagues, status, players, onNavigate }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PLAYERS);
  const loadedPlayers = players.data || [];
  const seasonLabel = getSeasonDatasetLabel(loadedPlayers);
  const visiblePlayers = useMemo(() => loadedPlayers.slice(0, visibleCount), [loadedPlayers, visibleCount]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_PLAYERS);
  }, [loadedPlayers.length]);

  function scrollToPlayers() {
    const section = document.getElementById('players');

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <main className="home-page">
      <div className="home-shell">
        {header}

        <section className="home-hero">
          <div className="home-hero__copy">
            <p className="home-kicker">Full database scouting workspace</p>
            <h1>GoalLine turns raw football data into player decisions.</h1>
            <p className="home-subtitle">
              Browse the full player database, open detailed scouting screens with complete stat objects, and compare any
              two players in the dataset.
            </p>

            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => onNavigate('/compare')}>
                Open compare
              </button>
              <button className="secondary-button" type="button" onClick={() => onNavigate('/leagues')}>
                Explore leagues
              </button>
              <button className="secondary-button" type="button" onClick={scrollToPlayers}>
                Browse players
              </button>
            </div>
          </div>

          <div className="hero-highlight">
            <div className="hero-highlight__top">
              <span>Live dataset</span>
              <strong>Full database</strong>
            </div>
            <div className="hero-highlight__metrics">
              <div>
                <span>Profiles loaded</span>
                <strong>{players.loading ? '...' : players.uniquePlayers}</strong>
              </div>
              <div>
                <span>Rows loaded</span>
                <strong>{players.loading ? '...' : players.totalRows}</strong>
              </div>
              <div>
                <span>Season dataset</span>
                <strong>{seasonLabel}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="info-strip">
          <article className="info-card">
            <span>Database status</span>
            <strong>{status.loading ? 'Checking' : status.error ? 'Unavailable' : 'Connected'}</strong>
            <p>{status.error ? status.error : 'Express and PostgreSQL are responding.'}</p>
          </article>
          <article className="info-card">
            <span>Search scope</span>
            <strong>{players.loading ? '...' : players.uniquePlayers}</strong>
            <p>Global search now indexes every loaded player instead of a capped sample.</p>
          </article>
          <article className="info-card">
            <span>Leagues indexed</span>
            <strong>{players.loading ? '...' : new Set(loadedPlayers.map((player) => getLeagueName(player))).size}</strong>
            <p>League views are derived from the same full-database player source.</p>
          </article>
          <article className="info-card">
            <span>Connection time</span>
            <strong>{status.data?.time ? new Date(status.data.time).toLocaleTimeString() : 'N/A'}</strong>
            <p>Latest successful API heartbeat from the backend.</p>
          </article>
        </section>

        <section className="browser-section">
          <div className="section-heading">
            <div>
              <p className="home-kicker">League Discovery</p>
              <h2>Start From The Competition Layer</h2>
              <p className="home-subtitle">Open a league workspace to scout role types, leaders, and filtered player pools.</p>
            </div>
            <button className="secondary-button" type="button" onClick={() => onNavigate('/leagues')}>
              View all leagues
            </button>
          </div>

          <div className="home-leagues-grid">
            {leagues.map((league) => (
              <button className="home-league-card" key={league.id} onClick={() => onNavigate(`/league/${league.id}`)} type="button">
                <div className="home-league-card__top">
                  <span>{league.name}</span>
                  <strong>{league.averageOVR}</strong>
                </div>
                <p>
                  {league.playersCount} players / {league.clubs} clubs / {league.season}
                </p>
                <div className="home-league-card__meta">
                  <span>Top scorer: {league.topScorer}</span>
                  <span>Top assister: {league.topAssister}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="browser-section" id="players">
          <div className="section-heading">
            <div>
              <p className="home-kicker">Player browser</p>
              <h2>Complete Player Database</h2>
              <p className="home-subtitle">
                {leagueFilter === LEAGUE_FILTERS.all.id ? 'Showing all supported leagues.' : `Filtered to ${getLeagueDisplayName(leagueFilter)}.`}
              </p>
            </div>
            <button className="secondary-button" type="button" onClick={() => onNavigate('/compare')}>
              Compare two players
            </button>
          </div>

          {players.error ? <p className="message error-message">Unable to load players: {players.error}</p> : null}
          {players.loading ? <p className="message">Loading full database...</p> : null}

          {!players.loading && !players.error ? (
            <>
              <section className="players-grid">
                {visiblePlayers.map((player, index) => (
                  <button
                    className="player-card player-card--interactive home-player-card"
                    key={`${player.player}-${player.squad}-${player.season}-${index}`}
                    onClick={() => onNavigate(`/player/${buildPlayerKey(player)}`)}
                    type="button"
                  >
                    <div className="player-card__header">
                      <div className="player-card__identity">
                        <ClubBadge name={player.squad} size="medium" />
                        <div>
                          <h2>{formatTextValue(player.player, 'Unknown Player')}</h2>
                          <p>
                            {formatTextValue(player.squad)} / {formatTextValue(getLeagueName(player))} / {formatTextValue(player.pos)}
                          </p>
                        </div>
                      </div>
                      <span className="player-card__nation">{formatTextValue(player.nation)}</span>
                    </div>
                    <div className="player-stats">
                      <div>
                        <span>Goals</span>
                        <strong className="accent-lime">{formatStatValue(player.goals)}</strong>
                      </div>
                      <div>
                        <span>Assists</span>
                        <strong className="accent-cyan">{formatStatValue(player.assists)}</strong>
                      </div>
                      <div>
                        <span>xG</span>
                        <strong className="accent-teal">{formatStatValue(player.expected_goals)}</strong>
                      </div>
                    </div>

                    <div className="player-card__footer">
                      <span>View analysis</span>
                      <strong>{formatTextValue(player.season)}</strong>
                    </div>
                  </button>
                ))}
              </section>

              <div className="browser-footer">
                <span>
                  Showing {visiblePlayers.length} of {loadedPlayers.length} players
                </span>
                {visiblePlayers.length < loadedPlayers.length ? (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setVisibleCount((current) => Math.min(current + LOAD_MORE_PLAYERS, loadedPlayers.length))}
                  >
                    Load more players
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
