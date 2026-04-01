import { buildPlayerKey, getLeagueFilterValue, getLeagueName, LEAGUE_FILTERS } from './dataset';
import { getReadableTacticalRoleLabel, toNumber } from './playerMetrics';
import { getPlayerRadarProfile } from './playerRadar';
import { normalizeString } from './search';
import { clamp, getPriorityMetricEntries } from './scoutingInsightHelpers';

export const SIMILARITY_MODES = {
  similarStyle: { id: 'similarStyle', label: 'Similar Style', tag: 'Style Match' },
  sameRole: { id: 'sameRole', label: 'Same Role', tag: 'Role Match' },
  youngerAlternative: { id: 'youngerAlternative', label: 'Younger Alternative', tag: 'Younger' },
  sameLevel: { id: 'sameLevel', label: 'Same-Level Alternative', tag: 'Same Level' },
  higherLevel: { id: 'higherLevel', label: 'Higher-Level Version', tag: 'Upgrade' }
};

export const PRIMARY_VISIBLE_SIMILARITY_MODES = [
  SIMILARITY_MODES.similarStyle.id,
  SIMILARITY_MODES.sameRole.id,
  SIMILARITY_MODES.youngerAlternative.id
];

const MODE_ORDER = [
  SIMILARITY_MODES.similarStyle.id,
  SIMILARITY_MODES.sameRole.id,
  SIMILARITY_MODES.youngerAlternative.id,
  SIMILARITY_MODES.sameLevel.id,
  SIMILARITY_MODES.higherLevel.id
];

const MINIMUM_MINUTES = 450;
const MINIMUM_RELIABILITY = 0.64;
const DEBUG_SAMPLE_PLAYERS = new Set(['Son Heung-min', 'Rodri', 'Bruno Guimaraes', 'Gabriel Jesus', 'Ollie Watkins', 'Mohamed Salah']);

const FLEXIBLE_EXACT_POSITION_MATCHES = {
  ST: new Set(['CF']),
  CF: new Set(['ST']),
  LW: new Set(['RW']),
  RW: new Set(['LW']),
  LB: new Set(['RB', 'LWB']),
  RB: new Set(['LB', 'RWB']),
  LWB: new Set(['LB']),
  RWB: new Set(['RB'])
};

const MODE_WEIGHTS = {
  [SIMILARITY_MODES.similarStyle.id]: { position: 0.12, radar: 0.23, categories: 0.15, metrics: 0.18, role: 0.14, archetype: 0.06, level: 0.04, age: 0.02, reliability: 0.06 },
  [SIMILARITY_MODES.sameRole.id]: { position: 0.14, radar: 0.18, categories: 0.14, metrics: 0.16, role: 0.24, archetype: 0.08, level: 0.03, age: 0.01, reliability: 0.02 },
  [SIMILARITY_MODES.youngerAlternative.id]: { position: 0.14, radar: 0.2, categories: 0.14, metrics: 0.16, role: 0.16, archetype: 0.05, level: 0.06, age: 0.07, reliability: 0.02 },
  [SIMILARITY_MODES.sameLevel.id]: { position: 0.12, radar: 0.21, categories: 0.15, metrics: 0.16, role: 0.15, archetype: 0.05, level: 0.1, age: 0.02, reliability: 0.04 },
  [SIMILARITY_MODES.higherLevel.id]: { position: 0.12, radar: 0.2, categories: 0.14, metrics: 0.16, role: 0.15, archetype: 0.05, level: 0.13, age: 0.01, reliability: 0.04 }
};

function getRatingLookupKey(player) {
  return normalizeString([player?.player, player?.squad, player?.league || player?.comp, player?.season].filter(Boolean).join(' '));
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

function normalizeVector(vector = []) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

  if (!magnitude) {
    return vector.map(() => 0);
  }

  return vector.map((value) => value / magnitude);
}

