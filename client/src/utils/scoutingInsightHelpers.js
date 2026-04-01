import { buildPlayerKey, getLeagueName } from './dataset';
import { computeDisplayMetrics, formatPercentileLabel, getReadableMetricLabel, toNumber } from './playerMetrics';
import { getPlayerRadarProfile } from './playerRadar';

export const CATEGORY_META = [
  { key: 'attack', label: 'Attack' },
  { key: 'creativity', label: 'Creativity' },
  { key: 'possession', label: 'Possession' },
  { key: 'defending', label: 'Defending' }
];

export const CATEGORY_LABELS = Object.fromEntries(CATEGORY_META.map((entry) => [entry.key, entry.label]));

export const POSITION_FORMATION_MAP = {
  GK: ['4-3-3', '4-2-3-1'],
  CB: ['4-3-3', '3-4-3', '4-2-3-1'],
  'LB/RB': ['4-3-3', '4-2-3-1', '3-4-3'],
  DM: ['4-3-3', '4-2-3-1', '4-1-4-1'],
  CM: ['4-3-3', '4-1-4-1', '4-4-2'],
  CAM: ['4-2-3-1', '4-3-3', '4-1-2-1-2'],
  'LW/RW': ['4-3-3', '4-2-3-1', '3-4-3'],
  ST: ['4-3-3', '4-2-3-1', '4-4-2']
};

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + toNumber(value), 0) / values.length;
}

export function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function seededPick(seed, variants = [], fallback = '') {
  if (!variants.length) {
    return fallback;
  }

  const numericSeed = String(seed || '')
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return variants[numericSeed % variants.length];
}

export function getComparablePool(player, metrics, players = [], ratingIndex = {}, options = {}) {
  const {
    minLeagueExact = 6,
    minDatasetExact = 8,
    minLeagueModel = 8
  } = options;
  const currentKey = buildPlayerKey(player);
  const currentLeague = getLeagueName(player);

  function buildPool(predicate) {
    return players
      .filter((candidate) => buildPlayerKey(candidate) !== currentKey)
      .map((candidate) => ({
        candidate,
        candidateMetrics: computeDisplayMetrics(candidate, ratingIndex)
      }))
      .filter(({ candidate, candidateMetrics }) => predicate(candidate, candidateMetrics))
      .map(({ candidateMetrics }) => candidateMetrics)
      .filter((candidateMetrics) => candidateMetrics?.finalOVR > 0);
  }

  const leagueExactPool = buildPool((candidate, candidateMetrics) => getLeagueName(candidate) === currentLeague && candidateMetrics.exactPosition === metrics.exactPosition);

  if (leagueExactPool.length >= minLeagueExact) {
    return {
      pool: leagueExactPool,
      poolLabel: `${currentLeague} ${metrics.exactPosition}s`,
      scope: 'league_exact',
      sampleSize: leagueExactPool.length,
      usedFallback: false
    };
  }

  const datasetExactPool = buildPool((candidate, candidateMetrics) => candidateMetrics.exactPosition === metrics.exactPosition);

  if (datasetExactPool.length >= minDatasetExact) {
    return {
      pool: datasetExactPool,
      poolLabel: `${metrics.exactPosition} dataset pool`,
      scope: 'dataset_exact',
      sampleSize: datasetExactPool.length,
      usedFallback: true
    };
  }

  const leagueModelPool = buildPool((candidate, candidateMetrics) => getLeagueName(candidate) === currentLeague && candidateMetrics.positionModel === metrics.positionModel);

  if (leagueModelPool.length >= minLeagueModel) {
    return {
      pool: leagueModelPool,
      poolLabel: `${currentLeague} ${metrics.positionModel} role pool`,
      scope: 'league_model',
      sampleSize: leagueModelPool.length,
      usedFallback: true
    };
  }

  const datasetModelPool = buildPool((candidate, candidateMetrics) => candidateMetrics.positionModel === metrics.positionModel);

  return {
    pool: datasetModelPool,
    poolLabel: `${metrics.positionModel} dataset pool`,
    scope: 'dataset_model',
    sampleSize: datasetModelPool.length,
    usedFallback: true
  };
}

