import { createRouteId, normalizeString } from './search';
import { computeDisplayMetrics, toNumber } from './playerMetrics';

export const LEAGUE_FILTERS = {
  all: { id: 'all', label: 'All Leagues', country: 'Multi-League', division: 'Combined Dataset' },
  premier_league: { id: 'premier_league', label: 'Premier League', country: 'England', division: '1st Division' },
  bundesliga: { id: 'bundesliga', label: 'Bundesliga', country: 'Germany', division: '1st Division' }
};

const PRIMARY_FIELDS = new Set(['player', 'squad', 'pos', 'nation', 'comp', 'league', 'season', 'age', 'born']);

const LABEL_OVERRIDES = {
  rk: 'Rank',
  avg_mins_per_match: 'Avg Mins per Match',
  exp_npg: 'Expected NPG',
  goals_p90: 'Goals P90',
  assists_p90: 'Assists P90',
  shots_p90: 'Shots P90',
  carries_prgc: 'Progressive Carries',
  carries_final_3rd: 'Carries Final 3rd',
  carries_penalty_area: 'Carries Penalty Area',
  shot_creating_actions_p90: 'Shot Creating Actions P90',
  goal_creating_actions_p90: 'Goal Creating Actions P90',
  goals_against_p90: 'Goals Against P90',
  saves_pct: 'Save %',
  clean_sheets_pct: 'Clean Sheet %',
  penalty_saves_pct: 'Penalty Save %',
  shots_on_target_pct: 'Shots On Target %',
  dribbles_tackled_pct: 'Dribbles Tackled %',
  successful_take_ons_pct: 'Successful Take-Ons %'
};

const GROUP_RULES = [
  {
    title: 'General',
    test: (key) => ['rk', 'matches_played', 'avg_mins_per_match'].includes(key)
  },
  {
    title: 'Attacking',
    test: (key) =>
      [
        'goals',
        'goals_scored',
        'goals_and_assists',
        'non_penalty_goals',
        'penalty_kicks_made',
        'expected_goals',
        'exp_npg',
        'total_shots',
        'shots_on_target_pct',
        'shots_p90',
        'goals_p90',
        'goals_per_shot',
        'goals_per_shot_on_target'
      ].includes(key)
  },
  {
    title: 'Creativity / Progression',
    test: (key) =>
      [
        'assists',
        'assists_p90',
        'key_passes',
        'progressive_carries',
        'progressive_passes',
        'progressive_passes_distance',
        'passes_into_final_third',
        'passes_into_penalty_area',
        'carries_prgc',
        'carries_final_3rd',
        'carries_penalty_area',
        'shot_creating_actions_p90',
        'goal_creating_actions_p90',
        'take_ons_attempted',
        'successful_take_ons_pct',
        'times_tackled_during_take_on'
      ].includes(key)
  },
  {
    title: 'Passing / Possession',
    test: (key) =>
      [
        'passes_completed',
        'passes_attempted',
        'pass_completion_pct',
        'short_pass_completed_pct',
        'medium_pass_completed_pct',
        'long_pass_completed_pct',
        'touches_def_pen',
        'possessions_lost'
      ].includes(key)
  },
  {
    title: 'Defending',
    test: (key) =>
      [
        'tackles_attempted',
        'tackles_won',
        'dribbles_tackled_pct',
        'shots_blocked',
        'passes_blocked',
        'interceptions',
        'clearances',
        'errors_made',
        'aerial_duels_won_pct'
      ].includes(key)
  },
  {
    title: 'Goalkeeping',
    test: (key) =>
      [
        'goals_against',
        'goals_against_p90',
        'saves',
        'saves_pct',
        'clean_sheets',
        'clean_sheets_pct',
        'penalty_saves_pct',
        'crosses_stopped'
      ].includes(key)
  }
];

function getSeasonSortValue(player) {
  return String(player?.season || '');
}

function getRawLeagueName(player) {
  return player?.league || player?.comp || '';
}

export function normalizeLeagueName(value = '') {
  const normalized = normalizeString(value);

  if (normalized === 'premier league') {
    return LEAGUE_FILTERS.premier_league.id;
  }

  if (normalized === 'bundesliga') {
    return LEAGUE_FILTERS.bundesliga.id;
  }

  return normalized.replace(/\s+/g, '_') || 'unknown_league';
}

export function getLeagueFilterValue(playerOrLeague = '') {
  return typeof playerOrLeague === 'string' ? normalizeLeagueName(playerOrLeague) : normalizeLeagueName(getRawLeagueName(playerOrLeague));
}

export function getLeagueDisplayName(leagueValue = '') {
  return LEAGUE_FILTERS[leagueValue]?.label || String(leagueValue || 'Unknown League');
}

