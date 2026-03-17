import { getLeagueFilterValue, getLeagueName, LEAGUE_FILTERS } from './dataset';
import { getPercentile, getReadableTacticalRoleLabel, toNumber } from './playerMetrics';

export const SIMILARITY_MODES = {
  broad: { id: 'broad', label: 'Broad' },
  strictRole: { id: 'strictRole', label: 'Strict Role' },
  youngerAlternative: { id: 'youngerAlternative', label: 'Younger Alternative' }
};

const MINIMUM_MATCHES = 8;
const MINIMUM_ESTIMATED_MINUTES = 600;
const SIMILAR_AGE_BAND = 3;
const STRICT_PRIMARY_ROLE_PENALTY = 0.68;
const YOUNGER_SIMILARITY_FLOOR = 55;
const DEBUG_SAMPLE_PLAYERS = new Set(['Son Heung-min', 'Rodri', 'Bruno Guimar\u00E3es', 'Gabriel Jesus', 'Ollie Watkins', 'Mohamed Salah']);

const FEATURE_SETS = {
  striker: [
    ['goals_p90', 'goal threat'],
    ['expected_goals', 'shot quality'],
    ['shots_p90', 'shot volume'],
    ['shots_on_target_pct', 'clean finishing'],
    ['carries_penalty_area', 'box penetration'],
    ['progressive_carries', 'progressive carrying'],
    ['shot_creating_actions_p90', 'chance involvement'],
    ['key_passes', 'link play'],
    ['aerial_duels_won_pct', 'aerial presence']
  ],
  winger: [
    ['goals_p90', 'goal threat'],
    ['assists_p90', 'final-ball output'],
    ['expected_goals', 'scoring threat'],
    ['key_passes', 'chance creation'],
    ['shot_creating_actions_p90', 'creative volume'],
    ['progressive_carries', 'progressive carrying'],
    ['progressive_passes', 'progressive passing'],
    ['carries_final_3rd', 'final-third carrying'],
    ['carries_penalty_area', 'box penetration'],
    ['take_ons_attempted', 'take-on intent'],
    ['successful_take_ons_pct', '1v1 efficiency']
  ],
  defensive_midfielder: [
    ['passes_attempted', 'distribution volume'],
    ['pass_completion_pct', 'safe distribution'],
    ['progressive_passes', 'progressive passing'],
    ['progressive_carries', 'ball progression'],
    ['tackles_won', 'ball-winning'],
    ['tackles_attempted', 'defensive activity'],
    ['interceptions', 'interceptions'],
    ['passes_blocked', 'passing-lane disruption'],
    ['shots_blocked', 'shot blocking'],
    ['shot_creating_actions_p90', 'support creation']
  ],
  central_midfielder: [
    ['passes_attempted', 'distribution volume'],
    ['pass_completion_pct', 'ball security'],
    ['progressive_passes', 'progressive passing'],
    ['progressive_carries', 'progressive carrying'],
    ['key_passes', 'chance creation'],
    ['assists_p90', 'assist output'],
    ['tackles_won', 'ball-winning'],
    ['interceptions', 'reading of play'],
    ['shot_creating_actions_p90', 'creative volume'],
    ['goals_p90', 'goal threat']
  ],
  attacking_midfielder: [
    ['key_passes', 'chance creation'],
    ['assists_p90', 'assist output'],
    ['shot_creating_actions_p90', 'creative volume'],
    ['progressive_passes', 'progressive passing'],
    ['passes_into_penalty_area', 'penalty-area delivery'],
    ['goals_p90', 'goal threat'],
    ['expected_goals', 'scoring threat'],
    ['progressive_carries', 'progressive carrying']
  ],
  centre_back: [
    ['tackles_won', 'front-foot defending'],
    ['tackles_attempted', 'defensive activity'],
    ['interceptions', 'reading of play'],
    ['clearances', 'clearance volume'],
    ['passes_blocked', 'lane blocking'],
    ['shots_blocked', 'shot blocking'],
    ['progressive_passes', 'ball progression'],
    ['passes_attempted', 'distribution volume'],
    ['pass_completion_pct', 'passing security'],
    ['aerial_duels_won_pct', 'aerial dominance'],
    ['errors_made', 'error avoidance', true]
  ],
  full_back: [
    ['tackles_won', 'defensive duels'],
    ['interceptions', 'reading of play'],
    ['progressive_passes', 'progressive passing'],
    ['progressive_carries', 'progressive carrying'],
    ['key_passes', 'chance creation'],
    ['assists_p90', 'assist output'],
    ['carries_final_3rd', 'final-third carries'],
    ['take_ons_attempted', 'take-on intent'],
    ['successful_take_ons_pct', '1v1 efficiency'],
    ['pass_completion_pct', 'passing security']
  ],
  goalkeeper: [
    ['saves_pct', 'shot stopping'],
    ['goals_against_p90', 'goals prevention', true],
    ['clean_sheets_pct', 'clean-sheet rate'],
    ['crosses_stopped', 'area command'],
    ['pass_completion_pct', 'distribution security']
  ]
};

