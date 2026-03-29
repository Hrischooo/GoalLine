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
        <span>
          <strong>GoalLine</strong>
          <small>Football analytics</small>
        </span>
      </button>

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

      <SearchBar leagues={leagues} onNavigate={onNavigate} players={players} teams={teams} />
    </header>
  );
}
