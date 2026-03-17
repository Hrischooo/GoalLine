import '../styles/search.css';
import AppLogo from './AppLogo';
import SearchBar from './SearchBar';
import { LEAGUE_FILTERS } from '../utils/dataset';

function getActiveClass(activePage, targetPages) {
  return targetPages.includes(activePage) ? ' app-header__nav-link--active' : '';
}

export default function AppHeader({ activePage, leagueFilter, leagues, onNavigate, onLeagueFilterChange, players }) {
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
          className={`app-header__nav-link${getActiveClass(activePage, ['league-overview', 'league-details'])}`}
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

      <SearchBar
        leagueFilter={leagueFilter}
        leagueOptions={Object.values(LEAGUE_FILTERS)}
        leagues={leagues}
        onLeagueFilterChange={onLeagueFilterChange}
        onNavigate={onNavigate}
        players={players}
      />
    </header>
  );
}