function getLeagueMetadata(leagueValue) {
  return LEAGUE_FILTERS[leagueValue] || {
    id: leagueValue,
    label: getLeagueDisplayName(leagueValue),
    country: 'Unknown',
    division: 'League Dataset'
  };
}

export function getLeagueName(player) {
  const leagueValue = getLeagueFilterValue(player);
  return getLeagueDisplayName(leagueValue);
}

export function filterPlayersByLeague(players = [], leagueFilter = LEAGUE_FILTERS.all.id) {
  if (!leagueFilter || leagueFilter === LEAGUE_FILTERS.all.id) {
    return players;
  }

  return players.filter((player) => getLeagueFilterValue(player) === leagueFilter);
}

export function buildPlayerKey(player) {
  return createRouteId(
    [player?.player, player?.squad, getLeagueFilterValue(player), player?.season]
      .filter(Boolean)
      .join(' ')
  );
}

function comparePlayerRecords(left, right) {
  const seasonComparison = getSeasonSortValue(right).localeCompare(getSeasonSortValue(left));

  if (seasonComparison !== 0) {
    return seasonComparison;
  }

  const matchesDiff = toNumber(right.matches_played) - toNumber(left.matches_played);

  if (matchesDiff !== 0) {
    return matchesDiff;
  }

  const minutesDiff = toNumber(right.avg_mins_per_match) - toNumber(left.avg_mins_per_match);

  if (minutesDiff !== 0) {
    return minutesDiff;
  }

  return toNumber(right.goals) - toNumber(left.goals);
}

export function getSeasonDatasetLabel(players = []) {
  const seasons = Array.from(new Set(players.map((player) => player?.season).filter(Boolean))).sort((left, right) =>
    String(right).localeCompare(String(left))
  );

  if (!seasons.length) {
    return 'N/A';
  }

  if (seasons.length === 1) {
    return seasons[0];
  }

  return `${seasons[0]} / ${seasons[1]}`;
}

export function getAllPlayers(players = []) {
  return [...players];
}

export function getCanonicalPlayers(players = []) {
  const recordsByPlayer = new Map();

  for (const player of players) {
    const key = buildPlayerKey(player);

    if (!key) {
      continue;
    }

    const existing = recordsByPlayer.get(key);

    if (!existing || comparePlayerRecords(player, existing) < 0) {
      recordsByPlayer.set(key, player);
    }
  }

  return [...recordsByPlayer.values()].sort((left, right) => {
    const goalsDiff = toNumber(right.goals) - toNumber(left.goals);

    if (goalsDiff !== 0) {
      return goalsDiff;
    }

    const leagueDiff = getLeagueName(left).localeCompare(getLeagueName(right));

    if (leagueDiff !== 0) {
      return leagueDiff;
    }

    return String(left.player || '').localeCompare(String(right.player || ''));
  });
}

export function getPlayerByIdOrUniqueKey(players = [], playerIdentifier = '') {
  const normalizedTarget = normalizeString(playerIdentifier);

  if (!normalizedTarget) {
    return null;
  }

  const byKey = players.find((player) => normalizeString(buildPlayerKey(player)) === normalizedTarget);

  if (byKey) {
    return byKey;
  }

  const byName = players.filter((player) => normalizeString(player.player) === normalizedTarget).sort(comparePlayerRecords);
  return byName.length === 1 ? byName[0] : null;
}

export function findPlayerRecord(players = [], playerIdentifier = '') {
  return getPlayerByIdOrUniqueKey(players, playerIdentifier);
}

export function buildSearchPlayerRecords(players = []) {
  return players.map((player) => {
    const name = player.player || 'Unknown Player';
    const team = player.squad || '';
    const position = player.pos || '';
    const nationality = player.nation || '';
    const league = getLeagueName(player);
    const metadataFields = [team, position, nationality, league];
    const nameNormalized = normalizeString(name);

    return {
      id: buildPlayerKey(player),
      name,
      team,
      position,
      nationality,
      league,
      leagueFilterValue: getLeagueFilterValue(player),
      popularity:
        (toNumber(player.goals) || 0) * 10 +
        (toNumber(player.assists) || 0) * 8 +
        (toNumber(player.expected_goals) || 0) * 4,
      nameNormalized,
      nameTokens: nameNormalized.split(' ').filter(Boolean),
      metadataFieldsNormalized: metadataFields.map((field) => normalizeString(field)).filter(Boolean),
      searchTextNormalized: [nameNormalized, ...metadataFields.map((field) => normalizeString(field))]
        .filter(Boolean)
        .join(' ')
    };
  });
}

