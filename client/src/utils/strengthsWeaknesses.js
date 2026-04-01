import { formatPercentileLabel, toNumber } from './playerMetrics';
import {
  CATEGORY_LABELS,
  clamp,
  getCategoryEntries,
  getComparablePool,
  getConfidenceLabel,
  getPriorityMetricEntries,
  getProfileSpread,
  getRadarAxes,
  percentileFromValues,
  seededPick,
  titleCase
} from './scoutingInsightHelpers';

const POSITIVE_TITLES = {
  attack: ['Direct attacking threat', 'Dangerous attacking profile', 'Reliable attacking output'],
  creativity: ['Elite chance creation', 'High-value creative hub', 'Premium supply profile'],
  possession: ['Strong ball security under pressure', 'Press-resistant build-up option', 'Secure control in possession'],
  defending: ['Reliable defensive platform', 'Aggressive ball-winning', 'Strong defensive floor'],
  progression: ['High-value progressive passer', 'Strong line-breaking progression', 'Reliable progression outlet'],
  final_third_delivery: ['Strong final-third delivery', 'Reliable danger-zone supply', 'Advanced delivery quality'],
  carry_threat: ['Reliable wide carrying threat', 'Direct running threat', 'Strong carry threat'],
  dribbling: ['Dangerous one-v-one threat', 'Reliable dribble separation', 'Direct elimination value'],
  box_presence: ['Dangerous box attacker', 'Strong penalty-area presence', 'Reliable central threat'],
  shot_threat: ['Strong shot threat', 'Repeatable shooting pressure', 'Reliable volume shooter'],
  finishing: ['Reliable finishing touch', 'Efficient finishing profile', 'Clean conversion value'],
  aerial: ['Reliable aerial presence', 'Strong aerial duel profile', 'Clear overhead advantage'],
  ball_winning: ['Aggressive ball-winning', 'Reliable recovery profile', 'Strong possession-winning presence'],
  possession_control: ['Controlled midfield circulation', 'Secure distributor from deeper areas', 'Strong control profile'],
  command: ['Commanding area presence', 'Strong box command', 'Reliable control on crosses'],
  shot_stopping: ['Elite shot stopping', 'High-end shot prevention', 'Reliable save-making']
};

const NEGATIVE_TITLES = {
  attack: ['Low attacking output for role', 'Limited direct threat', 'Attack is not yet a separator'],
  creativity: ['Below-average creative volume', 'Limited final-third influence', 'Chance supply trails peers'],
  possession: ['Loose ball retention', 'Possession security is a concern', 'Control under pressure is limited'],
  defending: ['Limited defensive contribution', 'Passive defensive output', 'Defensive floor is light'],
  progression: ['Limited progression under pressure', 'Progression trails peers', 'Does not move play forward enough'],
  final_third_delivery: ['Limited final-third influence', 'Delivery into danger areas is modest', 'Advanced supply trails peers'],
  carry_threat: ['Limited carrying threat', 'Direct running is not a major weapon', 'Wide carry danger is modest'],
  dribbling: ['One-v-one threat is limited', 'Dribble separation is modest', 'Beats defenders less than top peers'],
  box_presence: ['Low box presence for role', 'Penalty-area influence is modest', 'Central threat is too light'],
  shot_threat: ['Low shot volume', 'Shot pressure is lighter than ideal', 'Does not generate enough attempts'],
  finishing: ['Inconsistent finishing', 'Conversion quality is volatile', 'Finishing remains a watch area'],
  aerial: ['Weak aerial impact', 'Aerial presence is modest', 'Overhead value is limited'],
  ball_winning: ['Passive ball-winning profile', 'Recovery volume is light', 'Defensive regains trail peers'],
  possession_control: ['Circulation is below the role baseline', 'Build-up control is modest', 'Distribution security is limited'],
  command: ['Area command is modest', 'Cross control remains a watch area', 'Presence away from the line is limited'],
  shot_stopping: ['Shot prevention trails peers', 'Save-making is below top peers', 'Shot-stopping needs support']
};

