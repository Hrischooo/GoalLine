import { getLeagueFilterValue, getLeagueName, LEAGUE_FILTERS } from './dataset';
import { getReadableTacticalRoleLabel, toNumber } from './playerMetrics';
import { getPlayerRadarProfile } from './playerRadar';

export const SIMILARITY_MODES = {
  similarStyle: { id: 'similarStyle', label: 'Similar Style', tag: 'Style Match' },
  sameRole: { id: 'sameRole', label: 'Same Role', tag: 'Role Match' },
  higherLevel: { id: 'higherLevel', label: 'Higher-Level Version', tag: 'Upgrade' },
  youngerAlternative: { id: 'youngerAlternative', label: 'Younger Alternative', tag: 'Younger' },
  budgetAlternative: { id: 'budgetAlternative', label: 'Budget Alternative', tag: 'Budget' },
  sameLevel: { id: 'sameLevel', label: 'Same-Level Option', tag: 'Same Level' }
};

const MODE_ORDER = [
  SIMILARITY_MODES.similarStyle.id,
  SIMILARITY_MODES.higherLevel.id,
  SIMILARITY_MODES.youngerAlternative.id,
  SIMILARITY_MODES.sameLevel.id
];

const MINIMUM_MINUTES = 500;
const MINIMUM_RELIABILITY = 0.68;
const DEBUG_SAMPLE_PLAYERS = new Set(['Son Heung-min', 'Rodri', 'Bruno Guimaraes', 'Gabriel Jesus', 'Ollie Watkins', 'Mohamed Salah']);

const POSITION_DIMENSIONS = {
  GK: [
    ['shot_stopping', 'shot stopping', 1.2],
    ['command', 'command', 1],
    ['distribution', 'distribution', 0.85],
    ['handling_security', 'handling security', 0.8],
    ['reliability', 'reliability', 0.65]
  ],
  CB: [
    ['defending', 'defending', 1.2],
    ['positioning', 'positioning', 1.05],
    ['aerial', 'aerial presence', 1],
    ['physical_dueling', 'duel profile', 0.95],
    ['ball_security', 'ball security', 0.7],
    ['progression', 'progression', 0.7]
  ],
  'LB/RB': [
    ['defending', 'defending', 0.95],
    ['progression', 'progression', 1],
    ['delivery', 'delivery', 0.9],
    ['carrying', 'carrying', 0.95],
    ['support_play', 'support play', 0.85],
    ['ball_security', 'ball security', 0.65]
  ],
  DM: [
    ['ball_winning', 'ball-winning', 1.05],
    ['positioning', 'positioning', 1],
    ['possession_control', 'possession control', 1.05],
    ['security', 'security', 0.95],
    ['progression', 'progression', 0.85],
    ['passing_range', 'passing range', 0.75]
  ],
  CM: [
    ['progression', 'progression', 1],
    ['creativity', 'creativity', 0.85],
    ['possession', 'possession', 1],
    ['control', 'control', 0.95],
    ['work_rate', 'work rate', 0.75],
    ['ball_security', 'ball security', 0.75]
  ],
  CAM: [
    ['creativity', 'chance creation', 1.15],
    ['attack', 'attack threat', 0.95],
    ['final_third_delivery', 'final-third delivery', 1],
    ['progression', 'progression', 0.8],
    ['flair_carrying', 'carrying flair', 0.9],
    ['possession', 'possession', 0.65]
  ],
  'LW/RW': [
    ['attack', 'attack threat', 1.05],
    ['creativity', 'chance creation', 0.85],
    ['dribbling', 'dribbling', 1],
    ['carry_threat', 'carry threat', 1],
    ['delivery', 'final-third delivery', 0.85],
    ['retention', 'ball retention', 0.65]
  ],
  ST: [
    ['finishing', 'finishing', 1.1],
    ['shot_threat', 'shot threat', 1.05],
    ['box_presence', 'box presence', 1],
    ['attack', 'attack output', 1],
    ['link_play', 'link play', 0.75],
    ['aerial_threat', 'aerial threat', 0.65]
  ]
};

