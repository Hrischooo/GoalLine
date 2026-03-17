import { normalizeString } from './search';

export function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundScore(value) {
  return Math.round(clamp(value, 1, 99));
}

function getInitials(name) {
  if (!name) {
    return 'GL';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getRatingLookupKey(player) {
  return normalizeString([player?.player, player?.squad, player?.league || player?.comp, player?.season].filter(Boolean).join(' '));
}

export function formatTextValue(value, fallback = '-') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return String(value);
}

export function formatStatValue(value, fallback = '-') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  if (Number.isInteger(numericValue)) {
    return String(numericValue);
  }

  if (Math.abs(numericValue) >= 10) {
    return numericValue.toFixed(1).replace(/\.0$/, '');
  }

  return numericValue.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

const EXACT_POSITION_GROUPS = {
  striker: 'striker',
  winger: 'winger',
  attackingMidfielder: 'attacking_midfielder',
  centralMidfielder: 'central_midfielder',
  defensiveMidfielder: 'defensive_midfielder',
  centreBack: 'centre_back',
  fullBack: 'full_back',
  goalkeeper: 'goalkeeper'
};

const EXACT_POSITION_ALIASES = {
  AM: 'CAM'
};

const EXACT_POSITION_TO_GROUP = {
  ST: EXACT_POSITION_GROUPS.striker,
  CF: EXACT_POSITION_GROUPS.striker,
  LW: EXACT_POSITION_GROUPS.winger,
  RW: EXACT_POSITION_GROUPS.winger,
  CAM: EXACT_POSITION_GROUPS.attackingMidfielder,
  CM: EXACT_POSITION_GROUPS.centralMidfielder,
  DM: EXACT_POSITION_GROUPS.defensiveMidfielder,
  CB: EXACT_POSITION_GROUPS.centreBack,
  LB: EXACT_POSITION_GROUPS.fullBack,
  RB: EXACT_POSITION_GROUPS.fullBack,
  LWB: EXACT_POSITION_GROUPS.fullBack,
  RWB: EXACT_POSITION_GROUPS.fullBack,
  GK: EXACT_POSITION_GROUPS.goalkeeper
};

const POSITION_FALLBACKS = {
  ST: new Set(['CF']),
  CF: new Set(['ST']),
  LW: new Set(['RW', 'CAM', 'ST']),
  RW: new Set(['LW', 'CAM', 'ST']),
  CAM: new Set(['CM', 'LW', 'RW']),
  CM: new Set(['DM', 'CAM']),
  DM: new Set(['CM']),
  LB: new Set(['LWB', 'CB']),
  RB: new Set(['RWB', 'CB']),
  LWB: new Set(['LB']),
  RWB: new Set(['RB']),
  CB: new Set(['LB', 'RB', 'LWB', 'RWB']),
  GK: new Set()
};

const INVERSE_METRICS = new Set(['errors_made', 'goals_against_p90', 'times_tackled_during_take_on']);

const EXACT_POSITION_OVR_FORMULAS = {
  [EXACT_POSITION_GROUPS.striker]: [
    ['goals_p90', 0.18],
    ['expected_goals', 0.16],
    ['shots_p90', 0.13],
    ['shots_on_target_pct', 0.08],
    ['carries_penalty_area', 0.08],
    ['progressive_carries', 0.08],
    ['shot_creating_actions_p90', 0.12],
    ['key_passes', 0.07],
    ['assists_p90', 0.05],
    ['progressive_passes', 0.03],
    ['pass_completion_pct', 0.05],
    ['aerial_duels_won_pct', 0.05]
  ],
  [EXACT_POSITION_GROUPS.winger]: [
    ['goals_p90', 0.11],
    ['expected_goals', 0.07],
    ['assists_p90', 0.12],
    ['key_passes', 0.14],
    ['shot_creating_actions_p90', 0.16],
    ['progressive_carries', 0.14],
    ['progressive_passes', 0.06],
    ['carries_final_3rd', 0.08],
    ['carries_penalty_area', 0.07],
    ['take_ons_attempted', 0.04],
    ['successful_take_ons_pct', 0.06],
    ['times_tackled_during_take_on', 0.05, true]
  ],
  [EXACT_POSITION_GROUPS.attackingMidfielder]: [
    ['key_passes', 0.18],
    ['assists_p90', 0.14],
    ['shot_creating_actions_p90', 0.18],
    ['progressive_passes', 0.16],
    ['passes_into_penalty_area', 0.1],
    ['progressive_carries', 0.08],
    ['goals_p90', 0.08],
    ['expected_goals', 0.04],
    ['pass_completion_pct', 0.04]
  ],
  [EXACT_POSITION_GROUPS.centralMidfielder]: [
    ['passes_attempted', 0.14],
    ['pass_completion_pct', 0.12],
    ['progressive_passes', 0.14],
    ['progressive_carries', 0.12],
    ['key_passes', 0.1],
    ['shot_creating_actions_p90', 0.1],
    ['tackles_won', 0.1],
    ['interceptions', 0.09],
    ['assists_p90', 0.05],
    ['goals_p90', 0.04]
  ],
  [EXACT_POSITION_GROUPS.defensiveMidfielder]: [
    ['passes_attempted', 0.14],
    ['pass_completion_pct', 0.14],
    ['progressive_passes', 0.12],
    ['tackles_won', 0.14],
    ['tackles_attempted', 0.12],
    ['interceptions', 0.14],
    ['passes_blocked', 0.08],
    ['shots_blocked', 0.06],
    ['progressive_carries', 0.04],
    ['key_passes', 0.02]
  ],
  [EXACT_POSITION_GROUPS.centreBack]: [
    ['tackles_won', 0.1],
    ['tackles_attempted', 0.08],
    ['interceptions', 0.14],
    ['clearances', 0.15],
    ['passes_blocked', 0.09],
    ['shots_blocked', 0.08],
    ['aerial_duels_won_pct', 0.14],
    ['passes_attempted', 0.08],
    ['pass_completion_pct', 0.07],
    ['progressive_passes', 0.07],
    ['errors_made', 0.05, true]
  ],
  [EXACT_POSITION_GROUPS.fullBack]: [
    ['tackles_won', 0.11],
    ['interceptions', 0.11],
    ['progressive_passes', 0.14],
    ['progressive_carries', 0.14],
    ['key_passes', 0.1],
    ['assists_p90', 0.08],
    ['carries_final_3rd', 0.1],
    ['pass_completion_pct', 0.08],
    ['passes_attempted', 0.05],
    ['take_ons_attempted', 0.04],
    ['successful_take_ons_pct', 0.03],
    ['times_tackled_during_take_on', 0.02, true]
  ],
  [EXACT_POSITION_GROUPS.goalkeeper]: [
    ['saves_pct', 0.28],
    ['goals_against_p90', 0.24, true],
    ['clean_sheets_pct', 0.18],
    ['clean_sheets', 0.12],
    ['saves', 0.1],
    ['crosses_stopped', 0.05],
    ['pass_completion_pct', 0.03]
  ]
};

const TACTICAL_ROLE_FORMULAS = {
  [EXACT_POSITION_GROUPS.defensiveMidfielder]: {
    Anchor: [
      ['interceptions', 0.24],
      ['tackles_won', 0.18],
      ['tackles_attempted', 0.14],
      ['pass_completion_pct', 0.16],
      ['passes_attempted', 0.14],
      ['passes_blocked', 0.08],
      ['shots_blocked', 0.06]
    ],
    DeepLyingPlaymaker: [
      ['progressive_passes', 0.26],
      ['passes_attempted', 0.2],
      ['pass_completion_pct', 0.18],
      ['key_passes', 0.14],
      ['shot_creating_actions_p90', 0.12],
      ['progressive_carries', 0.1]
    ],
    BallWinningMidfielder: [
      ['tackles_won', 0.3],
      ['tackles_attempted', 0.24],
      ['interceptions', 0.22],
      ['passes_blocked', 0.14],
      ['shots_blocked', 0.1]
    ]
  },
  [EXACT_POSITION_GROUPS.centralMidfielder]: {
    BoxToBox: [
      ['progressive_carries', 0.2],
      ['progressive_passes', 0.18],
      ['tackles_won', 0.18],
      ['interceptions', 0.14],
      ['shot_creating_actions_p90', 0.18],
      ['goals_p90', 0.12]
    ],
    CentralPlaymaker: [
      ['passes_attempted', 0.2],
      ['pass_completion_pct', 0.18],
      ['progressive_passes', 0.2],
      ['key_passes', 0.16],
      ['assists_p90', 0.1],
      ['shot_creating_actions_p90', 0.16]
    ],
    SupportCM: [
      ['passes_attempted', 0.18],
      ['pass_completion_pct', 0.16],
      ['progressive_carries', 0.18],
      ['tackles_won', 0.16],
      ['interceptions', 0.16],
      ['shot_creating_actions_p90', 0.16]
    ]
  },
  [EXACT_POSITION_GROUPS.attackingMidfielder]: {
    AdvancedPlaymaker: [
      ['key_passes', 0.24],
      ['assists_p90', 0.18],
      ['shot_creating_actions_p90', 0.22],
      ['progressive_passes', 0.16],
      ['passes_into_penalty_area', 0.12],
      ['goals_p90', 0.08]
    ],
    ShadowStriker: [
      ['goals_p90', 0.24],
      ['expected_goals', 0.22],
      ['shots_p90', 0.18],
      ['carries_penalty_area', 0.18],
      ['shot_creating_actions_p90', 0.18]
    ],
    Creative10: [
      ['key_passes', 0.24],
      ['progressive_passes', 0.2],
      ['assists_p90', 0.16],
      ['shot_creating_actions_p90', 0.24],
      ['pass_completion_pct', 0.16]
    ]
  },
  [EXACT_POSITION_GROUPS.striker]: {
    Poacher: [
      ['goals_p90', 0.28],
      ['expected_goals', 0.24],
      ['shots_p90', 0.2],
      ['shots_on_target_pct', 0.14],
      ['carries_penalty_area', 0.14]
    ],
    AdvancedForward: [
      ['goals_p90', 0.22],
      ['expected_goals', 0.2],
      ['shots_p90', 0.16],
      ['progressive_carries', 0.14],
      ['carries_penalty_area', 0.14],
      ['shot_creating_actions_p90', 0.14]
    ],
    DeepLyingForward: [
      ['key_passes', 0.2],
      ['assists_p90', 0.14],
      ['pass_completion_pct', 0.18],
      ['shot_creating_actions_p90', 0.2],
      ['progressive_passes', 0.18],
      ['expected_goals', 0.1]
    ],
    TargetForward: [
      ['aerial_duels_won_pct', 0.3],
      ['goals_p90', 0.22],
      ['expected_goals', 0.18],
      ['shots_p90', 0.16],
      ['key_passes', 0.14]
    ]
  },
  [EXACT_POSITION_GROUPS.winger]: {
    InsideForward: [
      ['goals_p90', 0.22],
      ['expected_goals', 0.18],
      ['shots_p90', 0.14],
      ['progressive_carries', 0.18],
      ['carries_penalty_area', 0.14],
      ['shot_creating_actions_p90', 0.14]
    ],
    Winger: [
      ['assists_p90', 0.16],
      ['key_passes', 0.18],
      ['shot_creating_actions_p90', 0.2],
      ['progressive_carries', 0.18],
      ['take_ons_attempted', 0.12],
      ['successful_take_ons_pct', 0.16]
    ],
    WidePlaymaker: [
      ['key_passes', 0.22],
      ['assists_p90', 0.16],
      ['progressive_passes', 0.2],
      ['shot_creating_actions_p90', 0.24],
      ['pass_completion_pct', 0.18]
    ]
  },
  [EXACT_POSITION_GROUPS.centreBack]: {
    BallPlayingDefender: [
      ['progressive_passes', 0.24],
      ['passes_attempted', 0.22],
      ['pass_completion_pct', 0.18],
      ['interceptions', 0.18],
      ['aerial_duels_won_pct', 0.18]
    ],
    Stopper: [
      ['tackles_won', 0.22],
      ['tackles_attempted', 0.18],
      ['interceptions', 0.22],
      ['shots_blocked', 0.18],
      ['aerial_duels_won_pct', 0.2]
    ],
    NoNonsenseDefender: [
      ['clearances', 0.26],
      ['shots_blocked', 0.2],
      ['passes_blocked', 0.18],
      ['aerial_duels_won_pct', 0.22],
      ['errors_made', 0.14, true]
    ]
  },
  [EXACT_POSITION_GROUPS.fullBack]: {
    FullBack: [
      ['tackles_won', 0.16],
      ['interceptions', 0.14],
      ['progressive_passes', 0.16],
      ['progressive_carries', 0.14],
      ['key_passes', 0.12],
      ['pass_completion_pct', 0.14],
      ['assists_p90', 0.14]
    ],
    WingBack: [
      ['progressive_carries', 0.2],
      ['carries_final_3rd', 0.16],
      ['key_passes', 0.16],
      ['assists_p90', 0.14],
      ['progressive_passes', 0.12],
      ['take_ons_attempted', 0.1],
      ['successful_take_ons_pct', 0.12]
    ],
    DefensiveFullBack: [
      ['tackles_won', 0.22],
      ['interceptions', 0.18],
      ['pass_completion_pct', 0.16],
      ['passes_attempted', 0.14],
      ['passes_blocked', 0.12],
      ['shots_blocked', 0.1],
      ['progressive_passes', 0.08]
    ]
  }
};

const TACTICAL_ROLE_LABELS = {
  Anchor: 'Anchor',
  DeepLyingPlaymaker: 'Deep-Lying Playmaker',
  BallWinningMidfielder: 'Ball-Winning Midfielder',
  BoxToBox: 'Box-to-Box Midfielder',
  CentralPlaymaker: 'Central Playmaker',
  SupportCM: 'Support Midfielder',
  AdvancedPlaymaker: 'Advanced Playmaker',
  ShadowStriker: 'Shadow Striker',
  Creative10: 'Creative No. 10',
  Poacher: 'Poacher',
  AdvancedForward: 'Advanced Forward',
  DeepLyingForward: 'Deep-Lying Forward',
  TargetForward: 'Target Forward',
  InsideForward: 'Inside Forward',
  Winger: 'Winger',
  WidePlaymaker: 'Wide Playmaker',
  BallPlayingDefender: 'Ball-Playing Defender',
  Stopper: 'Stopper',
  NoNonsenseDefender: 'No-Nonsense Defender',
  FullBack: 'Full-Back',
  WingBack: 'Wing-Back',
  DefensiveFullBack: 'Defensive Full-Back',
  Goalkeeper: 'Goalkeeper'
};

const CATEGORY_METRICS = {
  attack: ['goals_p90', 'expected_goals', 'shots_p90', 'shots_on_target_pct', 'goals_per_shot'],
  creativity: ['assists_p90', 'key_passes', 'shot_creating_actions_p90', 'progressive_passes', 'progressive_carries'],
  possession: ['passes_attempted', 'passes_completed', 'pass_completion_pct', 'progressive_passes', 'progressive_carries'],
  defending: ['tackles_won', 'tackles_attempted', 'interceptions', 'clearances', 'aerial_duels_won_pct']
};

const GOALKEEPER_DEFENDING_METRICS = ['saves_pct', 'goals_against_p90', 'clean_sheets_pct', 'clean_sheets', 'crosses_stopped'];
const DEBUG_SAMPLE_PLAYERS = [
  'Son Heung-min',
  'Martin Zubimendi',
  'Bruno Guimar\u00E3es',
  'Harry Kane',
  'Ollie Watkins',
  'Gabriel Jesus',
  'Mohamed Salah'
];

function normalizeExactPosition(position) {
  const normalized = String(position || '').trim().toUpperCase();
  return EXACT_POSITION_ALIASES[normalized] || normalized;
}

function parseListedPositions(player) {
  return String(player?.pos || '')
    .split(/[\/,;]+/)
    .map((part) => normalizeExactPosition(part))
    .filter(Boolean)
    .filter((position, index, positions) => positions.indexOf(position) === index);
}

function resolveSecondaryPositionGroupCandidate(listedPositions) {
  if (listedPositions.length < 2) {
    return null;
  }

  const primaryPosition = listedPositions[0];
  const compatiblePositions = POSITION_FALLBACKS[primaryPosition] || new Set();
  const primaryGroup = EXACT_POSITION_TO_GROUP[primaryPosition];

  for (const secondaryPosition of listedPositions.slice(1)) {
    if (!compatiblePositions.has(secondaryPosition)) {
      continue;
    }

    const secondaryGroup = EXACT_POSITION_TO_GROUP[secondaryPosition];

    if (secondaryGroup && secondaryGroup !== primaryGroup) {
      return secondaryGroup;
    }
  }

  return null;
}

function getPositionContext(player) {
  const listedPositions = parseListedPositions(player);
  const exactPosition = listedPositions[0] || 'CM';
  const exactPositionGroup = EXACT_POSITION_TO_GROUP[exactPosition] || EXACT_POSITION_GROUPS.centralMidfielder;

  return {
    listedPositions,
    exactPosition,
    exactPositionGroup,
    secondaryPositionGroupCandidate: resolveSecondaryPositionGroupCandidate(listedPositions)
  };
}

export function resolveExactPositionGroup(player) {
  return getPositionContext(player).exactPositionGroup;
}

export function resolvePositionGroup(player) {
  return resolveExactPositionGroup(player);
}

export function getPercentile(sortedValues, rawValue) {
  if (!sortedValues.length) {
    return 0;
  }

  if (sortedValues.length === 1) {
    return rawValue === null || rawValue === undefined || rawValue === '' ? 0 : 50;
  }

  const numericValue = toNumber(rawValue);
  let below = 0;
  let equal = 0;

  for (const value of sortedValues) {
    if (value < numericValue) {
      below += 1;
    } else if (value === numericValue) {
      equal += 1;
    }
  }

  return ((below + equal * 0.5) / sortedValues.length) * 100;
}

export function getInversePercentile(sortedValues, rawValue) {
  return 100 - getPercentile(sortedValues, rawValue);
}

export function percentileCalculator(sortedValues, value) {
  return getPercentile(sortedValues, value);
}

export function inversePercentileCalculator(sortedValues, value) {
  return getInversePercentile(sortedValues, value);
}

function getMetricKeysForGroup(positionGroup) {
  const metricKeys = new Set([
    ...(EXACT_POSITION_OVR_FORMULAS[positionGroup] || []).map(([metricKey]) => metricKey),
    ...CATEGORY_METRICS.attack,
    ...CATEGORY_METRICS.creativity,
    ...CATEGORY_METRICS.possession,
    ...CATEGORY_METRICS.defending,
    ...GOALKEEPER_DEFENDING_METRICS
  ]);

  const roleFormulas = TACTICAL_ROLE_FORMULAS[positionGroup] || {};

  for (const roleMetrics of Object.values(roleFormulas)) {
    for (const [metricKey] of roleMetrics) {
      metricKeys.add(metricKey);
    }
  }

  return [...metricKeys];
}

function buildGroupMetricLookup(players) {
  const lookup = {};

  for (const positionGroup of Object.values(EXACT_POSITION_GROUPS)) {
    lookup[positionGroup] = {
      players: [],
      metrics: {}
    };
  }

  for (const player of players) {
    const { exactPositionGroup } = getPositionContext(player);
    lookup[exactPositionGroup].players.push(player);
  }

  for (const [positionGroup, config] of Object.entries(lookup)) {
    for (const metricKey of getMetricKeysForGroup(positionGroup)) {
      config.metrics[metricKey] = config.players.map((player) => toNumber(player[metricKey])).sort((left, right) => left - right);
    }
  }

  return lookup;
}

function getMetricPercentile(groupLookup, positionGroup, player, metricKey, invert = false) {
  const sortedValues = groupLookup[positionGroup]?.metrics?.[metricKey] || [];
  return invert ? getInversePercentile(sortedValues, player?.[metricKey]) : getPercentile(sortedValues, player?.[metricKey]);
}

function calculateWeightedPercentile(metricWeights, player, groupLookup, positionGroup) {
  let weightedTotal = 0;
  let appliedWeight = 0;

  for (const [metricKey, weight, invert = INVERSE_METRICS.has(metricKey)] of metricWeights) {
    const percentileScore = getMetricPercentile(groupLookup, positionGroup, player, metricKey, invert);

    if (!Number.isFinite(percentileScore)) {
      continue;
    }

    weightedTotal += percentileScore * weight;
    appliedWeight += weight;
  }

  if (!appliedWeight) {
    return 50;
  }

  return weightedTotal / appliedWeight;
}

function getAveragedPercentile(groupLookup, positionGroup, player, metricKeys, inverseMetricKeys = new Set()) {
  const availableScores = metricKeys
    .map((metricKey) => getMetricPercentile(groupLookup, positionGroup, player, metricKey, inverseMetricKeys.has(metricKey)))
    .filter((score) => Number.isFinite(score));

  if (!availableScores.length) {
    return 50;
  }

  return availableScores.reduce((total, score) => total + score, 0) / availableScores.length;
}

export function calculateExactPositionOVR(player, groupLookup, positionGroup = resolveExactPositionGroup(player)) {
  const formula = EXACT_POSITION_OVR_FORMULAS[positionGroup] || EXACT_POSITION_OVR_FORMULAS[EXACT_POSITION_GROUPS.centralMidfielder];
  const weightedPercentileScore = Number(calculateWeightedPercentile(formula, player, groupLookup, positionGroup).toFixed(2));
  const exactPositionOVR = roundScore(28 + 0.67 * weightedPercentileScore);

  return {
    exactPositionOVR,
    weightedPercentileScore
  };
}

export function calculateTacticalRoleScores(player, groupLookup, positionGroup = resolveExactPositionGroup(player)) {
  const roleFormulas = TACTICAL_ROLE_FORMULAS[positionGroup];

  if (!roleFormulas) {
    const { weightedPercentileScore } = calculateExactPositionOVR(player, groupLookup, positionGroup);
    return {
      Goalkeeper: Number(weightedPercentileScore.toFixed(2))
    };
  }

  return Object.fromEntries(
    Object.entries(roleFormulas).map(([roleKey, metricWeights]) => [
      roleKey,
      Number(calculateWeightedPercentile(metricWeights, player, groupLookup, positionGroup).toFixed(2))
    ])
  );
}

function getRankedRoleScores(tacticalRoleScores = {}) {
  return Object.entries(tacticalRoleScores)
    .map(([key, score]) => ({
      key,
      label: getReadableTacticalRoleLabel(key),
      score: Number(score)
    }))
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));
}