function normalizeFilters(filters = {}) {
  return {
    leagueFilter: filters.leagueFilter || LEAGUE_FILTERS.all.id,
    sameLeagueOnly: Boolean(filters.sameLeagueOnly),
    similarAgeOnly: Boolean(filters.similarAgeOnly),
    samePrimaryRoleOnly: Boolean(filters.samePrimaryRoleOnly)
  };
}

function getPlayerKey(player) {
  return String(player?.player || '').trim().toLowerCase();
}

function getPlayerAge(player) {
  return toNumber(player?.age);
}

function getEstimatedMinutes(player) {
  return toNumber(player?.matches_played) * toNumber(player?.avg_mins_per_match);
}

function hasSufficientSampleSize(player) {
  return toNumber(player?.matches_played) >= MINIMUM_MATCHES || getEstimatedMinutes(player) >= MINIMUM_ESTIMATED_MINUTES;
}

export function getSimilarityFeatureSetByPositionGroup(positionGroup) {
  return FEATURE_SETS[positionGroup] || FEATURE_SETS.central_midfielder;
}

function buildPercentileLookup(players, ratingIndex, positionGroup) {
  const relevantPlayers = players.filter((player) => {
    const rating = ratingIndex[getPlayerKey(player)];
    return rating?.exactPositionGroup === positionGroup && hasSufficientSampleSize(player);
  });

  const metrics = {};

  for (const [metricKey] of getSimilarityFeatureSetByPositionGroup(positionGroup)) {
    metrics[metricKey] = relevantPlayers.map((player) => toNumber(player?.[metricKey])).sort((left, right) => left - right);
  }

  return {
    players: relevantPlayers,
    metrics
  };
}

function getPercentileForMetric(lookup, metricKey, value, invert = false) {
  const sortedValues = lookup.metrics[metricKey] || [];
  const percentile = getPercentile(sortedValues, value);
  return invert ? 100 - percentile : percentile;
}

function getPlayerPercentileVector(player, positionGroup, lookup) {
  return Object.fromEntries(
    getSimilarityFeatureSetByPositionGroup(positionGroup).map(([metricKey, _, invert = false]) => [
      metricKey,
      getPercentileForMetric(lookup, metricKey, player?.[metricKey], invert)
    ])
  );
}

export function getEligibleSimilarPlayers(currentPlayer, players, ratingIndex, filters = {}) {
  const currentRating = ratingIndex[getPlayerKey(currentPlayer)];

  if (!currentPlayer || !currentRating) {
    return [];
  }

  const normalizedFilters = normalizeFilters(filters);
  const currentLeague = getLeagueName(currentPlayer);
  const currentAge = getPlayerAge(currentPlayer);

  return players.filter((candidate) => {
    const candidateKey = getPlayerKey(candidate);
    const candidateRating = ratingIndex[candidateKey];

    if (!candidateRating) {
      return false;
    }

    if (candidateKey === getPlayerKey(currentPlayer)) {
      return false;
    }

    if (candidateRating.exactPositionGroup !== currentRating.exactPositionGroup) {
      return false;
    }

    if (!hasSufficientSampleSize(candidate)) {
      return false;
    }

    if (
      normalizedFilters.leagueFilter !== LEAGUE_FILTERS.all.id &&
      getLeagueFilterValue(candidate) !== normalizedFilters.leagueFilter
    ) {
      return false;
    }

    if (normalizedFilters.sameLeagueOnly && getLeagueName(candidate) !== currentLeague) {
      return false;
    }

    if (normalizedFilters.similarAgeOnly && Math.abs(getPlayerAge(candidate) - currentAge) > SIMILAR_AGE_BAND) {
      return false;
    }

    if (
      normalizedFilters.samePrimaryRoleOnly &&
      candidateRating.primaryTacticalRole &&
      candidateRating.primaryTacticalRole !== currentRating.primaryTacticalRole
    ) {
      return false;
    }

    return true;
  });
}

