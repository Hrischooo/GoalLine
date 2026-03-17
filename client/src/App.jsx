import { useEffect, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader';
import Home from './pages/Home';
import Compare from './pages/Compare';
import LeagueOverviewPage from './pages/LeagueOverviewPage';
import LeagueDetails from './pages/LeagueDetails';
import PlayerDetails from './pages/PlayerDetails';
import { buildPlayerRatingIndex } from './utils/playerMetrics';
import {
  buildLeagueCatalogue,
  buildPlayerKey,
  buildSearchPlayerRecords,
  filterPlayersByLeague,
  getAllPlayers,
  getCanonicalPlayers,
  getLeagueFilterValue,
  getPlayerByIdOrUniqueKey,
  LEAGUE_FILTERS
} from './utils/dataset';

const API_BASE_URL = 'http://localhost:5000/api';

function getRoute(locationLike = window.location) {
  const pathname = locationLike.pathname || '/';
  const search = locationLike.search || '';
  const searchParams = new URLSearchParams(search);

  if (pathname === '/compare') {
    return {
      page: 'compare',
      player1: searchParams.get('player1') || '',
      player2: searchParams.get('player2') || '',
      playerId: '',
      playerName: '',
      leagueId: ''
    };
  }

  if (pathname === '/leagues') {
    return {
      page: 'league-overview',
      player1: '',
      player2: '',
      playerId: '',
      playerName: '',
      leagueId: ''
    };
  }

  if (pathname.startsWith('/player/')) {
    const playerId = decodeURIComponent(pathname.replace('/player/', ''));

    if (playerId) {
      return {
        page: 'player-details',
        playerId,
        playerName: '',
        player1: '',
        player2: '',
        leagueId: ''
      };
    }
  }

  if (pathname.startsWith('/players/')) {
    const playerName = decodeURIComponent(pathname.replace('/players/', ''));

    if (playerName) {
      return {
        page: 'player-details',
        playerId: '',
        playerName,
        player1: '',
        player2: '',
        leagueId: ''
      };
    }
  }

  if (pathname.startsWith('/league/')) {
    const leagueId = decodeURIComponent(pathname.replace('/league/', ''));

    if (leagueId) {
      return {
        page: 'league-details',
        player1: '',
        player2: '',
        playerId: '',
        playerName: '',
        leagueId
      };
    }
  }

  return {
    page: 'home',
    player1: '',
    player2: '',
    playerId: '',
    playerName: '',
    leagueId: ''
  };
}

function toTitleCase(value = '') {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function App() {
  const [status, setStatus] = useState({ loading: true, error: '', data: null });
  const [players, setPlayers] = useState({ loading: true, error: '', data: [], count: 0, columns: [] });
  const [route, setRoute] = useState(() => getRoute(window.location));
  const [leagueFilter, setLeagueFilter] = useState(LEAGUE_FILTERS.all.id);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
          throw new Error(`Health check failed with status ${response.status}`);
        }

        const data = await response.json();
        setStatus({ loading: false, error: '', data });
      } catch (error) {
        setStatus({ loading: false, error: error.message, data: null });
      }
    }

    async function loadPlayers() {
      try {
        const response = await fetch(`${API_BASE_URL}/players`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Players request failed with status ${response.status}`);
        }

        const data = await response.json();
        setPlayers({
          loading: false,
          error: '',
          data: data.players || [],
          count: data.count || 0,
          columns: data.columns || []
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setPlayers({ loading: false, error: error.message, data: [], count: 0, columns: [] });
        }
      }
    }

    loadHealth();
    loadPlayers();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (players.loading || players.error) {
      return;
    }

    const allPlayers = getCanonicalPlayers(getAllPlayers(players.data || []));
    const premierLeaguePlayers = filterPlayersByLeague(allPlayers, LEAGUE_FILTERS.premier_league.id).length;
    const bundesligaPlayers = filterPlayersByLeague(allPlayers, LEAGUE_FILTERS.bundesliga.id).length;

    console.debug('[all-players]', {
      totalPlayersLoaded: allPlayers.length,
      premierLeaguePlayers,
      bundesligaPlayers
    });
  }, [players.data, players.error, players.loading]);

  useEffect(() => {
    function handlePopState() {
      setRoute(getRoute(window.location));
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function navigateTo(nextPath, options = {}) {
    const url = new URL(nextPath, window.location.origin);
    const nextLocation = {
      pathname: url.pathname,
      search: url.search
    };

    if (options.replace) {
      window.history.replaceState({}, '', `${url.pathname}${url.search}`);
    } else {
      window.history.pushState({}, '', `${url.pathname}${url.search}`);
    }

    window.scrollTo(0, 0);
    setRoute(getRoute(nextLocation));
  }

  const canonicalPlayers = useMemo(() => getCanonicalPlayers(getAllPlayers(players.data || [])), [players.data]);
  const filteredPlayers = useMemo(() => filterPlayersByLeague(canonicalPlayers, leagueFilter), [canonicalPlayers, leagueFilter]);
  const ratingIndex = useMemo(() => buildPlayerRatingIndex(canonicalPlayers), [canonicalPlayers]);
  const leagues = useMemo(() => buildLeagueCatalogue(canonicalPlayers, ratingIndex), [canonicalPlayers, ratingIndex]);
  const visibleLeagues = useMemo(
    () => (leagueFilter === LEAGUE_FILTERS.all.id ? leagues : leagues.filter((league) => league.id === leagueFilter)),
    [leagueFilter, leagues]
  );
  const searchPlayers = useMemo(() => buildSearchPlayerRecords(filteredPlayers), [filteredPlayers]);

  const fullPlayerDataset = useMemo(
    () => ({
      ...players,
      data: canonicalPlayers,
      totalRows: players.count || (players.data || []).length,
      uniquePlayers: canonicalPlayers.length
    }),
    [canonicalPlayers, players]
  );

  const filteredPlayerDataset = useMemo(
    () => ({
      ...fullPlayerDataset,
      data: filteredPlayers,
      uniquePlayers: filteredPlayers.length
    }),
    [filteredPlayers, fullPlayerDataset]
  );

  const resolvedPlayer = useMemo(
    () => getPlayerByIdOrUniqueKey(canonicalPlayers, route.playerId || route.playerName),
    [canonicalPlayers, route.playerId, route.playerName]
  );

  const header = (
    <AppHeader
      activePage={route.page}
      leagueFilter={leagueFilter}
      leagues={visibleLeagues}
      onNavigate={navigateTo}
      onLeagueFilterChange={setLeagueFilter}
      players={searchPlayers}
    />
  );

  if (route.page === 'player-details') {
    return (
      <PlayerDetails
        header={header}
        leagueFilter={leagueFilter}
        playerIdentifier={route.playerId || route.playerName || ''}
        players={fullPlayerDataset}
        ratingIndex={ratingIndex}
        onBack={() => navigateTo('/')}
        onCompare={() => navigateTo(`/compare?player1=${encodeURIComponent(resolvedPlayer ? buildPlayerKey(resolvedPlayer) : '')}`)}
        onOpenPlayer={(playerKey) => navigateTo(`/player/${encodeURIComponent(playerKey)}`)}
      />
    );
  }

  if (route.page === 'league-details') {
    return (
      <LeagueDetails
        header={header}
        leagueId={route.leagueId}
        leagues={leagues}
        onNavigate={navigateTo}
        players={fullPlayerDataset}
        ratingIndex={ratingIndex}
      />
    );
  }

  if (route.page === 'league-overview') {
    return <LeagueOverviewPage header={header} leagues={visibleLeagues} onNavigate={navigateTo} />;
  }

  if (route.page === 'compare') {
    return (
      <Compare
        header={header}
        initialPlayer1={route.player1}
        initialPlayer2={route.player2}
        leagueFilter={leagueFilter}
        players={fullPlayerDataset}
        ratingIndex={ratingIndex}
        onNavigate={navigateTo}
      />
    );
  }

  return (
    <Home header={header} leagueFilter={leagueFilter} leagues={leagues} status={status} players={filteredPlayerDataset} onNavigate={navigateTo} />
  );
}
