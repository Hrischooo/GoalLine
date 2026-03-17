import { useEffect, useMemo, useState } from 'react';
import LeagueFiltersBar from '../components/LeagueFiltersBar';
import LeagueLeaderboardSection from '../components/LeagueLeaderboardSection';
import LeaguePlayerExplorer from '../components/LeaguePlayerExplorer';
import LeagueSummaryHeader from '../components/LeagueSummaryHeader';
import '../styles/league-details.css';
import { computeDisplayMetrics, toNumber } from '../utils/playerMetrics';
import { buildPlayerKey, getLeagueById, getLeaguePlayers } from '../utils/dataset';
import { normalizeString } from '../utils/search';

const INITIAL_FILTERS = {
  search: '',
  club: 'all',
  exactPosition: 'all',
  exactPositionGroup: 'all',
  nation: 'all',
  primaryRole: 'all',
  secondaryRole: 'all',
  roleConfidence: 'all',
  ageMin: '',
  ageMax: '',
  rankingView: 'top_rated',
  sortKey: 'finalOVR'
};
const INITIAL_VISIBLE_PLAYERS = 24;

const SORT_OPTIONS = {
  finalOVR: {
    label: 'Overall Rating',
    getValue: (player) => player.finalOVR
  },
  goals: {
    label: 'Goals',
    getValue: (player) => toNumber(player.goals)
  },
  assists: {
    label: 'Assists',
    getValue: (player) => toNumber(player.assists)
  },
  expected_goals: {
    label: 'xG',
    getValue: (player) => toNumber(player.expected_goals)
  },
  key_passes: {
    label: 'Key Passes',
    getValue: (player) => toNumber(player.key_passes)
  },
  shot_creating_actions_p90: {
    label: 'Shot Creating Actions',
    getValue: (player) => toNumber(player.shot_creating_actions_p90)
  },
  progressive_passes: {
    label: 'Progressive Passes',
    getValue: (player) => toNumber(player.progressive_passes)
  },
  progressive_carries: {
    label: 'Progressive Carries',
    getValue: (player) => toNumber(player.progressive_carries)
  },
  tackles_won: {
    label: 'Tackles Won',
    getValue: (player) => toNumber(player.tackles_won)
  },
  interceptions: {
    label: 'Interceptions',
    getValue: (player) => toNumber(player.interceptions)
  },
  aerial_duels_won_pct: {
    label: 'Aerial Duels Won %',
    getValue: (player) => toNumber(player.aerial_duels_won_pct)
  },
  clearances: {
    label: 'Clearances',
    getValue: (player) => toNumber(player.clearances)
  },
  primaryRoleOVR: {
    label: 'Primary Role Fit',
    getValue: (player) => toNumber(player.metrics.primaryRoleOVR)
  },
  creatorIndex: {
    label: 'Creator Index',
    getValue: (player) =>
      toNumber(player.shot_creating_actions_p90) * 45 + toNumber(player.key_passes) * 6 + toNumber(player.assists_p90) * 50
  },
  progressionIndex: {
    label: 'Progression Index',
    getValue: (player) => toNumber(player.progressive_passes) * 1.1 + toNumber(player.progressive_carries)
  },
  defensiveIndex: {
    label: 'Defender Index',
    getValue: (player) =>
      toNumber(player.tackles_won) * 1.5 + toNumber(player.interceptions) * 1.3 + toNumber(player.clearances) * 0.7
  }
};

const RANKING_VIEWS = [
  { id: 'top_rated', label: 'Top Rated', sortKey: 'finalOVR' },
  { id: 'top_scorers', label: 'Top Scorers', sortKey: 'goals' },
  { id: 'top_assisters', label: 'Top Assisters', sortKey: 'assists' },
  { id: 'best_creators', label: 'Best Creators', sortKey: 'creatorIndex' },
  { id: 'best_progressors', label: 'Best Progressors', sortKey: 'progressionIndex' },
  { id: 'best_defenders', label: 'Best Defenders', sortKey: 'defensiveIndex' },
  { id: 'best_by_tactical_role', label: 'Best By Tactical Role', sortKey: 'primaryRoleOVR' }
];