function getRoleMatchScore(currentRating, candidateRating, key) {
  if (!currentRating?.[key] || !candidateRating?.[key]) {
    return 50;
  }

  if (currentRating[key] === candidateRating[key]) {
    return 100;
  }

  const currentPrimary = currentRating.primaryTacticalRole;
  const currentSecondary = currentRating.secondaryTacticalRole;
  const candidatePrimary = candidateRating.primaryTacticalRole;
  const candidateSecondary = candidateRating.secondaryTacticalRole;

  if (
    currentPrimary === candidateSecondary ||
    currentSecondary === candidatePrimary ||
    currentSecondary === candidateSecondary
  ) {
    return 60;
  }

  return 20;
}

function getRoleVectorSimilarity(currentRating, candidateRating) {
  const roleKeys = [...new Set([...Object.keys(currentRating?.tacticalRoleScores || {}), ...Object.keys(candidateRating?.tacticalRoleScores || {})])];

  if (!roleKeys.length) {
    return 50;
  }

  const averageDifference =
    roleKeys.reduce((total, roleKey) => {
      const currentScore = toNumber(currentRating?.tacticalRoleScores?.[roleKey]);
      const candidateScore = toNumber(candidateRating?.tacticalRoleScores?.[roleKey]);
      return total + Math.abs(currentScore - candidateScore);
    }, 0) / roleKeys.length;

  return Math.max(0, 100 - averageDifference);
}

export function calculateStatisticalSimilarity(currentPlayer, candidatePlayer, currentRating, candidateRating, lookup) {
  const positionGroup = currentRating?.exactPositionGroup;
  const features = getSimilarityFeatureSetByPositionGroup(positionGroup);
  const currentVector = getPlayerPercentileVector(currentPlayer, positionGroup, lookup);
  const candidateVector = getPlayerPercentileVector(candidatePlayer, positionGroup, lookup);

  let weightedDifference = 0;
  let totalWeight = 0;
  const featureComparisons = [];

  for (const [metricKey, traitLabel] of features) {
    const currentPercentile = currentVector[metricKey];
    const candidatePercentile = candidateVector[metricKey];
    const difference = Math.abs(currentPercentile - candidatePercentile);

    weightedDifference += difference;
    totalWeight += 1;
    featureComparisons.push({
      metricKey,
      traitLabel,
      currentPercentile,
      candidatePercentile,
      difference,
      closeness: Math.max(0, 100 - difference)
    });
  }

  const weightedAverageAbsoluteDifference = totalWeight ? weightedDifference / totalWeight : 100;

  return {
    statisticalSimilarity: Math.max(0, 100 - weightedAverageAbsoluteDifference),
    featureComparisons
  };
}

export function calculateTacticalSimilarity(currentRating, candidateRating, mode = SIMILARITY_MODES.broad.id) {
  const roleVectorSimilarity = getRoleVectorSimilarity(currentRating, candidateRating);
  const primaryRoleMatch = getRoleMatchScore(currentRating, candidateRating, 'primaryTacticalRole');
  const secondaryRoleMatch = getRoleMatchScore(currentRating, candidateRating, 'secondaryTacticalRole');

  let tacticalSimilarity = 0.55 * roleVectorSimilarity + 0.3 * primaryRoleMatch + 0.15 * secondaryRoleMatch;

  if (mode === SIMILARITY_MODES.strictRole.id) {
    if (currentRating?.primaryTacticalRole === candidateRating?.primaryTacticalRole) {
      tacticalSimilarity = Math.min(100, tacticalSimilarity + 10);
    } else {
      tacticalSimilarity *= STRICT_PRIMARY_ROLE_PENALTY;
    }
  }

  return {
    tacticalSimilarity,
    roleVectorSimilarity,
    primaryRoleMatch,
    secondaryRoleMatch
  };
}