export function buildLeagueCatalogue(players = [], ratingIndex = {}) {
  const groupedLeagues = new Map();

  for (const player of players) {
    const leagueValue = getLeagueFilterValue(player);
    const metadata = getLeagueMetadata(leagueValue);
    const playerMetrics = computeDisplayMetrics(player, ratingIndex);
    const current = groupedLeagues.get(leagueValue) || {
      id: leagueValue,
      name: metadata.label,
      country: metadata.country,
      division: metadata.division,
      season: player.season || 'N/A',
      playersCount: 0,
      clubsSet: new Set(),
      totalGoals: 0,
      totalOVR: 0,
      topScorer: player.player || '-',
      topScorerGoals: toNumber(player.goals),
      topAssister: player.player || '-',
      topAssisterValue: toNumber(player.assists),
      topRatedPlayer: player.player || '-',
      topRatedValue: toNumber(playerMetrics.finalOVR),
      popularity: 0
    };

    current.playersCount += 1;
    current.popularity += 1;
    current.totalGoals += toNumber(player.goals);
    current.totalOVR += toNumber(playerMetrics.finalOVR);
    current.season = String(player.season || '').localeCompare(String(current.season || '')) > 0 ? player.season : current.season;

    if (player.squad) {
      current.clubsSet.add(player.squad);
    }

    if (toNumber(player.goals) > current.topScorerGoals) {
      current.topScorer = player.player || '-';
      current.topScorerGoals = toNumber(player.goals);
    }

    if (toNumber(player.assists) > current.topAssisterValue) {
      current.topAssister = player.player || '-';
      current.topAssisterValue = toNumber(player.assists);
    }

    if (toNumber(playerMetrics.finalOVR) > current.topRatedValue) {
      current.topRatedPlayer = player.player || '-';
      current.topRatedValue = toNumber(playerMetrics.finalOVR);
    }

    groupedLeagues.set(leagueValue, current);
  }

  return [...groupedLeagues.values()]
    .map((league) => ({
      id: league.id,
      name: league.name,
      country: league.country,
      season: league.season,
      division: league.division,
      clubs: league.clubsSet.size,
      playersCount: league.playersCount,
      topScorer: league.topScorer,
      topScorerGoals: league.topScorerGoals,
      topAssister: league.topAssister,
      topAssisterValue: league.topAssisterValue,
      topRatedPlayer: league.topRatedPlayer,
      topRatedValue: league.topRatedValue,
      avgGoals: league.playersCount ? (league.totalGoals / league.playersCount).toFixed(2) : '0.00',
      averageOVR: league.playersCount ? Number((league.totalOVR / league.playersCount).toFixed(1)) : 0,
      popularity: league.popularity
    }))
    .sort((left, right) => right.playersCount - left.playersCount || left.name.localeCompare(right.name));
}

export function getLeagueById(leagues = [], leagueId) {
  return leagues.find((league) => league.id === leagueId) || null;
}

export function getLeaguePlayers(players = [], leagueId) {
  return filterPlayersByLeague(players, leagueId).sort((left, right) => {
    const goalsDiff = toNumber(right.goals) - toNumber(left.goals);

    if (goalsDiff !== 0) {
      return goalsDiff;
    }

    return String(left.player || '').localeCompare(String(right.player || ''));
  });
}

export function getCompareCandidates(players = [], leagueFilter = LEAGUE_FILTERS.all.id) {
  return filterPlayersByLeague(players, leagueFilter).sort((left, right) => {
    const leftName = `${left.player} ${left.squad} ${getLeagueName(left)}`;
    const rightName = `${right.player} ${right.squad} ${getLeagueName(right)}`;
    return leftName.localeCompare(rightName);
  });
}

export function getSimilarPlayerCandidates(players = [], leagueFilter = LEAGUE_FILTERS.all.id) {
  return filterPlayersByLeague(players, leagueFilter);
}

function formatLabelFromKey(key) {
  if (LABEL_OVERRIDES[key]) {
    return LABEL_OVERRIDES[key];
  }

  return key
    .split('_')
    .filter(Boolean)
    .map((part) => {
      if (part === 'pct') {
        return '%';
      }

      if (part === 'p90') {
        return 'P90';
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function resolveGroupTitle(key) {
  const matchingGroup = GROUP_RULES.find((group) => group.test(key));
  return matchingGroup ? matchingGroup.title : 'Additional Stats';
}

export function buildPlayerStatGroups(player) {
  if (!player) {
    return [];
  }

  const groups = new Map();

  for (const [key, value] of Object.entries(player)) {
    if (PRIMARY_FIELDS.has(key) || value === null || value === undefined || value === '') {
      continue;
    }

    const groupTitle = resolveGroupTitle(key);
    const items = groups.get(groupTitle) || [];

    items.push({
      key,
      label: formatLabelFromKey(key),
      value
    });

    groups.set(groupTitle, items);
  }

  return [...groups.entries()].map(([title, items]) => ({ title, items }));
}