function getThemeKey(entry = {}) {
  const rawKey = String(entry.key || '').toLowerCase();

  if (rawKey.includes('flair')) {
    return 'carry_threat';
  }

  if (rawKey.includes('security') || rawKey.includes('retention') || rawKey.includes('control')) {
    return rawKey.includes('ball_winning') ? 'ball_winning' : 'possession';
  }

  if (rawKey.includes('delivery')) {
    return 'final_third_delivery';
  }

  if (rawKey.includes('carry')) {
    return 'carry_threat';
  }

  if (rawKey.includes('work_rate')) {
    return 'defending';
  }

  if (rawKey.includes('positioning')) {
    return 'defending';
  }

  if (rawKey.includes('link_play')) {
    return 'possession';
  }

  if (rawKey.includes('passing_range')) {
    return 'progression';
  }

  if (rawKey.includes('distribution')) {
    return 'possession_control';
  }

  return rawKey || 'possession';
}

function getSeverity(value, positive = true) {
  if (positive) {
    if (value >= 90) return 'elite';
    if (value >= 78) return 'strong';
    return 'solid';
  }

  if (value <= 12) return 'major';
  if (value <= 28) return 'clear';
  return 'watch';
}

function buildTitle(themeKey, positive, seed) {
  const variantSet = positive ? POSITIVE_TITLES[themeKey] : NEGATIVE_TITLES[themeKey];
  const fallback = positive ? `Strong ${titleCase(themeKey)}` : `Limited ${titleCase(themeKey)}`;
  return seededPick(`${seed}-${themeKey}-${positive ? 'pos' : 'neg'}`, variantSet || [], fallback);
}

function buildPositiveExplanation(themeKey, percentile, poolLabel, evidence = '', roleLabel = 'profile') {
  const evidenceText = evidence ? ` Backed by ${evidence.toLowerCase()}.` : '';
  return `${formatPercentileLabel(percentile)} against ${poolLabel}, giving the ${roleLabel.toLowerCase()} profile clear value in ${titleCase(themeKey).toLowerCase()}.${evidenceText}`;
}

function buildNegativeExplanation(themeKey, percentile, poolLabel, evidence = '', roleLabel = 'profile') {
  const evidenceText = evidence ? ` The supporting evidence is softer in ${evidence.toLowerCase()}.` : '';
  return `${formatPercentileLabel(percentile)} against ${poolLabel}, which keeps the ${roleLabel.toLowerCase()} profile from being more complete in ${titleCase(themeKey).toLowerCase()}.${evidenceText}`;
}

function buildCategorySignals(metrics, poolContext) {
  return getCategoryEntries(metrics).map((entry) => {
    const values = poolContext.pool.map((candidateMetrics) => toNumber(candidateMetrics[`${entry.key}Score`]));
    const percentile = percentileFromValues(values, entry.value);
    const signalStrength = Math.round(0.65 * percentile + 0.35 * entry.value);

    return {
      key: `category-${entry.key}`,
      themeKey: entry.key,
      label: CATEGORY_LABELS[entry.key],
      percentile,
      value: entry.value,
      score: signalStrength
    };
  });
}

function buildRadarSignals(metrics) {
  return getRadarAxes(metrics).map((axis) => ({
    key: `axis-${axis.key}`,
    themeKey: getThemeKey(axis),
    label: axis.label,
    percentile: axis.value,
    value: axis.value,
    score: axis.value
  }));
}

function buildMetricEvidence(metrics, positive = true) {
  const metricEntries = positive ? metrics.topPositiveContributors || [] : metrics.topNegativeContributors || [];
  const backupEntries = getPriorityMetricEntries(metrics, 3);
  const source = metricEntries.length ? metricEntries : backupEntries;

  return source
    .slice(0, 2)
    .map((entry) => entry?.label)
    .filter(Boolean)
    .join(' and ');
}