export function calculateContextSimilarity(currentPlayer, candidatePlayer) {
  const currentAge = getPlayerAge(currentPlayer);
  const candidateAge = getPlayerAge(candidatePlayer);
  const ageSimilarity =
    currentAge && candidateAge ? Math.max(0, 100 - Math.abs(currentAge - candidateAge) * 12) : 50;
  const leagueSimilarity = getLeagueName(currentPlayer) === getLeagueName(candidatePlayer) ? 100 : 0;
  const nationSimilarity =
    currentPlayer?.nation && candidatePlayer?.nation && currentPlayer.nation === candidatePlayer.nation ? 100 : 0;

  return {
    contextSimilarity: 0.6 * ageSimilarity + 0.25 * leagueSimilarity + 0.15 * nationSimilarity,
    ageSimilarity,
    leagueSimilarity,
    nationSimilarity
  };
}

export function calculateYoungerPotentialAdjustment(currentPlayer, candidatePlayer, statisticalSimilarity, tacticalSimilarity) {
  if (statisticalSimilarity < YOUNGER_SIMILARITY_FLOOR) {
    return 0;
  }

  const currentAge = getPlayerAge(currentPlayer);
  const candidateAge = getPlayerAge(candidatePlayer);
  const ageAdvantage =
    currentAge && candidateAge ? Math.max(0, Math.min(100, 50 + (currentAge - candidateAge) * 10)) : 50;
  const similarityFloor = Math.max(0, Math.min(100, ((statisticalSimilarity - YOUNGER_SIMILARITY_FLOOR) / 45) * 100));

  return 0.55 * ageAdvantage + 0.25 * tacticalSimilarity + 0.2 * similarityFloor;
}

export function calculateFinalSimilarityByMode({
  mode,
  statisticalSimilarity,
  tacticalSimilarity,
  contextSimilarity,
  youngerPotentialAdjustment
}) {
  if (mode === SIMILARITY_MODES.strictRole.id) {
    return 0.52 * statisticalSimilarity + 0.38 * tacticalSimilarity + 0.1 * contextSimilarity;
  }

  if (mode === SIMILARITY_MODES.youngerAlternative.id) {
    return 0.56 * statisticalSimilarity + 0.22 * tacticalSimilarity + 0.22 * youngerPotentialAdjustment;
  }

  return 0.68 * statisticalSimilarity + 0.24 * tacticalSimilarity + 0.08 * contextSimilarity;
}

function getTopSharedTraits(featureComparisons = []) {
  return featureComparisons
    .filter((feature) => feature.closeness >= 72 && feature.currentPercentile >= 45 && feature.candidatePercentile >= 45)
    .sort((left, right) => right.closeness - left.closeness || right.currentPercentile + right.candidatePercentile - (left.currentPercentile + left.candidatePercentile))
    .slice(0, 3)
    .map((feature) => feature.traitLabel);
}

function joinTraits(traits = []) {
  if (!traits.length) {
    return 'balanced all-around output';
  }

  if (traits.length === 1) {
    return traits[0];
  }

  if (traits.length === 2) {
    return `${traits[0]} and ${traits[1]}`;
  }

  return `${traits[0]}, ${traits[1]}, and ${traits[2]}`;
}

export function generateSimilarityExplanation({
  currentPlayer,
  candidatePlayer,
  currentRating,
  candidateRating,
  featureComparisons,
  mode
}) {
  const sharedTraits = getTopSharedTraits(featureComparisons);
  const currentRole = getReadableTacticalRoleLabel(currentRating?.primaryTacticalRole);
  const candidateRole = getReadableTacticalRoleLabel(candidateRating?.primaryTacticalRole);
  const traitsText = joinTraits(sharedTraits);
  const isYounger = getPlayerAge(candidatePlayer) && getPlayerAge(currentPlayer) && getPlayerAge(candidatePlayer) < getPlayerAge(currentPlayer);

  if (mode === SIMILARITY_MODES.youngerAlternative.id && isYounger) {
    return `This is a younger stylistic alternative with similar ${traitsText}.`;
  }

  if (currentRating?.primaryTacticalRole && currentRating.primaryTacticalRole === candidateRating?.primaryTacticalRole) {
    return `Both players profile as ${currentRole} types with strong ${traitsText}.`;
  }

  if (currentRating?.secondaryTacticalRole && currentRating.secondaryTacticalRole === candidateRating?.primaryTacticalRole) {
    return `A close tactical neighbour to this profile, combining ${candidateRole.toLowerCase()} traits with ${traitsText}.`;
  }

  return `A similar ${candidateRole.toLowerCase()} profile with comparable ${traitsText}.`;
}