function getTacticalRoleConfidence(tacticalRoleGap, roleCount) {
  if (roleCount < 2) {
    return 'strong';
  }

  if (tacticalRoleGap < 5) {
    return 'hybrid';
  }

  if (tacticalRoleGap <= 10) {
    return 'medium';
  }

  return 'strong';
}

export function mapRoleScoreToOVR(roleScore) {
  return roundScore(30 + 0.65 * clamp(toNumber(roleScore), 0, 100));
}

export function calculateFinalOVR({
  exactPositionOVR,
  primaryRoleScore,
  secondaryRoleScore,
  tacticalRoleConfidence,
  roleCount = 0
}) {
  if (roleCount < 2) {
    return {
      finalOVR: roundScore(exactPositionOVR),
      primaryRoleOVR: mapRoleScoreToOVR(primaryRoleScore),
      secondaryRoleSupport: mapRoleScoreToOVR(secondaryRoleScore)
    };
  }

  let exactWeight = 0.8;
  let primaryWeight = 0.15;
  let secondaryWeight = 0.05;

  if (tacticalRoleConfidence === 'medium') {
    exactWeight = 0.81;
    primaryWeight = 0.12;
    secondaryWeight = 0.07;
  }

  if (tacticalRoleConfidence === 'hybrid') {
    exactWeight = 0.82;
    primaryWeight = 0.1;
    secondaryWeight = 0.08;
  }

  const primaryRoleOVR = mapRoleScoreToOVR(primaryRoleScore);
  const secondaryRoleSupport = mapRoleScoreToOVR(secondaryRoleScore);

  return {
    primaryRoleOVR,
    secondaryRoleSupport,
    finalOVR: roundScore(exactWeight * exactPositionOVR + primaryWeight * primaryRoleOVR + secondaryWeight * secondaryRoleSupport)
  };
}