function cosineSimilarity(leftVector = [], rightVector = []) {
  if (!leftVector.length || leftVector.length !== rightVector.length) {
    return 0.5;
  }

  const normalizedLeft = normalizeVector(leftVector);
  const normalizedRight = normalizeVector(rightVector);
  const dotProduct = normalizedLeft.reduce((sum, value, index) => sum + value * normalizedRight[index], 0);
  return clamp((dotProduct + 1) / 2, 0, 1);
}

function buildRadarVector(rating = {}) {
  const radarProfile = getPlayerRadarProfile(rating);
  return radarProfile.radarAxes.map((axis) => ({
    key: axis.key,
    label: axis.label,
    value: toNumber(axis.value) / 100
  }));
}

function buildCategoryVector(rating = {}) {
  return [
    { key: 'attack', label: 'Attack', value: toNumber(rating.attackScore) / 100 },
    { key: 'creativity', label: 'Creativity', value: toNumber(rating.creativityScore) / 100 },
    { key: 'possession', label: 'Possession', value: toNumber(rating.possessionScore) / 100 },
    { key: 'defending', label: 'Defending', value: toNumber(rating.defendingScore) / 100 }
  ];
}

function buildRoleVector(currentRating = {}, candidateRating = {}) {
  const roleKeys = [...new Set([...Object.keys(currentRating.tacticalRoleScores || {}), ...Object.keys(candidateRating.tacticalRoleScores || {})])];

  if (!roleKeys.length) {
    return [];
  }

  return roleKeys.map((roleKey) => ({
    key: roleKey,
    label: getReadableTacticalRoleLabel(roleKey),
    currentValue: toNumber(currentRating.tacticalRoleScores?.[roleKey]) / 100,
    candidateValue: toNumber(candidateRating.tacticalRoleScores?.[roleKey]) / 100
  }));
}

function buildMetricVector(rating = {}) {
  return getPriorityMetricEntries(rating, 5).map((entry) => ({
    key: entry.key,
    label: entry.label,
    value: toNumber(entry.normalizedScore)
  }));
}

function getExactPositionScore(currentRating, candidateRating) {
  if (currentRating.exactPosition === candidateRating.exactPosition) {
    return 1;
  }

  if (FLEXIBLE_EXACT_POSITION_MATCHES[currentRating.exactPosition]?.has(candidateRating.exactPosition)) {
    return 0.86;
  }

  return currentRating.positionModel === candidateRating.positionModel ? 0.48 : 0.12;
}

function getRoleSimilarity(currentRating, candidateRating) {
  const roleVector = buildRoleVector(currentRating, candidateRating);

  if (!roleVector.length) {
    return 0.55;
  }

  return cosineSimilarity(
    roleVector.map((entry) => entry.currentValue),
    roleVector.map((entry) => entry.candidateValue)
  );
}

function getArchetypeSimilarity(currentRating, candidateRating) {
  if (!currentRating.playerArchetype || !candidateRating.playerArchetype) {
    return 0.5;
  }

  if (currentRating.playerArchetype === candidateRating.playerArchetype) {
    return 1;
  }

  if (currentRating.secondaryArchetype === candidateRating.playerArchetype || candidateRating.secondaryArchetype === currentRating.playerArchetype) {
    return 0.8;
  }

  return 0.38;
}

function getAgeSimilarity(currentPlayer, candidatePlayer) {
  return clamp(1 - Math.abs(getPlayerAge(currentPlayer) - getPlayerAge(candidatePlayer)) / 12, 0, 1);
}

function getLevelDelta(currentRating, candidateRating) {
  return toNumber(candidateRating.finalOVR) - toNumber(currentRating.finalOVR);
}

function getLevelSimilarity(currentRating, candidateRating) {
  return clamp(1 - Math.abs(getLevelDelta(currentRating, candidateRating)) / 10, 0, 1);
}

function getReliabilitySimilarity(currentPlayer, candidatePlayer, currentRating, candidateRating) {
  const currentMinutes = getEstimatedMinutes(currentPlayer, currentRating);
  const candidateMinutes = getEstimatedMinutes(candidatePlayer, candidateRating);
  return clamp(1 - Math.abs(currentMinutes - candidateMinutes) / 2400, 0, 1);
}