export function percentileFromValues(values = [], currentValue, invert = false) {
  if (!values.length) {
    return 50;
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const belowCount = sortedValues.filter((value) => value < currentValue).length;
  const rawPercentile = Math.round((belowCount / sortedValues.length) * 100);
  return invert ? 100 - rawPercentile : rawPercentile;
}

export function describePercentile(percentile) {
  if (percentile >= 90) {
    return 'elite';
  }

  if (percentile >= 78) {
    return 'strong';
  }

  if (percentile >= 60) {
    return 'solid';
  }

  if (percentile <= 12) {
    return 'very weak';
  }

  if (percentile <= 28) {
    return 'weak';
  }

  if (percentile <= 42) {
    return 'below par';
  }

  return 'average';
}

export function getConfidenceLabel(metrics = {}) {
  const confidenceScore = 0.6 * toNumber(metrics.reliabilityModifier) + 0.4 * toNumber(metrics.dataCoverageModifier);

  if (confidenceScore >= 0.95) {
    return 'High confidence';
  }

  if (confidenceScore >= 0.86) {
    return 'Solid confidence';
  }

  return 'Moderate confidence';
}

export function getCategoryEntries(metrics = {}) {
  return CATEGORY_META.map((entry) => ({
    ...entry,
    value: toNumber(metrics[`${entry.key}Score`])
  }));
}

export function getProfileSpread(metrics = {}) {
  const values = getCategoryEntries(metrics).map((entry) => entry.value);
  return Math.max(...values, 0) - Math.min(...values, 0);
}

export function getRadarAxes(metrics = {}) {
  return getPlayerRadarProfile(metrics).radarAxes || [];
}

export function getRadarLookup(metrics = {}) {
  return Object.fromEntries(getRadarAxes(metrics).map((axis) => [axis.key, axis]));
}

export function getMetricLookup(metrics = {}) {
  return Object.fromEntries((metrics.metricBreakdown || []).map((entry) => [entry.key, entry]));
}

export function getPriorityMetricEntries(metrics = {}, limit = 5) {
  const uniqueEntries = new Map();

  [...(metrics.metricBreakdown || [])]
    .filter((entry) => Number.isFinite(entry?.normalizedScore) && !entry?.missing)
    .sort((left, right) => right.weight - left.weight || right.percentile - left.percentile)
    .forEach((entry) => {
      if (!uniqueEntries.has(entry.key)) {
        uniqueEntries.set(entry.key, entry);
      }
    });

  return [...uniqueEntries.values()].slice(0, limit);
}

export function formatMetricEvidence(entry) {
  if (!entry) {
    return '';
  }

  const percentileLabel = Number.isFinite(entry.percentile) ? formatPercentileLabel(entry.percentile) : '';
  return [entry.label || getReadableMetricLabel(entry.key), percentileLabel].filter(Boolean).join(' / ');
}

export function buildMetricThemeLookup(metrics = {}) {
  const radarLookup = getRadarLookup(metrics);

  return {
    attack: [radarLookup.attack?.label, formatMetricEvidence(metrics.topPositiveContributors?.[0])].filter(Boolean),
    creativity: [radarLookup.creativity?.label, formatMetricEvidence(metrics.topPositiveContributors?.[1])].filter(Boolean),
    possession: [radarLookup.possession?.label, formatMetricEvidence(metrics.topPositiveContributors?.[0])].filter(Boolean),
    defending: [radarLookup.defending?.label, formatMetricEvidence(metrics.topPositiveContributors?.[0])].filter(Boolean),
    progression: [formatMetricEvidence(getPriorityMetricEntries(metrics).find((entry) => entry.key?.includes('progressive')))].filter(Boolean),
    retention: [formatMetricEvidence(getPriorityMetricEntries(metrics).find((entry) => entry.key?.includes('completion') || entry.key?.includes('lost')))].filter(Boolean)
  };
}