function pickSignals(signals = [], positive = true, limit = 4) {
  const filtered = signals.filter((signal) => (positive ? signal.percentile >= 70 || signal.value >= 72 : signal.percentile <= 36 || signal.value <= 45));
  const bestByTheme = new Map();

  filtered
    .sort((left, right) => (positive ? right.score - left.score : left.score - right.score))
    .forEach((signal) => {
      if (!bestByTheme.has(signal.themeKey)) {
        bestByTheme.set(signal.themeKey, signal);
      }
    });

  const ordered = [...bestByTheme.values()].sort((left, right) => (positive ? right.score - left.score : left.score - right.score));
  return ordered.slice(0, limit);
}

export function buildStrengthsWeaknessesProfile(player, metrics, players = [], ratingIndex = {}) {
  const seed = `${player?.player || ''}-${metrics?.playerArchetype || ''}-${metrics?.primaryTacticalRole || ''}`;
  const roleLabel = metrics?.primaryTacticalRoleLabel || metrics?.exactPosition || 'Profile';
  const poolContext = getComparablePool(player, metrics, players, ratingIndex, { minLeagueExact: 5, minDatasetExact: 8, minLeagueModel: 8 });
  const signals = [...buildCategorySignals(metrics, poolContext), ...buildRadarSignals(metrics)];
  const positiveEvidence = buildMetricEvidence(metrics, true);
  const negativeEvidence = buildMetricEvidence(metrics, false);
  const strengths = pickSignals(signals, true, 5).map((signal, index) => ({
    key: `${signal.key}-${index}`,
    title: buildTitle(signal.themeKey, true, seed),
    explanation: buildPositiveExplanation(signal.themeKey, signal.percentile, poolContext.poolLabel, positiveEvidence, roleLabel),
    severity: getSeverity(signal.percentile, true)
  }));
  const weaknesses = pickSignals(signals, false, 4).map((signal, index) => ({
    key: `${signal.key}-${index}`,
    title: buildTitle(signal.themeKey, false, seed),
    explanation: buildNegativeExplanation(signal.themeKey, signal.percentile, poolContext.poolLabel, negativeEvidence, roleLabel),
    severity: getSeverity(signal.percentile, false)
  }));
  const developmentAreas = [...signals]
    .filter((signal) => signal.percentile > 36 && signal.percentile < 55)
    .sort((left, right) => left.percentile - right.percentile)
    .slice(0, 2)
    .map((signal, index) => ({
      key: `development-${signal.key}-${index}`,
      title: `Development area: ${titleCase(signal.label)}`,
      explanation: `${titleCase(signal.label)} sits in a workable band, but lifting it would make the overall profile more complete.`
    }));
  const profileSpread = getProfileSpread(metrics);
  const profileShape = profileSpread <= 12 ? 'Well Rounded' : profileSpread >= 26 ? 'Specialist' : 'Skewed';
  const confidence = getConfidenceLabel(metrics);
  const fallbackStrength = {
    key: 'fallback-strength',
    title: buildTitle('possession', true, seed),
    explanation: `${roleLabel} profile remains playable thanks to stable core category scores and enough evidence to avoid a flat evaluation.`,
    severity: 'solid'
  };
  const fallbackWeakness = {
    key: 'fallback-weakness',
    title: buildTitle('defending', false, seed),
    explanation: `There is no single collapse point, but the profile still has softer areas that keep it from looking fully complete.`,
    severity: 'watch'
  };

  return {
    profileShape,
    confidence,
    poolLabel: poolContext.poolLabel,
    strengths: strengths.length ? strengths : [fallbackStrength],
    weaknesses: weaknesses.length ? weaknesses : [fallbackWeakness],
    developmentAreas,
    summary: `${profileShape} ${roleLabel.toLowerCase()} profile with ${confidence.toLowerCase()} and evidence drawn from ${poolContext.poolLabel}.`
  };
}