function getVectorSimilarity(leftEntries = [], rightEntries = []) {
  if (!leftEntries.length || !rightEntries.length) {
    return 0.5;
  }

  const keys = [...new Set([...leftEntries.map((entry) => entry.key), ...rightEntries.map((entry) => entry.key)])];
  const leftLookup = Object.fromEntries(leftEntries.map((entry) => [entry.key, entry.value]));
  const rightLookup = Object.fromEntries(rightEntries.map((entry) => [entry.key, entry.value]));
  return cosineSimilarity(
    keys.map((key) => toNumber(leftLookup[key])),
    keys.map((key) => toNumber(rightLookup[key]))
  );
}

function buildRadarComparisons(currentRating, candidateRating) {
  const currentRadar = buildRadarVector(currentRating);
  const candidateRadar = buildRadarVector(candidateRating);
  const candidateLookup = Object.fromEntries(candidateRadar.map((entry) => [entry.key, entry]));
  const comparisons = currentRadar.map((entry) => {
    const candidateEntry = candidateLookup[entry.key];
    const currentValue = toNumber(entry.value) * 100;
    const candidateValue = toNumber(candidateEntry?.value) * 100;

    return {
      key: entry.key,
      label: entry.label,
      currentValue,
      candidateValue,
      difference: Math.abs(currentValue - candidateValue),
      closeness: clamp(100 - Math.abs(currentValue - candidateValue), 0, 100)
    };
  });

  return {
    similarity: getVectorSimilarity(currentRadar, candidateRadar),
    comparisons
  };
}

function buildMetricComparisons(currentRating, candidateRating) {
  const currentMetrics = buildMetricVector(currentRating);
  const candidateMetrics = buildMetricVector(candidateRating);
  const keys = [...new Set([...currentMetrics.map((entry) => entry.key), ...candidateMetrics.map((entry) => entry.key)])];
  const currentLookup = Object.fromEntries(currentMetrics.map((entry) => [entry.key, entry]));
  const candidateLookup = Object.fromEntries(candidateMetrics.map((entry) => [entry.key, entry]));
  const comparisons = keys.map((key) => {
    const currentEntry = currentLookup[key];
    const candidateEntry = candidateLookup[key];
    const currentValue = toNumber(currentEntry?.value) * 100;
    const candidateValue = toNumber(candidateEntry?.value) * 100;

    return {
      key,
      label: currentEntry?.label || candidateEntry?.label || key,
      currentValue,
      candidateValue,
      difference: Math.abs(currentValue - candidateValue),
      closeness: clamp(100 - Math.abs(currentValue - candidateValue), 0, 100)
    };
  });

  return {
    similarity: getVectorSimilarity(
      keys.map((key) => ({ key, value: toNumber(currentLookup[key]?.value) })),
      keys.map((key) => ({ key, value: toNumber(candidateLookup[key]?.value) }))
    ),
    comparisons
  };
}

function buildCategoryComparisons(currentRating, candidateRating) {
  const currentCategories = buildCategoryVector(currentRating);
  const candidateCategories = buildCategoryVector(candidateRating);

  return {
    similarity: getVectorSimilarity(currentCategories, candidateCategories),
    overlap: currentCategories
      .map((entry) => ({
        key: entry.key,
        label: entry.label,
        difference: Math.abs(toNumber(entry.value) - toNumber(candidateCategories.find((candidateEntry) => candidateEntry.key === entry.key)?.value)) * 100
      }))
      .sort((left, right) => left.difference - right.difference)
      .slice(0, 2)
  };
}

function passesModeRequirements(mode, currentPlayer, candidatePlayer, currentRating, candidateRating) {
  const levelDelta = getLevelDelta(currentRating, candidateRating);
  const ageGap = getPlayerAge(currentPlayer) - getPlayerAge(candidatePlayer);

  switch (mode) {
    case SIMILARITY_MODES.higherLevel.id:
      return levelDelta >= 2;
    case SIMILARITY_MODES.youngerAlternative.id:
      return ageGap >= 1 && levelDelta >= -7;
    case SIMILARITY_MODES.sameLevel.id:
      return Math.abs(levelDelta) <= 4;
    default:
      return true;
  }
}