export function getSimilarPlayersForPlayer(currentPlayer, players, ratingIndex, mode = SIMILARITY_MODES.broad.id, filters = {}) {
  const currentRating = ratingIndex[getPlayerKey(currentPlayer)];

  if (!currentPlayer || !currentRating) {
    return [];
  }

  const eligiblePlayers = getEligibleSimilarPlayers(currentPlayer, players, ratingIndex, filters);
  const percentileLookup = buildPercentileLookup(players, ratingIndex, currentRating.exactPositionGroup);

  return eligiblePlayers
    .map((candidatePlayer) => {
      const candidateRating = ratingIndex[getPlayerKey(candidatePlayer)];
      const { statisticalSimilarity, featureComparisons } = calculateStatisticalSimilarity(
        currentPlayer,
        candidatePlayer,
        currentRating,
        candidateRating,
        percentileLookup
      );
      const tacticalBreakdown = calculateTacticalSimilarity(currentRating, candidateRating, mode);
      const contextBreakdown = calculateContextSimilarity(currentPlayer, candidatePlayer);
      const youngerPotentialAdjustment = calculateYoungerPotentialAdjustment(
        currentPlayer,
        candidatePlayer,
        statisticalSimilarity,
        tacticalBreakdown.tacticalSimilarity
      );
      const finalSimilarity = calculateFinalSimilarityByMode({
        mode,
        statisticalSimilarity,
        tacticalSimilarity: tacticalBreakdown.tacticalSimilarity,
        contextSimilarity: contextBreakdown.contextSimilarity,
        youngerPotentialAdjustment
      });

      if (mode === SIMILARITY_MODES.youngerAlternative.id && statisticalSimilarity < YOUNGER_SIMILARITY_FLOOR) {
        return null;
      }

      return {
        player: candidatePlayer,
        rating: candidateRating,
        explanation: generateSimilarityExplanation({
          currentPlayer,
          candidatePlayer,
          currentRating,
          candidateRating,
          featureComparisons,
          mode
        }),
        statisticalSimilarity,
        tacticalSimilarity: tacticalBreakdown.tacticalSimilarity,
        contextSimilarity: contextBreakdown.contextSimilarity,
        youngerPotentialAdjustment,
        finalSimilarity,
        roleVectorSimilarity: tacticalBreakdown.roleVectorSimilarity,
        primaryRoleMatch: tacticalBreakdown.primaryRoleMatch,
        secondaryRoleMatch: tacticalBreakdown.secondaryRoleMatch,
        featureComparisons
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.finalSimilarity !== left.finalSimilarity) {
        return right.finalSimilarity - left.finalSimilarity;
      }

      if (right.tacticalSimilarity !== left.tacticalSimilarity) {
        return right.tacticalSimilarity - left.tacticalSimilarity;
      }

      return right.statisticalSimilarity - left.statisticalSimilarity;
    })
    .slice(0, 5);
}

export function debugSimilarPlayers(currentPlayer, mode, filters, results = []) {
  if (!DEBUG_SAMPLE_PLAYERS.has(currentPlayer?.player)) {
    return;
  }

  console.debug('[similar-players]', {
    currentPlayer: currentPlayer.player,
    selectedMode: mode,
    selectedFilters: normalizeFilters(filters),
    topMatches: results.map((result) => ({
      player: result.player.player,
      statisticalSimilarity: Number(result.statisticalSimilarity.toFixed(2)),
      tacticalSimilarity: Number(result.tacticalSimilarity.toFixed(2)),
      contextSimilarity: Number(result.contextSimilarity.toFixed(2)),
      finalSimilarity: Number(result.finalSimilarity.toFixed(2))
    }))
  });
}
