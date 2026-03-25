import '../styles/home.css';
import '../styles/league-details.css';
import LeagueCard from '../components/LeagueCard';
import PlayerDiscoverySection from '../components/PlayerDiscoverySection';
import { getSeasonDatasetLabel } from '../utils/dataset';

export default function Home({ header, leagues, status, players, ratingIndex, onNavigate }) {
  const loadedPlayers = players.data || [];
  const seasonLabel = getSeasonDatasetLabel(loadedPlayers);

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
              <LeagueCard key={league.id} league={league} onOpen={(leagueId) => onNavigate(`/league/${leagueId}`)} />
            ))}
          </div>
        </section>

        {players.error ? <p className="message error-message">Unable to load players: {players.error}</p> : null}
        {players.loading ? <p className="message">Loading full database...</p> : null}

        {!players.loading && !players.error ? <PlayerDiscoverySection onNavigate={onNavigate} players={loadedPlayers} ratingIndex={ratingIndex} /> : null}
      </div>
    </main>
  );
}
