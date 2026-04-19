import { useEffect, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader';
import Home from './pages/Home';
import Compare from './pages/Compare';
import LeagueOverviewPage from './pages/LeagueOverviewPage';
import LeagueDetails from './pages/LeagueDetails';
import PlayerDetails from './pages/PlayerDetails';
import TeamDetails from './pages/TeamDetails';
import { buildPlayerRatingIndex } from './utils/playerMetrics';
import {
  buildLeagueCatalogue,
  buildPlayerKey,
  buildTeamCatalogue,
  buildTeamSearchRecords,
  buildSearchPlayerRecords,
  findTeamBySquadName,
  getAllPlayers,
  getCanonicalPlayers,
  getPlayerByIdOrUniqueKey,
  LEAGUE_FILTERS
} from './utils/dataset';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getRoute(locationLike = window.location) {
  const pathname = locationLike.pathname || '/';
  const search = locationLike.search || '';
  const searchParams = new URLSearchParams(search);
  const playerView = searchParams.get('view') || 'overview';
  const playerReport = searchParams.get('report') || 'analytics';

  if (pathname === '/compare') {
    const compareMode = searchParams.get('mode') === 'teams' ? 'teams' : 'players';
    return {
      page: 'compare',
      player1: searchParams.get('player1') || '',
      player2: searchParams.get('player2') || '',
      compareMode,
      team1: searchParams.get('team1') || '',
      team2: searchParams.get('team2') || '',
      playerId: '',
      playerName: '',
      playerView: 'overview',
      playerReport: 'analytics',
      leagueId: '',
      teamName: ''
    };
  }

  if (pathname === '/leagues') {
    return {
      page: 'league-overview',
      player1: '',
      player2: '',
      playerId: '',
      playerName: '',
      playerView: 'overview',
      playerReport: 'analytics',
      leagueId: '',
      teamName: ''
    };
  }

  if (pathname.startsWith('/player/')) {
    const playerId = decodeURIComponent(pathname.replace('/player/', ''));

    if (playerId) {
      return {
        page: 'player-details',
        playerId,
        playerName: '',
        playerView: playerView === 'analysis' || playerView === 'report' || playerView === 'similar' ? playerView : 'overview',
        playerReport: playerReport === 'stats' ? 'stats' : 'analytics',
        player1: '',
        player2: '',
        leagueId: '',
        teamName: ''
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
        playerView: playerView === 'analysis' || playerView === 'report' || playerView === 'similar' ? playerView : 'overview',
        playerReport: playerReport === 'stats' ? 'stats' : 'analytics',
        player1: '',
        player2: '',
        leagueId: '',
        teamName: ''
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
        playerView: 'overview',
        playerReport: 'analytics',
        leagueId,
        teamName: ''
      };
    }
  }

  if (pathname.startsWith('/teams/')) {
    const teamName = decodeURIComponent(pathname.replace('/teams/', ''));

    if (teamName) {
      return {
        page: 'team-details',
        player1: '',
        player2: '',
        playerId: '',
        playerName: '',
        playerView: 'overview',
        playerReport: 'analytics',
        leagueId: '',
        teamName
      };
    }
  }

  return {
    page: 'home',
    player1: '',
    player2: '',
    playerId: '',
    playerName: '',
    playerView: 'overview',
    playerReport: 'analytics',
    leagueId: '',
    teamName: ''
  };
}

export default function App() {
  const [status, setStatus] = useState({ loading: true, error: '', data: null });
  const [players, setPlayers] = useState({ loading: true, error: '', data: [], count: 0, columns: [] });
  const [teams, setTeams] = useState({ loading: true, error: '', data: [], count: 0 });
  const [route, setRoute] = useState(() => getRoute(window.location));

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

    async function loadTeams() {
      try {
        const response = await fetch(`${API_BASE_URL}/teams`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Teams request failed with status ${response.status}`);
        }

        const data = await response.json();
        setTeams({
          loading: false,
          error: '',
          data: data.teams || [],
          count: data.count || 0
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setTeams({ loading: false, error: error.message, data: [], count: 0 });
        }
      }
    }

    loadHealth();
    loadPlayers();
    loadTeams();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (players.loading || players.error) {
      return;
    }

    const allPlayers = getCanonicalPlayers(getAllPlayers(players.data || []));
    const premierLeaguePlayers = allPlayers.filter((player) => player.league === 'Premier League' || player.comp === 'Premier League').length;
    const bundesligaPlayers = allPlayers.filter((player) => player.league === 'Bundesliga' || player.comp === 'Bundesliga').length;

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
  const ratingIndex = useMemo(() => buildPlayerRatingIndex(canonicalPlayers), [canonicalPlayers]);
  const leagues = useMemo(() => buildLeagueCatalogue(canonicalPlayers, ratingIndex), [canonicalPlayers, ratingIndex]);
  const teamProfiles = useMemo(() => buildTeamCatalogue(teams.data || [], canonicalPlayers, ratingIndex), [canonicalPlayers, ratingIndex, teams.data]);
  const searchPlayers = useMemo(() => buildSearchPlayerRecords(canonicalPlayers, ratingIndex), [canonicalPlayers, ratingIndex]);
  const searchTeams = useMemo(() => buildTeamSearchRecords(teamProfiles), [teamProfiles]);

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
      data: canonicalPlayers,
      uniquePlayers: canonicalPlayers.length
    }),
    [canonicalPlayers, fullPlayerDataset]
  );

  const resolvedPlayer = useMemo(
    () => getPlayerByIdOrUniqueKey(canonicalPlayers, route.playerId || route.playerName),
    [canonicalPlayers, route.playerId, route.playerName]
  );
  const resolvedPlayerTeam = useMemo(
    () => findTeamBySquadName(teamProfiles, resolvedPlayer?.squad || ''),
    [resolvedPlayer?.squad, teamProfiles]
  );

  const header = (
    <AppHeader
      activePage={route.page}
      leagues={leagues}
      onNavigate={navigateTo}
      players={searchPlayers}
      teams={searchTeams}
    />
  );

  if (route.page === 'player-details') {
    return (
      <PlayerDetails
        header={header}
        leagueFilter={LEAGUE_FILTERS.all.id}
        playerIdentifier={route.playerId || route.playerName || ''}
        playerReport={route.playerReport}
        playerView={route.playerView}
        players={fullPlayerDataset}
        teams={teamProfiles}
        ratingIndex={ratingIndex}
        onBack={() => navigateTo('/')}
        onCompare={() => navigateTo(`/compare?player1=${encodeURIComponent(resolvedPlayer ? buildPlayerKey(resolvedPlayer) : '')}`)}
        onNavigate={navigateTo}
        onOpenPlayer={(playerKey) => navigateTo(`/player/${encodeURIComponent(playerKey)}`)}
        onOpenTeam={() => {
          if (resolvedPlayerTeam) {
            navigateTo(`/teams/${encodeURIComponent(resolvedPlayerTeam.id)}`);
          }
        }}
      />
    );
  }

  if (route.page === 'team-details') {
    return (
      <TeamDetails
        header={header}
        players={fullPlayerDataset}
        ratingIndex={ratingIndex}
        teamIdentifier={route.teamName}
        teams={{ ...teams, data: teamProfiles }}
        onNavigate={navigateTo}
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
        teams={teamProfiles}
      />
    );
  }

  if (route.page === 'league-overview') {
    return <LeagueOverviewPage header={header} leagues={leagues} onNavigate={navigateTo} />;
  }

  if (route.page === 'compare') {
    return (
      <Compare
        header={header}
        initialPlayer1={route.player1}
        initialPlayer2={route.player2}
        initialMode={route.compareMode}
        initialTeam1={route.team1}
        initialTeam2={route.team2}
        players={fullPlayerDataset}
        ratingIndex={ratingIndex}
        teams={teamProfiles}
        onNavigate={navigateTo}
      />
    );
  }

  return <Home header={header} leagues={leagues} status={status} players={filteredPlayerDataset} ratingIndex={ratingIndex} teams={teamProfiles} onNavigate={navigateTo} />;
}