function capitalize(value) {
  if (!value) {
    return '-';
  }

  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function buildOptions(values, allLabel) {
  return [
    { value: 'all', label: allLabel },
    ...values.map((value) => ({
      value,
      label: value
    }))
  ];
}

function formatPositionGroupLabel(value) {
  return String(value || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getSortValue(player, sortKey) {
  const option = SORT_OPTIONS[sortKey] || SORT_OPTIONS.finalOVR;
  return option.getValue(player);
}

function sortPlayers(players, sortKey) {
  return [...players].sort((left, right) => {
    const diff = getSortValue(right, sortKey) - getSortValue(left, sortKey);

    if (diff !== 0) {
      return diff;
    }

    return String(left.player || '').localeCompare(String(right.player || ''));
  });
}

function getExplorerStatColumns(sortKey) {
  switch (sortKey) {
    case 'goals':
    case 'expected_goals':
      return [
        { key: 'goals', label: 'Goals', getValue: (player) => player.goals },
        { key: 'expected_goals', label: 'xG', getValue: (player) => player.expected_goals },
        { key: 'shots_p90', label: 'Shots P90', getValue: (player) => player.shots_p90 }
      ];
    case 'assists':
    case 'key_passes':
    case 'shot_creating_actions_p90':
    case 'creatorIndex':
      return [
        { key: 'assists', label: 'Assists', getValue: (player) => player.assists },
        { key: 'key_passes', label: 'Key Passes', getValue: (player) => player.key_passes },
        { key: 'shot_creating_actions_p90', label: 'SCA P90', getValue: (player) => player.shot_creating_actions_p90 }
      ];
    case 'progressive_passes':
    case 'progressive_carries':
    case 'progressionIndex':
      return [
        { key: 'progressive_passes', label: 'Prog Passes', getValue: (player) => player.progressive_passes },
        { key: 'progressive_carries', label: 'Prog Carries', getValue: (player) => player.progressive_carries },
        { key: 'carries_final_3rd', label: 'Carries Final 3rd', getValue: (player) => player.carries_final_3rd }
      ];
    case 'tackles_won':
    case 'interceptions':
    case 'clearances':
    case 'aerial_duels_won_pct':
    case 'defensiveIndex':
      return [
        { key: 'tackles_won', label: 'Tackles Won', getValue: (player) => player.tackles_won },
        { key: 'interceptions', label: 'Interceptions', getValue: (player) => player.interceptions },
        { key: 'clearances', label: 'Clearances', getValue: (player) => player.clearances }
      ];
    case 'primaryRoleOVR':
      return [
        { key: 'primaryRoleOVR', label: 'Role Fit', getValue: (player) => player.metrics.primaryRoleOVR },
        { key: 'exactPositionOVR', label: 'Exact OVR', getValue: (player) => player.metrics.exactPositionOVR },
        { key: 'tacticalRoleGap', label: 'Role Gap', getValue: (player) => player.metrics.tacticalRoleGap }
      ];
    default:
      return [
        { key: 'finalOVR', label: 'Final OVR', getValue: (player) => player.finalOVR },
        { key: 'goals', label: 'Goals', getValue: (player) => player.goals },
        { key: 'assists', label: 'Assists', getValue: (player) => player.assists }
      ];
  }
}

function buildLeaderboardBoard(id, title, statLabel, players, sortKey) {
  const topPlayers = sortPlayers(players, sortKey).slice(0, 5);

  return {
    id,
    title,
    statLabel,
    players: topPlayers.map((player) => ({
      key: player.key,
      player: player.player,
      squad: player.squad,
      exactPosition: player.exactPosition,
      primaryRole: player.primaryRole,
      value: getSortValue(player, sortKey)
    }))
  };
}

export default function LeagueDetails({ header, leagueId, leagues, onNavigate, players, ratingIndex }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PLAYERS);
  const league = getLeagueById(leagues, leagueId);

  const leaguePlayers = useMemo(
    () =>
      getLeaguePlayers(players.data, leagueId).map((player) => {
        const metrics = computeDisplayMetrics(player, ratingIndex);

        return {
          ...player,
          key: buildPlayerKey(player),
          metrics,
          finalOVR: metrics.finalOVR,
          exactPosition: metrics.exactPosition,
          exactPositionGroup: metrics.exactPositionGroup,
          primaryRole: metrics.primaryTacticalRoleLabel,
          secondaryRole: metrics.secondaryTacticalRoleLabel,
          primaryRoleKey: metrics.primaryTacticalRole,
          secondaryRoleKey: metrics.secondaryTacticalRole,
          roleConfidence: capitalize(metrics.tacticalRoleConfidence)
        };
      }),
    [leagueId, players.data, ratingIndex]
  );

  useEffect(() => {
    setFilters(INITIAL_FILTERS);
    setVisibleCount(INITIAL_VISIBLE_PLAYERS);
  }, [leagueId]);

  const filterOptions = useMemo(
    () => ({
      clubs: buildOptions([...new Set(leaguePlayers.map((player) => player.squad).filter(Boolean))].sort(), 'All Clubs'),
      exactPositions: buildOptions([...new Set(leaguePlayers.map((player) => player.exactPosition).filter(Boolean))].sort(), 'All Positions'),
      positionGroups: [
        { value: 'all', label: 'All Position Groups' },
        ...[...new Set(leaguePlayers.map((player) => player.exactPositionGroup).filter(Boolean))]
          .sort()
          .map((value) => ({ value, label: formatPositionGroupLabel(value) }))
      ],
      nations: buildOptions([...new Set(leaguePlayers.map((player) => player.nation).filter(Boolean))].sort(), 'All Nations'),
      primaryRoles: buildOptions([...new Set(leaguePlayers.map((player) => player.primaryRole).filter(Boolean))].sort(), 'All Primary Roles'),
      secondaryRoles: buildOptions(
        [...new Set(leaguePlayers.map((player) => player.secondaryRole).filter(Boolean))].sort(),
        'All Secondary Roles'
      )
    }),
    [leaguePlayers]
  );

  const filteredPlayers = useMemo(() => {
    const searchQuery = normalizeString(filters.search);
    const ageMin = filters.ageMin === '' ? null : Number(filters.ageMin);
    const ageMax = filters.ageMax === '' ? null : Number(filters.ageMax);

    return leaguePlayers.filter((player) => {
      if (filters.club !== 'all' && player.squad !== filters.club) {
        return false;
      }

      if (filters.exactPosition !== 'all' && player.exactPosition !== filters.exactPosition) {
        return false;
      }

      if (filters.exactPositionGroup !== 'all' && player.exactPositionGroup !== filters.exactPositionGroup) {
        return false;
      }

      if (filters.nation !== 'all' && player.nation !== filters.nation) {
        return false;
      }

      if (filters.primaryRole !== 'all' && player.primaryRole !== filters.primaryRole) {
        return false;
      }

      if (filters.secondaryRole !== 'all' && player.secondaryRole !== filters.secondaryRole) {
        return false;
      }

      if (filters.roleConfidence !== 'all' && normalizeString(player.roleConfidence) !== normalizeString(filters.roleConfidence)) {
        return false;
      }

      if (ageMin !== null && toNumber(player.age) < ageMin) {
        return false;
      }

      if (ageMax !== null && toNumber(player.age) > ageMax) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const haystack = normalizeString(
        [player.player, player.squad, player.nation, player.exactPosition, player.primaryRole, player.secondaryRole].filter(Boolean).join(' ')
      );

      return haystack.includes(searchQuery);
    });
  }, [filters, leaguePlayers]);

  const sortedPlayers = useMemo(() => sortPlayers(filteredPlayers, filters.sortKey), [filteredPlayers, filters.sortKey]);
  const leaderboardPool = filteredPlayers.length ? filteredPlayers : leaguePlayers;

  const leaderboardBoards = useMemo(
    () => [
      buildLeaderboardBoard('goals', 'Top Scorers', 'Goals', leaderboardPool, 'goals'),
      buildLeaderboardBoard('assists', 'Top Assisters', 'Assists', leaderboardPool, 'assists'),
      buildLeaderboardBoard('ovr', 'Highest OVR', 'Final OVR', leaderboardPool, 'finalOVR'),
      buildLeaderboardBoard('creators', 'Most Creative', 'Creator Index', leaderboardPool, 'creatorIndex'),
      buildLeaderboardBoard('progressors', 'Best Progressors', 'Progression Index', leaderboardPool, 'progressionIndex'),
      buildLeaderboardBoard('defenders', 'Best Defenders', 'Defender Index', leaderboardPool, 'defensiveIndex')
    ],
    [leaderboardPool]
  );

  const explorerStatColumns = useMemo(() => getExplorerStatColumns(filters.sortKey), [filters.sortKey]);
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_PLAYERS);
  }, [filters]);

  const visiblePlayers = useMemo(() => sortedPlayers.slice(0, visibleCount), [sortedPlayers, visibleCount]);

  useEffect(() => {
    console.debug('[league-detail]', {
      leagueId,
      leagueResolved: league?.id || null,
      playersInLeague: leaguePlayers.length,
      filteredPlayers: filteredPlayers.length,
      rankingView: filters.rankingView,
      sortKey: filters.sortKey
    });
  }, [filteredPlayers.length, filters.rankingView, filters.sortKey, league?.id, leagueId, leaguePlayers.length]);

  function handleFilterChange(field, value) {
    if (field === 'rankingView') {
      const nextView = RANKING_VIEWS.find((view) => view.id === value);
      setFilters((current) => ({
        ...current,
        rankingView: value,
        sortKey: nextView?.sortKey || current.sortKey
      }));
      return;
    }

    setFilters((current) => ({
      ...current,
      [field]: value
    }));
  }

  if (players.loading && !league) {
    return (
      <main className="league-page">
        <div className="league-shell">
          {header}
          <section className="league-empty-state">
            <h1>Loading league data</h1>
            <p>Building the competition view from the unified multi-league dataset.</p>
          </section>
        </div>
      </main>
    );
  }

  if (!league) {
    return (
      <main className="league-page">
        <div className="league-shell">
          {header}
          <section className="league-empty-state">
            <h1>League not found</h1>
            <p>The requested competition could not be resolved from the unified player catalogue.</p>
            <button className="secondary-button" type="button" onClick={() => onNavigate('/leagues')}>
              Back to leagues
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="league-page">
      <div className="league-shell">
        {header}

        <LeagueSummaryHeader league={league} onBack={() => onNavigate('/leagues')} onCompare={() => onNavigate('/compare')} />

        <LeagueLeaderboardSection boards={leaderboardBoards} onOpenPlayer={(playerKey) => onNavigate(`/player/${encodeURIComponent(playerKey)}`)} />

        <LeagueFiltersBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={() => setFilters(INITIAL_FILTERS)}
          options={filterOptions}
          rankingViews={RANKING_VIEWS}
          sortOptions={Object.entries(SORT_OPTIONS).map(([value, option]) => ({ value, label: option.label }))}
        />

        <LeaguePlayerExplorer
          canLoadMore={visiblePlayers.length < sortedPlayers.length}
          onLoadMore={() => setVisibleCount((current) => Math.min(current + INITIAL_VISIBLE_PLAYERS, sortedPlayers.length))}
          onOpenPlayer={(playerKey) => onNavigate(`/player/${encodeURIComponent(playerKey)}`)}
          players={visiblePlayers}
          statColumns={explorerStatColumns}
          totalPlayers={sortedPlayers.length}
        />
      </div>
    </main>
  );
}
