import { useEffect } from 'react';
import LeagueCard from '../components/LeagueCard';
import '../styles/league-details.css';

export default function LeagueOverviewPage({ header, leagues, onNavigate }) {
  useEffect(() => {
    console.debug('[league-overview]', {
      renderedLeagues: leagues.map((league) => league.id),
      premierLeagueVisible: leagues.some((league) => league.id === 'premier_league'),
      bundesligaVisible: leagues.some((league) => league.id === 'bundesliga')
    });
  }, [leagues]);

  return (
    <main className="league-page">
      <div className="league-shell">
        {header}

        <section className="league-overview-page__hero">
          <div>
            <p className="home-kicker">Multi-League Discovery</p>
            <h1>Browse leagues as scouting environments, not just filtered lists.</h1>
            <p className="league-overview-page__subtitle">
              Each competition opens into its own tactical explorer with leaderboards, role filters, and position-aware player discovery.
            </p>
          </div>

          <div className="league-overview-page__summary">
            <div>
              <span>Leagues</span>
              <strong>{leagues.length}</strong>
            </div>
            <div>
              <span>Total Players</span>
              <strong>{leagues.reduce((sum, league) => sum + league.playersCount, 0)}</strong>
            </div>
            <div>
              <span>Top Rated Indexed</span>
              <strong>{leagues.map((league) => league.topRatedValue).sort((a, b) => b - a)[0] || 0}</strong>
            </div>
          </div>
        </section>

        <section className="league-overview-page__grid">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} onOpen={(nextLeagueId) => onNavigate(`/league/${nextLeagueId}`)} />
          ))}
        </section>
      </div>
    </main>
  );
}
