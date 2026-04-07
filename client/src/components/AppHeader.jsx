import '../styles/search.css';
import AppLogo from './AppLogo';
import SearchBar from './SearchBar';

function getActiveClass(activePage, targetPages) {
  return targetPages.includes(activePage) ? ' app-header__nav-link--active' : '';
}

export default function AppHeader({ activePage, leagues, onNavigate, players, teams }) {
  return (
    <header className="app-header">
      <button className="brand-lockup" type="button" onClick={() => onNavigate('/')}>
        <AppLogo />
        <span className="brand-lockup__copy">
          <small>Scouting Workspace</small>
          <strong>GoalLine</strong>
        </span>
      </button>

      <div className="app-header__center">
        <nav aria-label="Primary" className="app-header__nav">
          <button
            className={`app-header__nav-link${getActiveClass(activePage, ['home', 'player-details'])}`}
            onClick={() => onNavigate('/')}
            type="button"
          >
            Players
          </button>
          <button
            className={`app-header__nav-link${getActiveClass(activePage, ['league-overview', 'league-details', 'team-details'])}`}
            onClick={() => onNavigate('/leagues')}
            type="button"
          >
            Leagues
          </button>
          <button
            className={`app-header__nav-link${getActiveClass(activePage, ['compare'])}`}
            onClick={() => onNavigate('/compare')}
            type="button"
          >
            Compare
          </button>
        </nav>
        <p className="app-header__meta">Premium player, team, and squad intelligence across the full dataset.</p>
      </div>

      <SearchBar leagues={leagues} onNavigate={onNavigate} players={players} teams={teams} />
    </header>
  );
}