export function getReadableTacticalRoleLabel(roleKey) {
  if (!roleKey) {
    return '-';
  }

  if (TACTICAL_ROLE_LABELS[roleKey]) {
    return TACTICAL_ROLE_LABELS[roleKey];
  }

  return String(roleKey)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

function buildCategoryScores(positionGroup, player, groupLookup) {
  const inverseDefensiveMetrics =
    positionGroup === EXACT_POSITION_GROUPS.goalkeeper
      ? new Set(['goals_against_p90'])
      : new Set(['errors_made']);

  const attackScore = roundScore(getAveragedPercentile(groupLookup, positionGroup, player, CATEGORY_METRICS.attack));
  const creativityScore = roundScore(getAveragedPercentile(groupLookup, positionGroup, player, CATEGORY_METRICS.creativity));
  const possessionScore = roundScore(getAveragedPercentile(groupLookup, positionGroup, player, CATEGORY_METRICS.possession));
  const defendingScore = roundScore(
    getAveragedPercentile(
      groupLookup,
      positionGroup,
      player,
      positionGroup === EXACT_POSITION_GROUPS.goalkeeper ? GOALKEEPER_DEFENDING_METRICS : CATEGORY_METRICS.defending,
      inverseDefensiveMetrics
    )
  );

  return {
    attackScore,
    creativityScore,
    possessionScore,
    defendingScore
  };
}

export function buildPlayerRatingIndex(players = []) {
  const groupLookup = buildGroupMetricLookup(players);
  const ratingsIndex = {};

  for (const player of players) {
    const uniqueKey = getRatingLookupKey(player);
    const nameKey = normalizeString(player?.player || '');

    if (!uniqueKey) {
      continue;
    }

    const positionContext = getPositionContext(player);
    const { exactPositionOVR, weightedPercentileScore } = calculateExactPositionOVR(
      player,
      groupLookup,
      positionContext.exactPositionGroup
    );
    const tacticalRoleScores = calculateTacticalRoleScores(player, groupLookup, positionContext.exactPositionGroup);
    const rankedRoleScores = getRankedRoleScores(tacticalRoleScores);
    const primaryRole = rankedRoleScores[0] || null;
    const secondaryRole = rankedRoleScores[1] || null;
    const tacticalRoleGap = Number(Math.max((primaryRole?.score || 0) - (secondaryRole?.score || 0), 0).toFixed(2));
    const tacticalRoleConfidence = getTacticalRoleConfidence(tacticalRoleGap, rankedRoleScores.length);
    const { finalOVR, primaryRoleOVR, secondaryRoleSupport } = calculateFinalOVR({
      exactPositionOVR,
      primaryRoleScore: primaryRole?.score || 0,
      secondaryRoleScore: secondaryRole?.score || 0,
      tacticalRoleConfidence,
      roleCount: rankedRoleScores.length
    });
    const categoryScores = buildCategoryScores(positionContext.exactPositionGroup, player, groupLookup);

    const ratingEntry = {
      exactPosition: positionContext.exactPosition,
      exactPositionGroup: positionContext.exactPositionGroup,
      secondaryPositionGroupCandidate: positionContext.secondaryPositionGroupCandidate,
      tacticalRoleScores,
      primaryTacticalRole: primaryRole?.key || null,
      primaryTacticalRoleLabel: primaryRole?.label || '-',
      secondaryTacticalRole: secondaryRole?.key || null,
      secondaryTacticalRoleLabel: secondaryRole?.label || '-',
      tacticalRoleConfidence,
      tacticalRoleGap,
      topTacticalRoles: rankedRoleScores.slice(0, 3),
      exactPositionOVR,
      primaryRoleOVR,
      secondaryRoleSupport,
      weightedPercentileScore,
      finalOVR,
      overall: finalOVR,
      positionGroup: positionContext.exactPositionGroup,
      ...categoryScores
    };

    ratingsIndex[uniqueKey] = ratingEntry;

    if (nameKey && !ratingsIndex[nameKey]) {
      ratingsIndex[nameKey] = ratingEntry;
    }
  }

  for (const playerName of DEBUG_SAMPLE_PLAYERS) {
    const rating = ratingsIndex[playerName.toLowerCase()];

    if (!rating) {
      continue;
    }

    console.debug('[ratings]', playerName, {
      exactPosition: rating.exactPosition,
      exactPositionGroup: rating.exactPositionGroup,
      exactPositionOVR: rating.exactPositionOVR,
      primaryTacticalRole: rating.primaryTacticalRole,
      secondaryTacticalRole: rating.secondaryTacticalRole,
      tacticalRoleConfidence: rating.tacticalRoleConfidence,
      tacticalRoleGap: rating.tacticalRoleGap,
      finalOVR: rating.finalOVR
    });
  }

  return ratingsIndex;
}

export function computeDisplayMetrics(player, ratingIndex = {}) {
  const safePlayer = player || {};
  const rating = ratingIndex[getRatingLookupKey(safePlayer)] || ratingIndex[normalizeString(safePlayer.player || '')];
  const positionContext = getPositionContext(safePlayer);

  if (!rating) {
    return {
      attackScore: 50,
      creativityScore: 50,
      possessionScore: 50,
      defendingScore: 50,
      summaryScore: 50,
      initials: getInitials(safePlayer.player),
      positionGroup: positionContext.exactPositionGroup,
      exactPosition: positionContext.exactPosition,
      exactPositionGroup: positionContext.exactPositionGroup,
      secondaryPositionGroupCandidate: positionContext.secondaryPositionGroupCandidate,
      exactPositionOVR: 50,
      primaryRoleOVR: 50,
      secondaryRoleSupport: 50,
      weightedPercentileScore: 50,
      finalOVR: 50,
      tacticalRoleScores: {},
      topTacticalRoles: [],
      primaryTacticalRole: null,
      primaryTacticalRoleLabel: '-',
      secondaryTacticalRole: null,
      secondaryTacticalRoleLabel: '-',
      tacticalRoleConfidence: '-',
      tacticalRoleGap: 0
    };
  }

  return {
    attackScore: rating.attackScore,
    creativityScore: rating.creativityScore,
    possessionScore: rating.possessionScore,
    defendingScore: rating.defendingScore,
    summaryScore: rating.finalOVR,
    initials: getInitials(safePlayer.player),
    positionGroup: rating.exactPositionGroup,
    exactPosition: rating.exactPosition,
    exactPositionGroup: rating.exactPositionGroup,
    secondaryPositionGroupCandidate: rating.secondaryPositionGroupCandidate,
    exactPositionOVR: rating.exactPositionOVR,
    primaryRoleOVR: rating.primaryRoleOVR,
    secondaryRoleSupport: rating.secondaryRoleSupport,
    weightedPercentileScore: rating.weightedPercentileScore,
    finalOVR: rating.finalOVR,
    tacticalRoleScores: rating.tacticalRoleScores,
    topTacticalRoles: rating.topTacticalRoles,
    primaryTacticalRole: rating.primaryTacticalRole,
    primaryTacticalRoleLabel: rating.primaryTacticalRoleLabel,
    secondaryTacticalRole: rating.secondaryTacticalRole,
    secondaryTacticalRoleLabel: rating.secondaryTacticalRoleLabel,
    tacticalRoleConfidence: rating.tacticalRoleConfidence,
    tacticalRoleGap: rating.tacticalRoleGap
  };
}