function getModeAdjustedScore(mode, breakdown, currentPlayer, candidatePlayer, currentRating, candidateRating) {
  const weights = MODE_WEIGHTS[mode] || MODE_WEIGHTS[SIMILARITY_MODES.similarStyle.id];
  let score =
    breakdown.position * weights.position +
    breakdown.radar * weights.radar +
    breakdown.categories * weights.categories +
    breakdown.metrics * weights.metrics +
    breakdown.role * weights.role +
    breakdown.archetype * weights.archetype +
    breakdown.level * weights.level +
    breakdown.age * weights.age +
    breakdown.reliability * weights.reliability;

  if (breakdown.position < 0.55 && breakdown.role < 0.62) {
    score *= 0.72;
  }

  if (mode === SIMILARITY_MODES.youngerAlternative.id) {
    score *= clamp(0.95 + (getPlayerAge(currentPlayer) - getPlayerAge(candidatePlayer)) * 0.02, 0.95, 1.08);
  }

  if (mode === SIMILARITY_MODES.higherLevel.id) {
    score *= clamp(0.96 + Math.min(getLevelDelta(currentRating, candidateRating), 7) * 0.015, 0.96, 1.08);
  }

  return clamp(score * 100, 0, 100);
}

function buildSharedTraits(radarComparisons = [], metricComparisons = []) {
  return [...radarComparisons, ...metricComparisons]
    .filter((entry) => entry.closeness >= 84)
    .sort((left, right) => right.closeness - left.closeness)
    .slice(0, 3)
    .map((entry) => entry.label);
}

function buildMajorDifference(currentRating, candidateRating, radarComparisons = [], metricComparisons = []) {
  const levelDelta = getLevelDelta(currentRating, candidateRating);

  if (Math.abs(levelDelta) >= 4) {
    return levelDelta > 0 ? 'Higher overall level' : 'Lower current level';
  }

  const biggestGap = [...radarComparisons, ...metricComparisons].sort((left, right) => right.difference - left.difference)[0];

  if (!biggestGap) {
    return 'Very few major separation points';
  }

  return biggestGap.currentValue > biggestGap.candidateValue ? `${biggestGap.label} is lighter` : `${biggestGap.label} is stronger`;
}

function buildRoleMatchIndicator(currentRating, candidateRating, positionScore, roleSimilarity) {
  if (currentRating.exactPosition === candidateRating.exactPosition && roleSimilarity >= 0.82) {
    return 'Exact role fit';
  }

  if (positionScore >= 0.86 && roleSimilarity >= 0.72) {
    return 'Strong role fit';
  }

  return 'Adjacent role fit';
}

function buildRecommendationHeadline(mode, finalSimilarity) {
  if (mode === SIMILARITY_MODES.higherLevel.id) {
    return finalSimilarity >= 82 ? 'Higher-level version' : 'Higher-level stylistic option';
  }

  if (mode === SIMILARITY_MODES.youngerAlternative.id) {
    return finalSimilarity >= 80 ? 'Younger version of the role' : 'Younger stylistic alternative';
  }

  if (mode === SIMILARITY_MODES.sameRole.id) {
    return finalSimilarity >= 80 ? 'Role-aligned match' : 'Role-adjacent match';
  }

  if (mode === SIMILARITY_MODES.sameLevel.id) {
    return finalSimilarity >= 80 ? 'Same-level alternative' : 'Same-band option';
  }

  return finalSimilarity >= 84 ? 'Strong stylistic match' : 'Useful stylistic match';
}