const MODE_WEIGHTS = {
  [SIMILARITY_MODES.similarStyle.id]: { radar: 0.3, category: 0.22, role: 0.28, archetype: 0.1, level: 0.04, age: 0.02, reliability: 0.04 },
  [SIMILARITY_MODES.sameRole.id]: { radar: 0.18, category: 0.22, role: 0.4, archetype: 0.12, level: 0.04, age: 0.02, reliability: 0.02 },
  [SIMILARITY_MODES.higherLevel.id]: { radar: 0.26, category: 0.18, role: 0.24, archetype: 0.1, level: 0.18, age: 0.01, reliability: 0.03 },
  [SIMILARITY_MODES.youngerAlternative.id]: { radar: 0.22, category: 0.2, role: 0.24, archetype: 0.1, level: 0.08, age: 0.12, reliability: 0.04 },
  [SIMILARITY_MODES.budgetAlternative.id]: { radar: 0.22, category: 0.18, role: 0.24, archetype: 0.1, level: 0.18, age: 0.03, reliability: 0.05 },
  [SIMILARITY_MODES.sameLevel.id]: { radar: 0.24, category: 0.22, role: 0.24, archetype: 0.1, level: 0.14, age: 0.03, reliability: 0.03 }
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getPlayerKey(player) {
  return String(player?.player || '').trim().toLowerCase();
}

function getPlayerAge(player) {
  return toNumber(player?.age);
}

function getEstimatedMinutes(player, rating) {
  return toNumber(rating?.minutesPlayed || player?.minutes_played || player?.minutes || toNumber(player?.matches_played) * toNumber(player?.avg_mins_per_match));
}

function hasStrongEnoughSample(player, rating) {
  return getEstimatedMinutes(player, rating) >= MINIMUM_MINUTES && toNumber(rating?.reliabilityModifier) >= MINIMUM_RELIABILITY;
}

function normalizeFilters(filters = {}) {
  return {
    leagueFilter: filters.leagueFilter || LEAGUE_FILTERS.all.id,
    sameLeagueOnly: Boolean(filters.sameLeagueOnly),
    similarAgeOnly: Boolean(filters.similarAgeOnly),
    samePrimaryRoleOnly: Boolean(filters.samePrimaryRoleOnly)
  };
}

function buildRadarLookup(rating = {}) {
  return Object.fromEntries(getPlayerRadarProfile(rating).radarAxes.map((axis) => [axis.key, axis.value]));
}

function buildCategoryLookup(rating = {}) {
  return {
    attack: toNumber(rating.attackScore),
    creativity: toNumber(rating.creativityScore),
    possession: toNumber(rating.possessionScore),
    defending: toNumber(rating.defendingScore)
  };
}

function getPositionDimensions(rating = {}) {
  return POSITION_DIMENSIONS[rating.positionModel] || POSITION_DIMENSIONS.CM;
}

function getAverageSimilarity(leftLookup = {}, rightLookup = {}, keys = [], weights = {}) {
  let weightedDiff = 0;
  let totalWeight = 0;

  for (const key of keys) {
    const weight = weights[key] || 1;
    const diff = Math.abs(toNumber(leftLookup[key]) - toNumber(rightLookup[key]));
    weightedDiff += diff * weight;
    totalWeight += weight;
  }

  return totalWeight ? clamp(100 - weightedDiff / totalWeight, 0, 100) : 50;
}

function buildRadarComparisons(currentRating, candidateRating) {
  const currentRadar = buildRadarLookup(currentRating);
  const candidateRadar = buildRadarLookup(candidateRating);
  const comparisons = getPositionDimensions(currentRating).map(([key, label, weight]) => {
    const currentValue = toNumber(currentRadar[key]);
    const candidateValue = toNumber(candidateRadar[key]);
    const difference = Math.abs(currentValue - candidateValue);

    return {
      key,
      label,
      weight,
      currentValue,
      candidateValue,
      difference,
      closeness: clamp(100 - difference, 0, 100)
    };
  });

  const weightedDifference = comparisons.reduce((sum, item) => sum + item.difference * item.weight, 0);
  const totalWeight = comparisons.reduce((sum, item) => sum + item.weight, 0);

  return {
    comparisons,
    similarity: totalWeight ? clamp(100 - weightedDifference / totalWeight, 0, 100) : 50
  };
}

function buildCategorySimilarity(currentRating, candidateRating) {
  const currentCategories = buildCategoryLookup(currentRating);
  const candidateCategories = buildCategoryLookup(candidateRating);
  const keys = Object.keys(currentCategories);

  return {
    similarity: getAverageSimilarity(currentCategories, candidateCategories, keys),
    overlap: [...keys]
      .map((key) => ({ key, delta: Math.abs(currentCategories[key] - candidateCategories[key]) }))
      .sort((left, right) => left.delta - right.delta)
      .slice(0, 2)
      .map((entry) => entry.key)
  };
}

function buildRoleSimilarity(currentRating, candidateRating) {
  const roleKeys = [...new Set([...Object.keys(currentRating?.tacticalRoleScores || {}), ...Object.keys(candidateRating?.tacticalRoleScores || {})])];
  const roleVectorSimilarity = roleKeys.length
    ? clamp(
        100 -
          roleKeys.reduce((sum, roleKey) => sum + Math.abs(toNumber(currentRating?.tacticalRoleScores?.[roleKey]) - toNumber(candidateRating?.tacticalRoleScores?.[roleKey])), 0) /
            roleKeys.length,
        0,
        100
      )
    : 55;
  const primaryRoleMatch =
    !currentRating?.primaryTacticalRole || !candidateRating?.primaryTacticalRole
      ? 55
      : currentRating.primaryTacticalRole === candidateRating.primaryTacticalRole
        ? 100
        : currentRating.primaryTacticalRole === candidateRating.secondaryTacticalRole || currentRating.secondaryTacticalRole === candidateRating.primaryTacticalRole
          ? 80
          : 32;
  const archetypeMatch =
    !currentRating?.playerArchetype || !candidateRating?.playerArchetype
      ? 55
      : currentRating.playerArchetype === candidateRating.playerArchetype
        ? 100
        : currentRating.secondaryArchetype === candidateRating.playerArchetype || candidateRating.secondaryArchetype === currentRating.playerArchetype
          ? 82
          : 38;

  return {
    roleVectorSimilarity,
    primaryRoleMatch,
    archetypeMatch,
    similarity: 0.5 * roleVectorSimilarity + 0.32 * primaryRoleMatch + 0.18 * archetypeMatch
  };
}

function getPositionMatch(currentRating, candidateRating) {
  if (currentRating.exactPosition === candidateRating.exactPosition) {
    return 100;
  }

  if (currentRating.positionModel === candidateRating.positionModel) {
    return 88;
  }

  return 45;
}

function getLevelDelta(currentRating, candidateRating) {
  return toNumber(candidateRating.finalOVR) - toNumber(currentRating.finalOVR);
}

function getLevelSimilarity(currentRating, candidateRating) {
  return clamp(100 - Math.abs(getLevelDelta(currentRating, candidateRating)) * 8, 0, 100);
}

function getAgeSimilarity(currentPlayer, candidatePlayer) {
  return clamp(100 - Math.abs(getPlayerAge(currentPlayer) - getPlayerAge(candidatePlayer)) * 10, 0, 100);
}

function getReliabilitySimilarity(currentPlayer, candidatePlayer, currentRating, candidateRating) {
  const currentMinutes = getEstimatedMinutes(currentPlayer, currentRating);
  const candidateMinutes = getEstimatedMinutes(candidatePlayer, candidateRating);
  return clamp(100 - Math.abs(currentMinutes - candidateMinutes) / 45, 0, 100);
}

function passesModeRequirements(mode, currentPlayer, candidatePlayer, currentRating, candidateRating) {
  const levelDelta = getLevelDelta(currentRating, candidateRating);
  const currentAge = getPlayerAge(currentPlayer);
  const candidateAge = getPlayerAge(candidatePlayer);

  switch (mode) {
    case SIMILARITY_MODES.higherLevel.id:
      return levelDelta >= 3;
    case SIMILARITY_MODES.youngerAlternative.id:
      return candidateAge > 0 && currentAge > 0 && candidateAge < currentAge;
    case SIMILARITY_MODES.budgetAlternative.id:
      return levelDelta <= -3;
    case SIMILARITY_MODES.sameLevel.id:
      return Math.abs(levelDelta) <= 5;
    default:
      return true;
  }
}

function buildSharedTraits(radarComparisons = []) {
  return [...radarComparisons]
    .filter((entry) => entry.closeness >= 84)
    .sort((left, right) => right.weight * right.closeness - left.weight * left.closeness)
    .slice(0, 3)
    .map((entry) => entry.label);
}

function buildSharedStrengthLabels(currentRating, candidateRating, sharedTraits = []) {
  const archetypeLabel = currentRating?.playerArchetype === candidateRating?.playerArchetype ? currentRating.playerArchetype : null;
  return [archetypeLabel, ...sharedTraits].filter(Boolean).slice(0, 3);
}

function buildMajorDifference(radarComparisons = [], currentRating, candidateRating) {
  const biggestGap = [...radarComparisons].sort((left, right) => right.difference - left.difference)[0];
  const levelDelta = getLevelDelta(currentRating, candidateRating);

  if (Math.abs(levelDelta) >= 5) {
    return levelDelta > 0 ? 'stronger overall level' : 'lower overall level';
  }

  if (!biggestGap) {
    return 'very few meaningful profile gaps';
  }

  return biggestGap.currentValue > biggestGap.candidateValue ? `${biggestGap.label} is lighter` : `${biggestGap.label} is stronger`;
}

function getCategoryOverlapSummary(overlap = []) {
  return overlap.map((key) => key.charAt(0).toUpperCase() + key.slice(1)).join(' + ') || 'Balanced overlap';
}

function getScoutingBand(finalSimilarity) {
  if (finalSimilarity >= 86) {
    return 'Elite match';
  }

  if (finalSimilarity >= 78) {
    return 'Strong match';
  }

  if (finalSimilarity >= 68) {
    return 'Useful match';
  }

  return 'Loose match';
}

function buildExplanationSentence(mode, currentRating, candidateRating, sharedTraits = [], differenceText = '') {
  const roleText = getReadableTacticalRoleLabel(candidateRating?.primaryTacticalRole).toLowerCase();
  const traitsText = sharedTraits.length ? sharedTraits.join(', ') : 'role balance';

  switch (mode) {
    case SIMILARITY_MODES.sameRole.id:
      return `Both project as ${roleText} profiles, with especially close overlap in ${traitsText}.`;
    case SIMILARITY_MODES.higherLevel.id:
      return `Upgrade option: similar role usage and trait mix, but with a stronger overall performance band.`;
    case SIMILARITY_MODES.youngerAlternative.id:
      return `Younger alternative with a comparable role shape, especially through ${traitsText}.`;
    case SIMILARITY_MODES.budgetAlternative.id:
      return `Budget-style option: similar profile signals in ${traitsText}, but at a lower current level.`;
    case SIMILARITY_MODES.sameLevel.id:
      return `Same-level alternative with comparable output shape and role utility through ${traitsText}.`;
    default:
      return `Style match built on shared strengths in ${traitsText}.`;
  }
}

function buildRecommendationHeadline(mode, currentRating, candidateRating, finalSimilarity) {
  const band = getScoutingBand(finalSimilarity);

  switch (mode) {
    case SIMILARITY_MODES.higherLevel.id:
      return `${band} upgrade option`;
    case SIMILARITY_MODES.youngerAlternative.id:
      return `${band} younger alternative`;
    case SIMILARITY_MODES.budgetAlternative.id:
      return `${band} budget alternative`;
    case SIMILARITY_MODES.sameRole.id:
      return `${band} same-role recommendation`;
    case SIMILARITY_MODES.sameLevel.id:
      return `${band} same-level alternative`;
    default:
      return `${band} stylistic match`;
  }
}

function getRolePenalty(roleSimilarity, archetypeMatch) {
  if (roleSimilarity < 55 && archetypeMatch < 60) {
    return 0.74;
  }

  if (roleSimilarity < 65) {
    return 0.88;
  }

  return 1;
}

function getModeAdjustedScore(mode, breakdown, currentPlayer, candidatePlayer, currentRating, candidateRating) {
  const weights = MODE_WEIGHTS[mode] || MODE_WEIGHTS[SIMILARITY_MODES.similarStyle.id];
  const weightedScore =
    breakdown.radarSimilarity * weights.radar +
    breakdown.categorySimilarity * weights.category +
    breakdown.roleSimilarity * weights.role +
    breakdown.archetypeMatch * weights.archetype +
    breakdown.levelSimilarity * weights.level +
    breakdown.ageSimilarity * weights.age +
    breakdown.reliabilitySimilarity * weights.reliability;
  let modeAdjusted = weightedScore * getRolePenalty(breakdown.roleSimilarity, breakdown.archetypeMatch);
  const levelDelta = getLevelDelta(currentRating, candidateRating);

  if (mode === SIMILARITY_MODES.higherLevel.id) {
    modeAdjusted *= clamp(0.9 + Math.min(levelDelta, 8) * 0.02, 0.9, 1.08);
  }

  if (mode === SIMILARITY_MODES.youngerAlternative.id) {
    const ageGap = getPlayerAge(currentPlayer) - getPlayerAge(candidatePlayer);
    modeAdjusted *= clamp(0.92 + ageGap * 0.03, 0.92, 1.08);
  }

  if (mode === SIMILARITY_MODES.budgetAlternative.id) {
    modeAdjusted *= clamp(0.92 + Math.abs(Math.min(levelDelta, -3)) * 0.015, 0.92, 1.04);
  }

  return clamp(modeAdjusted, 0, 100);
}

export function getEligibleSimilarPlayers(currentPlayer, players, ratingIndex, filters = {}, mode = SIMILARITY_MODES.similarStyle.id) {
  const currentRating = ratingIndex[getPlayerKey(currentPlayer)];
  const normalizedFilters = normalizeFilters(filters);
  const currentLeague = getLeagueName(currentPlayer);
  const currentAge = getPlayerAge(currentPlayer);

  if (!currentPlayer || !currentRating) {
    return [];
  }

  return players.filter((candidatePlayer) => {
    const candidateRating = ratingIndex[getPlayerKey(candidatePlayer)];

    if (!candidateRating || getPlayerKey(candidatePlayer) === getPlayerKey(currentPlayer)) {
      return false;
    }

    if (!hasStrongEnoughSample(candidatePlayer, candidateRating)) {
      return false;
    }

    if (candidateRating.positionModel !== currentRating.positionModel) {
      return false;
    }

    if (!passesModeRequirements(mode, currentPlayer, candidatePlayer, currentRating, candidateRating)) {
      return false;
    }

    if (normalizedFilters.leagueFilter !== LEAGUE_FILTERS.all.id && getLeagueFilterValue(candidatePlayer) !== normalizedFilters.leagueFilter) {
      return false;
    }

    if (normalizedFilters.sameLeagueOnly && getLeagueName(candidatePlayer) !== currentLeague) {
      return false;
    }

    if (normalizedFilters.similarAgeOnly && Math.abs(getPlayerAge(candidatePlayer) - currentAge) > 3) {
      return false;
    }

    if (normalizedFilters.samePrimaryRoleOnly && candidateRating.primaryTacticalRole !== currentRating.primaryTacticalRole) {
      return false;
    }

    return true;
  });
}

function buildResult(currentPlayer, candidatePlayer, currentRating, candidateRating, mode) {
  const radarBreakdown = buildRadarComparisons(currentRating, candidateRating);
  const categoryBreakdown = buildCategorySimilarity(currentRating, candidateRating);
  const roleBreakdown = buildRoleSimilarity(currentRating, candidateRating);
  const levelSimilarity = 0.72 * getLevelSimilarity(currentRating, candidateRating) + 0.28 * getPositionMatch(currentRating, candidateRating);
  const ageSimilarity = getAgeSimilarity(currentPlayer, candidatePlayer);
  const reliabilitySimilarity = getReliabilitySimilarity(currentPlayer, candidatePlayer, currentRating, candidateRating);
  const breakdown = {
    radarSimilarity: radarBreakdown.similarity,
    categorySimilarity: categoryBreakdown.similarity,
    roleSimilarity: roleBreakdown.similarity,
    archetypeMatch: roleBreakdown.archetypeMatch,
    levelSimilarity,
    ageSimilarity,
    reliabilitySimilarity
  };
  const finalSimilarity = getModeAdjustedScore(mode, breakdown, currentPlayer, candidatePlayer, currentRating, candidateRating);
  const topSharedTraits = buildSharedTraits(radarBreakdown.comparisons);
  const sharedStrengths = buildSharedStrengthLabels(currentRating, candidateRating, topSharedTraits);
  const majorDifference = buildMajorDifference(radarBreakdown.comparisons, currentRating, candidateRating);
  const headline = buildRecommendationHeadline(mode, currentRating, candidateRating, finalSimilarity);
  const explanation = buildExplanationSentence(mode, currentRating, candidateRating, topSharedTraits, majorDifference);
  const whyMatch = `${headline}. ${explanation}`;

  return {
    player: candidatePlayer,
    rating: candidateRating,
    similarityScore: finalSimilarity,
    finalSimilarity,
    similarityMode: mode,
    similarityModeLabel: SIMILARITY_MODES[mode]?.label || SIMILARITY_MODES.similarStyle.label,
    modeTag: SIMILARITY_MODES[mode]?.tag || 'Match',
    recommendationHeadline: headline,
    explanation,
    whyMatch,
    styleMatchSummary: `Shared strengths: ${sharedStrengths.join(', ') || 'balanced role profile'}.`,
    roleMatchScore: Math.round(roleBreakdown.similarity),
    categoryOverlapSummary: getCategoryOverlapSummary(categoryBreakdown.overlap),
    topSharedTraits,
    sharedStrengths,
    keyDifferences: [majorDifference],
    majorDifference,
    roleVectorSimilarity: roleBreakdown.roleVectorSimilarity,
    primaryRoleMatch: roleBreakdown.primaryRoleMatch,
    archetypeMatch: roleBreakdown.archetypeMatch,
    compactBreakdown: {
      style: Math.round(0.55 * radarBreakdown.similarity + 0.45 * categoryBreakdown.similarity),
      role: Math.round(roleBreakdown.similarity),
      level: Math.round(levelSimilarity)
    },
    featureComparisons: radarBreakdown.comparisons
  };
}

export function getSimilarPlayersForPlayer(currentPlayer, players, ratingIndex, mode = SIMILARITY_MODES.similarStyle.id, filters = {}) {
  const currentRating = ratingIndex[getPlayerKey(currentPlayer)];

  if (!currentPlayer || !currentRating) {
    return [];
  }

  return getEligibleSimilarPlayers(currentPlayer, players, ratingIndex, filters, mode)
    .map((candidatePlayer) => buildResult(currentPlayer, candidatePlayer, currentRating, ratingIndex[getPlayerKey(candidatePlayer)], mode))
    .filter((result) => result.finalSimilarity >= 58)
    .sort((left, right) => {
      if (right.finalSimilarity !== left.finalSimilarity) {
        return right.finalSimilarity - left.finalSimilarity;
      }

      return right.roleMatchScore - left.roleMatchScore;
    })
    .slice(0, 6);
}

export function getSimilarPlayerBuckets(currentPlayer, players, ratingIndex, filters = {}) {
  return MODE_ORDER.map((mode) => {
    const results = getSimilarPlayersForPlayer(currentPlayer, players, ratingIndex, mode, filters);
    const topResult = results[0] || null;

    return {
      key: mode,
      mode,
      label: SIMILARITY_MODES[mode].label,
      tag: SIMILARITY_MODES[mode].tag,
      count: results.length,
      topResult,
      results
    };
  }).filter((bucket) => bucket.count > 0);
}

export function debugSimilarPlayers(currentPlayer, mode, filters, results = []) {
  if (!DEBUG_SAMPLE_PLAYERS.has(currentPlayer?.player)) {
    return;
  }

  console.debug('[similar-players]', {
    currentPlayer: currentPlayer.player,
    mode,
    filters: normalizeFilters(filters),
    topMatches: results.map((result) => ({
      player: result.player.player,
      similarity: Math.round(result.finalSimilarity),
      headline: result.recommendationHeadline,
      role: result.rating.primaryTacticalRoleLabel,
      sharedStrengths: result.sharedStrengths,
      difference: result.majorDifference
    }))
  });
}