function buildComparisonContext(mode, currentPlayer, candidatePlayer, currentRating, candidateRating) {
  const ageGap = getPlayerAge(currentPlayer) - getPlayerAge(candidatePlayer);
  const levelDelta = getLevelDelta(currentRating, candidateRating);
  const contextBits = [];

  if (mode === SIMILARITY_MODES.youngerAlternative.id && ageGap > 0) {
    contextBits.push(`${ageGap} year${ageGap === 1 ? '' : 's'} younger`);
  }

  if (mode === SIMILARITY_MODES.higherLevel.id && levelDelta > 0) {
    contextBits.push(`+${Math.round(levelDelta)} OVR band`);
  }

  if (mode === SIMILARITY_MODES.sameLevel.id && Math.abs(levelDelta) <= 4) {
    contextBits.push(`within ${Math.abs(Math.round(levelDelta))} OVR`);
  }

  const minuteGap = Math.round((getEstimatedMinutes(candidatePlayer, candidateRating) - getEstimatedMinutes(currentPlayer, currentRating)) / 90);

  if (Math.abs(minuteGap) >= 4) {
    contextBits.push(`${minuteGap > 0 ? '+' : ''}${minuteGap} match-equivalents in sample`);
  }

  return contextBits.join(' / ');
}

function buildExplanationSentence(mode, currentRating, candidateRating, sharedTraits = [], majorDifference = '') {
  const roleLabel = getReadableTacticalRoleLabel(candidateRating.primaryTacticalRole).toLowerCase();
  const traitsText = sharedTraits.length ? sharedTraits.join(', ').toLowerCase() : 'role balance';

  switch (mode) {
    case SIMILARITY_MODES.sameRole.id:
      return `Similar because both project as ${roleLabel} profiles, with close overlap in ${traitsText}.`;
    case SIMILARITY_MODES.youngerAlternative.id:
      return `Younger alternative with a similar stylistic base, especially through ${traitsText}.`;
    case SIMILARITY_MODES.sameLevel.id:
      return `Same-band option with comparable role usage and profile shape through ${traitsText}.`;
    case SIMILARITY_MODES.higherLevel.id:
      return `Higher-level version of the same profile family, with most of the overlap showing in ${traitsText}.`;
    default:
      return `Similar because both profiles lean on ${traitsText}${majorDifference ? `, although ${majorDifference.toLowerCase()}` : ''}.`;
  }
}

function buildResult(currentPlayer, candidatePlayer, currentRating, candidateRating, mode) {
  const radarBreakdown = buildRadarComparisons(currentRating, candidateRating);
  const categoryBreakdown = buildCategoryComparisons(currentRating, candidateRating);
  const metricBreakdown = buildMetricComparisons(currentRating, candidateRating);
  const roleSimilarity = getRoleSimilarity(currentRating, candidateRating);
  const positionScore = getExactPositionScore(currentRating, candidateRating);
  const archetypeSimilarity = getArchetypeSimilarity(currentRating, candidateRating);
  const breakdown = {
    position: positionScore,
    radar: radarBreakdown.similarity,
    categories: categoryBreakdown.similarity,
    metrics: metricBreakdown.similarity,
    role: roleSimilarity,
    archetype: archetypeSimilarity,
    level: getLevelSimilarity(currentRating, candidateRating),
    age: getAgeSimilarity(currentPlayer, candidatePlayer),
    reliability: getReliabilitySimilarity(currentPlayer, candidatePlayer, currentRating, candidateRating)
  };
  const finalSimilarity = getModeAdjustedScore(mode, breakdown, currentPlayer, candidatePlayer, currentRating, candidateRating);
  const topSharedTraits = buildSharedTraits(radarBreakdown.comparisons, metricBreakdown.comparisons);
  const majorDifference = buildMajorDifference(currentRating, candidateRating, radarBreakdown.comparisons, metricBreakdown.comparisons);
  const explanation = buildExplanationSentence(mode, currentRating, candidateRating, topSharedTraits, majorDifference);
  const comparisonContext = buildComparisonContext(mode, currentPlayer, candidatePlayer, currentRating, candidateRating);

  return {
    player: candidatePlayer,
    rating: candidateRating,
    finalSimilarity,
    similarityMode: mode,
    similarityModeLabel: SIMILARITY_MODES[mode]?.label || SIMILARITY_MODES.similarStyle.label,
    modeTag: SIMILARITY_MODES[mode]?.tag || 'Match',
    recommendationHeadline: buildRecommendationHeadline(mode, finalSimilarity),
    explanation,
    whyMatch: explanation,
    roleMatchIndicator: buildRoleMatchIndicator(currentRating, candidateRating, positionScore, roleSimilarity),
    comparisonContext,
    topSharedTraits,
    majorDifference,
    keyDifferences: [majorDifference],
    sharedStrengths: topSharedTraits,
    compactBreakdown: {
      style: Math.round((0.6 * radarBreakdown.similarity + 0.4 * categoryBreakdown.similarity) * 100),
      role: Math.round(roleSimilarity * 100),
      level: Math.round(getLevelSimilarity(currentRating, candidateRating) * 100)
    },
    roleMatchScore: Math.round(roleSimilarity * 100),
    archetypeMatch: Math.round(archetypeSimilarity * 100),
    featureComparisons: [...radarBreakdown.comparisons, ...metricBreakdown.comparisons],
    levelDelta: Math.round(getLevelDelta(currentRating, candidateRating)),
    ageDelta: Math.round(getPlayerAge(candidatePlayer) - getPlayerAge(currentPlayer)),
    positionExactMatch: currentRating.exactPosition === candidateRating.exactPosition
  };
}

export function getEligibleSimilarPlayers(currentPlayer, players, ratingIndex, filters = {}, mode = SIMILARITY_MODES.similarStyle.id) {
  const currentKey = buildPlayerKey(currentPlayer);
  const currentRating = ratingIndex[getRatingLookupKey(currentPlayer)] || ratingIndex[normalizeString(currentPlayer?.player || '')];
  const normalizedFilters = normalizeFilters(filters);
  const currentLeague = getLeagueName(currentPlayer);
  const currentAge = getPlayerAge(currentPlayer);

  if (!currentPlayer || !currentRating) {
    return [];
  }

  return players.filter((candidatePlayer) => {
    const candidateKey = buildPlayerKey(candidatePlayer);
    const candidateRating = ratingIndex[getRatingLookupKey(candidatePlayer)] || ratingIndex[normalizeString(candidatePlayer?.player || '')];

    if (!candidateRating || candidateKey === currentKey) {
      return false;
    }

    if (!hasStrongEnoughSample(candidatePlayer, candidateRating)) {
      return false;
    }

    if (candidateRating.positionModel !== currentRating.positionModel) {
      return false;
    }

    if (getExactPositionScore(currentRating, candidateRating) < 0.45) {
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

export function getSimilarPlayersForPlayer(currentPlayer, players, ratingIndex, mode = SIMILARITY_MODES.similarStyle.id, filters = {}) {
  const currentRating = ratingIndex[getRatingLookupKey(currentPlayer)] || ratingIndex[normalizeString(currentPlayer?.player || '')];

  if (!currentPlayer || !currentRating) {
    return [];
  }

  return getEligibleSimilarPlayers(currentPlayer, players, ratingIndex, filters, mode)
    .map((candidatePlayer) => {
      return buildResult(
        currentPlayer,
        candidatePlayer,
        currentRating,
        ratingIndex[getRatingLookupKey(candidatePlayer)] || ratingIndex[normalizeString(candidatePlayer?.player || '')],
        mode
      );
    })
    .filter((result) => result.finalSimilarity >= 60)
    .sort((left, right) => {
      if (right.finalSimilarity !== left.finalSimilarity) {
        return right.finalSimilarity - left.finalSimilarity;
      }

      if (right.positionExactMatch !== left.positionExactMatch) {
        return Number(right.positionExactMatch) - Number(left.positionExactMatch);
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
      roleMatch: result.roleMatchIndicator,
      traits: result.topSharedTraits,
      difference: result.majorDifference,
      context: result.comparisonContext
    }))
  });
}
