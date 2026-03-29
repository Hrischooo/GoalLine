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

function roundMetricValue(value, digits = 3) {
  return Number(toNumber(value).toFixed(digits));
}

function safeDivide(numerator, denominator, scale = 1) {
  const numericDenominator = toNumber(denominator);

  if (numericDenominator <= 0) {
    return 0;
  }

  return (toNumber(numerator) / numericDenominator) * scale;
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

function getBackendOverallRating(player) {
  const rating = toNumber(player?.overall_rating);
  return rating > 0 ? Math.round(rating) : null;
}

function getBackendRoleTag(player) {
  return player?.role_tag ? String(player.role_tag) : '';
}

function getRatingLookupKey(player) {
  return normalizeString([player?.player, player?.squad, player?.league || player?.comp, player?.season].filter(Boolean).join(' '));
}

function getPlayerLeagueLabel(player) {
  return String(player?.league || player?.comp || 'Unknown League');
}

function getPlayerLeagueKey(player) {
  return normalizeString(getPlayerLeagueLabel(player)).replace(/\s+/g, '_') || 'unknown_league';
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

function formatLabelFromMetricKey(metricKey = '') {
  return String(metricKey)
    .split('_')
    .filter(Boolean)
    .map((part) => {
      if (part === 'pct') {
        return '%';
      }

      if (part === 'p90') {
        return 'P90';
      }

      if (part === 'per30' || part === 'p30') {
        return 'P30';
      }

      if (part === 'np') {
        return 'NP';
      }

      if (part === 'xg') {
        return 'xG';
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

export function getReadableMetricLabel(metricKey) {
  return SCOUTING_METRIC_DEFINITIONS?.[metricKey]?.label || formatLabelFromMetricKey(metricKey);
}

export function formatPercentileLabel(percentile) {
  const roundedPercentile = Math.round(toNumber(percentile));

  if (!roundedPercentile) {
    return '0th percentile';
  }

  const mod10 = roundedPercentile % 10;
  const mod100 = roundedPercentile % 100;
  let suffix = 'th';

  if (mod10 === 1 && mod100 !== 11) {
    suffix = 'st';
  } else if (mod10 === 2 && mod100 !== 12) {
    suffix = 'nd';
  } else if (mod10 === 3 && mod100 !== 13) {
    suffix = 'rd';
  }

  return `${roundedPercentile}${suffix} percentile`;
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

const POSITION_FAMILIES = {
  goalkeeper: 'goalkeeper',
  defender: 'defender',
  midfielder: 'midfielder',
  forward: 'forward'
};

const POSITION_FAMILY_LABELS = {
  [POSITION_FAMILIES.goalkeeper]: 'Goalkeeper',
  [POSITION_FAMILIES.defender]: 'Defender',
  [POSITION_FAMILIES.midfielder]: 'Midfielder',
  [POSITION_FAMILIES.forward]: 'Forward'
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

const EXACT_POSITION_TO_FAMILY = {
  GK: POSITION_FAMILIES.goalkeeper,
  CB: POSITION_FAMILIES.defender,
  LB: POSITION_FAMILIES.defender,
  RB: POSITION_FAMILIES.defender,
  LWB: POSITION_FAMILIES.defender,
  RWB: POSITION_FAMILIES.defender,
  DM: POSITION_FAMILIES.midfielder,
  CM: POSITION_FAMILIES.midfielder,
  CAM: POSITION_FAMILIES.midfielder,
  ST: POSITION_FAMILIES.forward,
  CF: POSITION_FAMILIES.forward,
  LW: POSITION_FAMILIES.forward,
  RW: POSITION_FAMILIES.forward
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

const POSITION_MODEL_KEYS = {
  goalkeeper: 'GK',
  centreBack: 'CB',
  fullBack: 'LB/RB',
  defensiveMidfielder: 'DM',
  centralMidfielder: 'CM',
  attackingMidfielder: 'CAM',
  winger: 'LW/RW',
  striker: 'ST'
};

const EXACT_POSITION_GROUP_TO_MODEL_KEY = {
  [EXACT_POSITION_GROUPS.goalkeeper]: POSITION_MODEL_KEYS.goalkeeper,
  [EXACT_POSITION_GROUPS.centreBack]: POSITION_MODEL_KEYS.centreBack,
  [EXACT_POSITION_GROUPS.fullBack]: POSITION_MODEL_KEYS.fullBack,
  [EXACT_POSITION_GROUPS.defensiveMidfielder]: POSITION_MODEL_KEYS.defensiveMidfielder,
  [EXACT_POSITION_GROUPS.centralMidfielder]: POSITION_MODEL_KEYS.centralMidfielder,
  [EXACT_POSITION_GROUPS.attackingMidfielder]: POSITION_MODEL_KEYS.attackingMidfielder,
  [EXACT_POSITION_GROUPS.winger]: POSITION_MODEL_KEYS.winger,
  [EXACT_POSITION_GROUPS.striker]: POSITION_MODEL_KEYS.striker
};

const EXACT_POSITION_TO_MODEL_KEY = {
  GK: POSITION_MODEL_KEYS.goalkeeper,
  CB: POSITION_MODEL_KEYS.centreBack,
  LB: POSITION_MODEL_KEYS.fullBack,
  RB: POSITION_MODEL_KEYS.fullBack,
  LWB: POSITION_MODEL_KEYS.fullBack,
  RWB: POSITION_MODEL_KEYS.fullBack,
  DM: POSITION_MODEL_KEYS.defensiveMidfielder,
  CM: POSITION_MODEL_KEYS.centralMidfielder,
  CAM: POSITION_MODEL_KEYS.attackingMidfielder,
  LW: POSITION_MODEL_KEYS.winger,
  RW: POSITION_MODEL_KEYS.winger,
  ST: POSITION_MODEL_KEYS.striker,
  CF: POSITION_MODEL_KEYS.striker
};

const INVERSE_METRICS = new Set([
  'errors_made',
  'errors_made_per30',
  'goals_against_p90',
  'goals_against_per30',
  'possessions_lost_per30',
  'times_tackled_during_take_on',
  'times_tackled_during_take_on_per30'
]);

const VOLUME_METRIC_KEYS = new Set([
  'assists',
  'assists_per30',
  'blocks_per30',
  'carries_into_final_third_per30',
  'carries_into_penalty_area_per30',
  'carries_penalty_area',
  'carries_final_3rd',
  'clean_sheets',
  'crosses_stopped',
  'crosses_stopped_per30',
  'errors_made',
  'errors_made_per30',
  'expected_goals',
  'goals',
  'goals_against',
  'goals_against_per30',
  'goals_p90',
  'goals_per30',
  'goal_creating_actions_per30',
  'interceptions',
  'interceptions_per30',
  'key_passes',
  'key_passes_per30',
  'non_penalty_goals',
  'np_goals_per30',
  'passes_attempted',
  'passes_attempted_per30',
  'passes_blocked',
  'passes_blocked_per30',
  'passes_completed',
  'passes_completed_per30',
  'passes_into_final_third',
  'passes_into_final_third_per30',
  'passes_into_penalty_area',
  'passes_into_penalty_area_per30',
  'possessions_lost',
  'possessions_lost_per30',
  'progressive_carries',
  'progressive_carries_per30',
  'progressive_passes',
  'progressive_passes_per30',
  'saves',
  'saves_per30',
  'shot_creating_actions_per30',
  'shots_blocked',
  'shots_blocked_per30',
  'shots_p90',
  'shots_per30',
  'successful_take_ons_per30',
  'take_ons_attempted',
  'take_on_attempts_per30',
  'tackles_attempted',
  'tackles_attempted_per30',
  'tackles_won',
  'tackles_won_per30',
  'times_tackled_during_take_on_per30',
  'total_shots'
]);

const MINIMUM_NORMALIZATION_POOL_SIZE = 8;
const FRONTEND_OVR_MINIMUM_METRICS = 4;
const RELIABILITY_TARGET_MATCHES = 20;
const OVR_MINIMUM_SCORE = 42;
const OVR_SCORE_SPAN = 57;

const RELIABILITY_MINUTES_TABLE = [
  { max: 299, modifier: 0.55, label: 'Low' },
  { max: 599, modifier: 0.68, label: 'Low' },
  { max: 899, modifier: 0.78, label: 'Medium' },
  { max: 1499, modifier: 0.87, label: 'Medium' },
  { max: 2299, modifier: 0.94, label: 'High' },
  { max: Number.POSITIVE_INFINITY, modifier: 1, label: 'High' }
];

const OVR_POSITION_MODELS = {
  [POSITION_MODEL_KEYS.goalkeeper]: {
    label: 'GK',
    categories: [
      {
        key: 'shot_stopping',
        label: 'Shot Stopping',
        weight: 0.4,
        metrics: [
          { key: 'saves_pct', weight: 0.45 },
          { key: 'saves_per30', weight: 0.25 },
          { key: 'goals_against_per30', weight: 0.15, invert: true },
          { key: 'clean_sheets_pct', weight: 0.15 }
        ]
      },
      {
        key: 'prevention_command',
        label: 'Prevention / Command',
        weight: 0.2,
        metrics: [
          { key: 'clean_sheets_pct', weight: 0.35 },
          { key: 'crosses_stopped_per30', weight: 0.35 },
          { key: 'goals_against_per30', weight: 0.3, invert: true }
        ]
      },
      {
        key: 'distribution',
        label: 'Distribution',
        weight: 0.15,
        metrics: [
          { key: 'pass_completion_pct', weight: 0.55 },
          { key: 'progressive_passes_per30', weight: 0.45 }
        ]
      },
      {
        key: 'error_avoidance',
        label: 'Error Avoidance',
        weight: 0.25,
        metrics: [
          { key: 'errors_made_per30', weight: 0.6, invert: true },
          { key: 'possessions_lost_per30', weight: 0.4, invert: true }
        ]
      }
    ]
  },
  [POSITION_MODEL_KEYS.centreBack]: {
    label: 'CB',
    categories: [
      {
        key: 'defensive_reading',
        label: 'Defensive Reading',
        weight: 0.12,
        metrics: [
          { key: 'interceptions_per30', weight: 0.65 },
          { key: 'blocks_per30', weight: 0.15 },
          { key: 'clearances_per30', weight: 0.2 }
        ]
      },
      {
        key: 'duel_defending',
        label: 'Duel Defending',
        weight: 0.22,
        metrics: [
          { key: 'tackles_won_per30', weight: 0.52 },
          { key: 'tackle_success_pct', weight: 0.48 }
        ]
      },
      {
        key: 'aerial_ability',
        label: 'Aerial Ability',
        weight: 0.18,
        metrics: [
          { key: 'aerial_duel_win_pct', weight: 0.68 },
          { key: 'clearances_per30', weight: 0.32 }
        ]
      },
      {
        key: 'ball_security',
        label: 'Ball Security',
        weight: 0.22,
        metrics: [
          { key: 'pass_completion_pct', weight: 0.58 },
          { key: 'possessions_lost_per30', weight: 0.42, invert: true }
        ]
      },
      {
        key: 'progression',
        label: 'Progression',
        weight: 0.22,
        metrics: [
          { key: 'progressive_passes_per30', weight: 0.6 },
          { key: 'passes_into_final_third_per30', weight: 0.4 }
        ]
      },
      {
        key: 'error_avoidance',
        label: 'Error Avoidance',
        weight: 0.04,
        metrics: [
          { key: 'errors_made_per30', weight: 0.7, invert: true },
          { key: 'possessions_lost_per30', weight: 0.3, invert: true }
        ]
      }
    ]
  },
  [POSITION_MODEL_KEYS.fullBack]: {
    label: 'LB/RB',
    categories: [
      {
        key: 'defensive_work',
        label: 'Defensive Work',
        weight: 0.26,
        metrics: [
          { key: 'tackles_won_per30', weight: 0.38 },
          { key: 'interceptions_per30', weight: 0.32 },
          { key: 'tackle_success_pct', weight: 0.3 }
        ]
      },
      {
        key: 'progression',
        label: 'Progression',
        weight: 0.24,
        metrics: [
          { key: 'progressive_carries_per30', weight: 0.4 },
          { key: 'progressive_passes_per30', weight: 0.35 },
          { key: 'carries_into_final_third_per30', weight: 0.25 }
        ]
      },
      {
        key: 'chance_support',
        label: 'Chance Support',
        weight: 0.18,
        metrics: [
          { key: 'key_passes_per30', weight: 0.4 },
          { key: 'assists_per30', weight: 0.25 },
          { key: 'passes_into_penalty_area_per30', weight: 0.35 }
        ]
      },
      {
        key: 'ball_security',
        label: 'Ball Security',
        weight: 0.18,
        metrics: [
          { key: 'pass_completion_pct', weight: 0.55 },
          { key: 'possessions_lost_per30', weight: 0.45, invert: true }
        ]
      },
      {
        key: 'one_v_one_carrying',
        label: '1v1 Carrying',
        weight: 0.14,
        metrics: [
          { key: 'successful_take_ons_per30', weight: 0.55 },
          { key: 'take_on_success_pct', weight: 0.45 }
        ]
      }
    ]
  },
  [POSITION_MODEL_KEYS.defensiveMidfielder]: {
    label: 'DM',
    categories: [
      {
        key: 'ball_winning',
        label: 'Ball Winning',
        weight: 0.18,
        metrics: [
          { key: 'tackles_won_per30', weight: 0.52 },
          { key: 'tackle_success_pct', weight: 0.48 }
        ]
      },
      {
        key: 'defensive_reading',
        label: 'Defensive Reading',
        weight: 0.16,
        metrics: [
          { key: 'interceptions_per30', weight: 0.55 },
          { key: 'passes_blocked_per30', weight: 0.25 },
          { key: 'blocks_per30', weight: 0.2 }
        ]
      },
      {
        key: 'control_circulation',
        label: 'Control / Circulation',
        weight: 0.28,
        metrics: [
          { key: 'passes_attempted_per30', weight: 0.45 },
          { key: 'pass_completion_pct', weight: 0.55 }
        ]
      },
      {
        key: 'progression',
        label: 'Progression',
        weight: 0.24,
        metrics: [
          { key: 'progressive_passes_per30', weight: 0.5 },
          { key: 'progressive_carries_per30', weight: 0.2 },
          { key: 'passes_into_final_third_per30', weight: 0.3 }
        ]
      },
      {
        key: 'security',
        label: 'Security',
        weight: 0.14,
        metrics: [
          { key: 'possessions_lost_per30', weight: 0.55, invert: true },
          { key: 'errors_made_per30', weight: 0.45, invert: true }
        ]
      }
    ]
  },
  [POSITION_MODEL_KEYS.centralMidfielder]: {
    label: 'CM',
    categories: [
      {
        key: 'progression',
        label: 'Progression',
        weight: 0.24,
        metrics: [
          { key: 'progressive_passes_per30', weight: 0.4 },
          { key: 'progressive_carries_per30', weight: 0.25 },
          { key: 'passes_into_final_third_per30', weight: 0.35 }
        ]
      },
      {
        key: 'creation',
        label: 'Creation',
        weight: 0.18,
        metrics: [
          { key: 'key_passes_per30', weight: 0.35 },
          { key: 'assists_per30', weight: 0.2 },
          { key: 'shot_creating_actions_per30', weight: 0.45 }
        ]
      },
      {
        key: 'control',
        label: 'Control',
        weight: 0.22,
        metrics: [
          { key: 'passes_attempted_per30', weight: 0.4 },
          { key: 'pass_completion_pct', weight: 0.35 },
          { key: 'passes_completed_per30', weight: 0.25 }
        ]
      },
      {
        key: 'defensive_work',
        label: 'Defensive Work',
        weight: 0.18,
        metrics: [
          { key: 'tackles_won_per30', weight: 0.55 },
          { key: 'interceptions_per30', weight: 0.45 }
        ]
      },
      {
        key: 'retention_efficiency',
        label: 'Retention / Efficiency',
        weight: 0.18,
        metrics: [
          { key: 'possessions_lost_per30', weight: 0.65, invert: true },
          { key: 'errors_made_per30', weight: 0.35, invert: true }
        ]
      }
    ]
  },
  [POSITION_MODEL_KEYS.attackingMidfielder]: {
    label: 'CAM',
    categories: [
      {
        key: 'chance_creation',
        label: 'Chance Creation',
        weight: 0.3,
        metrics: [
          { key: 'key_passes_per30', weight: 0.3 },
          { key: 'assists_per30', weight: 0.18 },
          { key: 'shot_creating_actions_per30', weight: 0.3 },
          { key: 'goal_creating_actions_per30', weight: 0.22 }
        ]
      },
      {
        key: 'final_third_delivery',
        label: 'Final Third Delivery',
        weight: 0.2,
        metrics: [
          { key: 'passes_into_penalty_area_per30', weight: 0.42 },
          { key: 'progressive_passes_per30', weight: 0.35 },
          { key: 'key_passes_per30', weight: 0.23 }
        ]
      },
      {
        key: 'progression',
        label: 'Progression',
        weight: 0.18,
        metrics: [
          { key: 'progressive_carries_per30', weight: 0.45 },
          { key: 'progressive_passes_per30', weight: 0.3 },
          { key: 'carries_into_final_third_per30', weight: 0.25 }
        ]
      },
      {
        key: 'goal_threat',
        label: 'Goal Threat',
        weight: 0.2,
        metrics: [
          { key: 'goals_per30', weight: 0.35 },
          { key: 'xg_per30', weight: 0.35 },
          { key: 'shots_per30', weight: 0.3 }
        ]
      },
      {
        key: 'retention',
        label: 'Retention',
        weight: 0.12,
        metrics: [
          { key: 'pass_completion_pct', weight: 0.45 },
          { key: 'possessions_lost_per30', weight: 0.55, invert: true }
        ]
      }
    ]
  },
  [POSITION_MODEL_KEYS.winger]: {
    label: 'LW/RW',
    categories: [
      {
        key: 'goal_threat',
        label: 'Goal Threat',
        weight: 0.24,
        metrics: [
          { key: 'goals_per30', weight: 0.3 },
          { key: 'xg_per30', weight: 0.25 },
          { key: 'shots_per30', weight: 0.25 },
          { key: 'shots_on_target_pct', weight: 0.2 }
        ]
      },
      {
        key: 'chance_creation',
        label: 'Chance Creation',
        weight: 0.22,
        metrics: [
          { key: 'key_passes_per30', weight: 0.28 },
          { key: 'assists_per30', weight: 0.22 },
          { key: 'shot_creating_actions_per30', weight: 0.3 },
          { key: 'passes_into_penalty_area_per30', weight: 0.2 }
        ]
      },
      {
        key: 'carry_threat',
        label: 'Carry Threat',
        weight: 0.22,
        metrics: [
          { key: 'progressive_carries_per30', weight: 0.4 },
          { key: 'carries_into_final_third_per30', weight: 0.3 },
          { key: 'carries_into_penalty_area_per30', weight: 0.3 }
        ]
      },
      {
        key: 'one_v_one_quality',
        label: '1v1 Quality',
        weight: 0.16,
        metrics: [
          { key: 'successful_take_ons_per30', weight: 0.52 },
          { key: 'take_on_success_pct', weight: 0.48 }
        ]
      },
      {
        key: 'efficiency_retention',
        label: 'Efficiency / Retention',
        weight: 0.16,
        metrics: [
          { key: 'possessions_lost_per30', weight: 0.45, invert: true },
          { key: 'goals_per_shot', weight: 0.25 },
          { key: 'times_tackled_during_take_on_per30', weight: 0.3, invert: true }
        ]
      }
    ]
  },
  [POSITION_MODEL_KEYS.striker]: {
    label: 'ST',
    categories: [
      {
        key: 'goal_output',
        label: 'Goal Output',
        weight: 0.3,
        metrics: [
          { key: 'goals_per30', weight: 0.4 },
          { key: 'np_goals_per30', weight: 0.25 },
          { key: 'xg_per30', weight: 0.35 }
        ]
      },
      {
        key: 'shot_threat',
        label: 'Shot Threat',
        weight: 0.22,
        metrics: [
          { key: 'shots_per30', weight: 0.55 },
          { key: 'shots_on_target_pct', weight: 0.45 }
        ]
      },
      {
        key: 'finishing_efficiency',
        label: 'Finishing Efficiency',
        weight: 0.18,
        metrics: [
          { key: 'goals_per_shot', weight: 0.55 },
          { key: 'goals_per_shot_on_target', weight: 0.45 }
        ]
      },
      {
        key: 'box_presence',
        label: 'Box Presence',
        weight: 0.16,
        metrics: [
          { key: 'carries_into_penalty_area_per30', weight: 0.35 },
          { key: 'shots_per30', weight: 0.35 },
          { key: 'aerial_duel_win_pct', weight: 0.3 }
        ]
      },
      {
        key: 'link_play',
        label: 'Link Play / Secondary Value',
        weight: 0.14,
        metrics: [
          { key: 'key_passes_per30', weight: 0.45 },
          { key: 'assists_per30', weight: 0.3 },
          { key: 'shot_creating_actions_per30', weight: 0.25 }
        ]
      }
    ]
  }
};

const SEASON_OVR_POSITION_MODELS = {
  [POSITION_MODEL_KEYS.goalkeeper]: {
    label: 'GK',
    categories: [
      { key: 'shot_stopping', label: 'Shot Stopping', weight: 0.4, metrics: [{ key: 'saves_pct', weight: 0.55 }, { key: 'saves', weight: 0.25 }, { key: 'goals_against', weight: 0.2, invert: true }] },
      { key: 'prevention_command', label: 'Prevention / Command', weight: 0.2, metrics: [{ key: 'clean_sheets_pct', weight: 0.5 }, { key: 'crosses_stopped', weight: 0.25 }, { key: 'goals_against', weight: 0.25, invert: true }] },
      { key: 'distribution', label: 'Distribution', weight: 0.15, metrics: [{ key: 'pass_completion_pct', weight: 0.6 }, { key: 'progressive_passes', weight: 0.4 }] },
      { key: 'error_avoidance', label: 'Error Avoidance', weight: 0.25, metrics: [{ key: 'errors_made', weight: 0.65, invert: true }, { key: 'possessions_lost', weight: 0.35, invert: true }] }
    ]
  },
  [POSITION_MODEL_KEYS.centreBack]: {
    label: 'CB',
    categories: [
      { key: 'defensive_reading', label: 'Defensive Reading', weight: 0.22, metrics: [{ key: 'interceptions', weight: 0.55 }, { key: 'blocks_total', weight: 0.25 }, { key: 'clearances', weight: 0.2 }] },
      { key: 'duel_defending', label: 'Duel Defending', weight: 0.2, metrics: [{ key: 'tackles_won', weight: 0.5 }, { key: 'tackle_success_pct', weight: 0.5 }] },
      { key: 'aerial_ability', label: 'Aerial Ability', weight: 0.18, metrics: [{ key: 'aerial_duel_win_pct', weight: 0.7 }, { key: 'clearances', weight: 0.3 }] },
      { key: 'ball_security', label: 'Ball Security', weight: 0.14, metrics: [{ key: 'pass_completion_pct', weight: 0.55 }, { key: 'possessions_lost', weight: 0.45, invert: true }] },
      { key: 'progression', label: 'Progression', weight: 0.12, metrics: [{ key: 'progressive_passes', weight: 0.6 }, { key: 'passes_into_final_third', weight: 0.4 }] },
      { key: 'error_avoidance', label: 'Error Avoidance', weight: 0.14, metrics: [{ key: 'errors_made', weight: 0.7, invert: true }, { key: 'possessions_lost', weight: 0.3, invert: true }] }
    ]
  },
  [POSITION_MODEL_KEYS.fullBack]: {
    label: 'LB/RB',
    categories: [
      { key: 'defensive_work', label: 'Defensive Work', weight: 0.26, metrics: [{ key: 'tackles_won', weight: 0.38 }, { key: 'interceptions', weight: 0.32 }, { key: 'tackle_success_pct', weight: 0.3 }] },
      { key: 'progression', label: 'Progression', weight: 0.24, metrics: [{ key: 'progressive_carries', weight: 0.4 }, { key: 'progressive_passes', weight: 0.35 }, { key: 'carries_final_3rd', weight: 0.25 }] },
      { key: 'chance_support', label: 'Chance Support', weight: 0.18, metrics: [{ key: 'key_passes', weight: 0.4 }, { key: 'assists', weight: 0.25 }, { key: 'passes_into_penalty_area', weight: 0.35 }] },
      { key: 'ball_security', label: 'Ball Security', weight: 0.18, metrics: [{ key: 'pass_completion_pct', weight: 0.55 }, { key: 'possessions_lost', weight: 0.45, invert: true }] },
      { key: 'one_v_one_carrying', label: '1v1 Carrying', weight: 0.14, metrics: [{ key: 'successful_take_ons_total', weight: 0.55 }, { key: 'take_on_success_pct', weight: 0.45 }] }
    ]
  },
  [POSITION_MODEL_KEYS.defensiveMidfielder]: {
    label: 'DM',
    categories: [
      { key: 'ball_winning', label: 'Ball Winning', weight: 0.22, metrics: [{ key: 'tackles_won', weight: 0.52 }, { key: 'tackle_success_pct', weight: 0.48 }] },
      { key: 'defensive_reading', label: 'Defensive Reading', weight: 0.2, metrics: [{ key: 'interceptions', weight: 0.55 }, { key: 'passes_blocked', weight: 0.25 }, { key: 'blocks_total', weight: 0.2 }] },
      { key: 'control_circulation', label: 'Control / Circulation', weight: 0.22, metrics: [{ key: 'passes_attempted', weight: 0.45 }, { key: 'pass_completion_pct', weight: 0.55 }] },
      { key: 'progression', label: 'Progression', weight: 0.2, metrics: [{ key: 'progressive_passes', weight: 0.5 }, { key: 'progressive_carries', weight: 0.2 }, { key: 'passes_into_final_third', weight: 0.3 }] },
      { key: 'security', label: 'Security', weight: 0.16, metrics: [{ key: 'possessions_lost', weight: 0.6, invert: true }, { key: 'errors_made', weight: 0.4, invert: true }] }
    ]
  },
  [POSITION_MODEL_KEYS.centralMidfielder]: {
    label: 'CM',
    categories: [
      { key: 'progression', label: 'Progression', weight: 0.24, metrics: [{ key: 'progressive_passes', weight: 0.4 }, { key: 'progressive_carries', weight: 0.25 }, { key: 'passes_into_final_third', weight: 0.35 }] },
      { key: 'creation', label: 'Creation', weight: 0.18, metrics: [{ key: 'key_passes', weight: 0.35 }, { key: 'assists', weight: 0.2 }, { key: 'shot_creating_actions_total', weight: 0.45 }] },
      { key: 'control', label: 'Control', weight: 0.22, metrics: [{ key: 'passes_attempted', weight: 0.45 }, { key: 'pass_completion_pct', weight: 0.55 }] },
      { key: 'defensive_work', label: 'Defensive Work', weight: 0.18, metrics: [{ key: 'tackles_won', weight: 0.55 }, { key: 'interceptions', weight: 0.45 }] },
      { key: 'retention_efficiency', label: 'Retention / Efficiency', weight: 0.18, metrics: [{ key: 'possessions_lost', weight: 0.65, invert: true }, { key: 'errors_made', weight: 0.35, invert: true }] }
    ]
  },
  [POSITION_MODEL_KEYS.attackingMidfielder]: {
    label: 'CAM',
    categories: [
      { key: 'chance_creation', label: 'Chance Creation', weight: 0.3, metrics: [{ key: 'key_passes', weight: 0.3 }, { key: 'assists', weight: 0.18 }, { key: 'shot_creating_actions_total', weight: 0.3 }, { key: 'goal_creating_actions_total', weight: 0.22 }] },
      { key: 'final_third_delivery', label: 'Final Third Delivery', weight: 0.2, metrics: [{ key: 'passes_into_penalty_area', weight: 0.42 }, { key: 'progressive_passes', weight: 0.35 }, { key: 'key_passes', weight: 0.23 }] },
      { key: 'progression', label: 'Progression', weight: 0.18, metrics: [{ key: 'progressive_carries', weight: 0.45 }, { key: 'progressive_passes', weight: 0.3 }, { key: 'carries_final_3rd', weight: 0.25 }] },
      { key: 'goal_threat', label: 'Goal Threat', weight: 0.2, metrics: [{ key: 'goals', weight: 0.35 }, { key: 'expected_goals', weight: 0.35 }, { key: 'total_shots', weight: 0.3 }] },
      { key: 'retention', label: 'Retention', weight: 0.12, metrics: [{ key: 'pass_completion_pct', weight: 0.45 }, { key: 'possessions_lost', weight: 0.55, invert: true }] }
    ]
  },
  [POSITION_MODEL_KEYS.winger]: {
    label: 'LW/RW',
    categories: [
      { key: 'goal_threat', label: 'Goal Threat', weight: 0.24, metrics: [{ key: 'goals', weight: 0.3 }, { key: 'expected_goals', weight: 0.25 }, { key: 'total_shots', weight: 0.25 }, { key: 'shots_on_target_pct', weight: 0.2 }] },
      { key: 'chance_creation', label: 'Chance Creation', weight: 0.22, metrics: [{ key: 'key_passes', weight: 0.28 }, { key: 'assists', weight: 0.22 }, { key: 'shot_creating_actions_total', weight: 0.3 }, { key: 'passes_into_penalty_area', weight: 0.2 }] },
      { key: 'carry_threat', label: 'Carry Threat', weight: 0.22, metrics: [{ key: 'progressive_carries', weight: 0.4 }, { key: 'carries_final_3rd', weight: 0.3 }, { key: 'carries_penalty_area', weight: 0.3 }] },
      { key: 'one_v_one_quality', label: '1v1 Quality', weight: 0.16, metrics: [{ key: 'successful_take_ons_total', weight: 0.52 }, { key: 'take_on_success_pct', weight: 0.48 }] },
      { key: 'efficiency_retention', label: 'Efficiency / Retention', weight: 0.16, metrics: [{ key: 'possessions_lost', weight: 0.45, invert: true }, { key: 'goals_per_shot', weight: 0.25 }, { key: 'times_tackled_during_take_on', weight: 0.3, invert: true }] }
    ]
  },
  [POSITION_MODEL_KEYS.striker]: {
    label: 'ST',
    categories: [
      { key: 'goal_output', label: 'Goal Output', weight: 0.3, metrics: [{ key: 'goals', weight: 0.4 }, { key: 'non_penalty_goals', weight: 0.25 }, { key: 'expected_goals', weight: 0.35 }] },
      { key: 'shot_threat', label: 'Shot Threat', weight: 0.22, metrics: [{ key: 'total_shots', weight: 0.55 }, { key: 'shots_on_target_pct', weight: 0.45 }] },
      { key: 'finishing_efficiency', label: 'Finishing Efficiency', weight: 0.18, metrics: [{ key: 'goals_per_shot', weight: 0.55 }, { key: 'goals_per_shot_on_target', weight: 0.45 }] },
      { key: 'box_presence', label: 'Box Presence', weight: 0.16, metrics: [{ key: 'carries_penalty_area', weight: 0.35 }, { key: 'total_shots', weight: 0.35 }, { key: 'aerial_duel_win_pct', weight: 0.3 }] },
      { key: 'link_play', label: 'Link Play / Secondary Value', weight: 0.14, metrics: [{ key: 'key_passes', weight: 0.45 }, { key: 'assists', weight: 0.3 }, { key: 'shot_creating_actions_total', weight: 0.25 }] }
    ]
  }
};

const BASE_OUTPUT_MODELS = {
  [POSITION_MODEL_KEYS.goalkeeper]: [{ key: 'clean_sheets', label: 'Clean sheets', target: 16, weight: 0.4 }, { key: 'saves', label: 'Saves', target: 105, weight: 0.4 }, { key: 'crosses_stopped', label: 'Crosses stopped', target: 22, weight: 0.2 }],
  [POSITION_MODEL_KEYS.centreBack]: [{ key: 'interceptions', label: 'Interceptions', target: 48, weight: 0.3 }, { key: 'tackles_won', label: 'Tackles won', target: 38, weight: 0.2 }, { key: 'blocks_total', label: 'Blocks', target: 60, weight: 0.2 }, { key: 'progressive_passes', label: 'Progressive passes', target: 220, weight: 0.3 }],
  [POSITION_MODEL_KEYS.fullBack]: [{ key: 'assists', label: 'Assists', target: 8, weight: 0.2 }, { key: 'key_passes', label: 'Key passes', target: 42, weight: 0.2 }, { key: 'progressive_carries', label: 'Progressive carries', target: 115, weight: 0.2 }, { key: 'progressive_passes', label: 'Progressive passes', target: 145, weight: 0.2 }, { key: 'tackles_won', label: 'Tackles won', target: 42, weight: 0.2 }],
  [POSITION_MODEL_KEYS.defensiveMidfielder]: [{ key: 'passes_attempted', label: 'Passes attempted', target: 2400, weight: 0.3 }, { key: 'progressive_passes', label: 'Progressive passes', target: 220, weight: 0.25 }, { key: 'interceptions', label: 'Interceptions', target: 52, weight: 0.25 }, { key: 'tackles_won', label: 'Tackles won', target: 42, weight: 0.2 }],
  [POSITION_MODEL_KEYS.centralMidfielder]: [{ key: 'progressive_passes', label: 'Progressive passes', target: 240, weight: 0.25 }, { key: 'key_passes', label: 'Key passes', target: 48, weight: 0.2 }, { key: 'assists', label: 'Assists', target: 10, weight: 0.15 }, { key: 'passes_attempted', label: 'Passes attempted', target: 2550, weight: 0.2 }, { key: 'tackles_won', label: 'Tackles won', target: 40, weight: 0.2 }],
  [POSITION_MODEL_KEYS.attackingMidfielder]: [{ key: 'assists', label: 'Assists', target: 12, weight: 0.25 }, { key: 'key_passes', label: 'Key passes', target: 70, weight: 0.25 }, { key: 'shot_creating_actions_total', label: 'Shot creating actions', target: 135, weight: 0.25 }, { key: 'goals', label: 'Goals', target: 14, weight: 0.25 }],
  [POSITION_MODEL_KEYS.winger]: [{ key: 'goals', label: 'Goals', target: 18, weight: 0.25 }, { key: 'assists', label: 'Assists', target: 12, weight: 0.2 }, { key: 'key_passes', label: 'Key passes', target: 55, weight: 0.15 }, { key: 'shot_creating_actions_total', label: 'Shot creating actions', target: 120, weight: 0.2 }, { key: 'carries_penalty_area', label: 'Carries into box', target: 24, weight: 0.2 }],
  [POSITION_MODEL_KEYS.striker]: [{ key: 'goals', label: 'Goals', target: 28, weight: 0.45 }, { key: 'non_penalty_goals', label: 'NP goals', target: 24, weight: 0.2 }, { key: 'assists', label: 'Assists', target: 8, weight: 0.1 }, { key: 'expected_goals', label: 'xG', target: 24, weight: 0.25 }]
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
const CATEGORY_SCORE_GROUPS = {
  attacking: CATEGORY_METRICS.attack,
  playmaking: CATEGORY_METRICS.creativity,
  possession: CATEGORY_METRICS.possession,
  defending: CATEGORY_METRICS.defending,
  goalkeeping: GOALKEEPER_DEFENDING_METRICS
};

const POSITION_CATEGORY_MODELS = {
  [POSITION_MODEL_KEYS.goalkeeper]: {
    attack: [{ key: 'progressive_passes', weight: 0.6 }, { key: 'pass_completion_pct', weight: 0.4 }],
    creativity: [{ key: 'progressive_passes', weight: 0.65 }, { key: 'passes_attempted', weight: 0.35 }],
    possession: [{ key: 'pass_completion_pct', weight: 0.5 }, { key: 'passes_attempted', weight: 0.3 }, { key: 'possessions_lost', weight: 0.2, invert: true }],
    defending: [{ key: 'saves_pct', weight: 0.35 }, { key: 'saves', weight: 0.2 }, { key: 'clean_sheets_pct', weight: 0.2 }, { key: 'goals_against', weight: 0.15, invert: true }, { key: 'errors_made', weight: 0.1, invert: true }]
  },
  [POSITION_MODEL_KEYS.centreBack]: {
    attack: [{ key: 'goals', weight: 0.25 }, { key: 'progressive_passes', weight: 0.45 }, { key: 'passes_into_final_third', weight: 0.3 }],
    creativity: [{ key: 'progressive_passes', weight: 0.45 }, { key: 'passes_into_final_third', weight: 0.35 }, { key: 'key_passes', weight: 0.2 }],
    possession: [{ key: 'pass_completion_pct', weight: 0.38 }, { key: 'passes_attempted', weight: 0.24 }, { key: 'progressive_passes', weight: 0.18 }, { key: 'possessions_lost', weight: 0.2, invert: true }],
    defending: [{ key: 'tackles_won', weight: 0.22 }, { key: 'interceptions', weight: 0.24 }, { key: 'blocks_total', weight: 0.16 }, { key: 'aerial_duel_win_pct', weight: 0.2 }, { key: 'errors_made', weight: 0.18, invert: true }]
  },
  [POSITION_MODEL_KEYS.fullBack]: {
    attack: [{ key: 'assists', weight: 0.2 }, { key: 'goals', weight: 0.1 }, { key: 'carries_penalty_area', weight: 0.3 }, { key: 'key_passes', weight: 0.2 }, { key: 'passes_into_penalty_area', weight: 0.2 }],
    creativity: [{ key: 'key_passes', weight: 0.28 }, { key: 'assists', weight: 0.18 }, { key: 'passes_into_penalty_area', weight: 0.24 }, { key: 'progressive_passes', weight: 0.3 }],
    possession: [{ key: 'pass_completion_pct', weight: 0.28 }, { key: 'passes_attempted', weight: 0.16 }, { key: 'progressive_carries', weight: 0.28 }, { key: 'successful_take_ons_total', weight: 0.12 }, { key: 'possessions_lost', weight: 0.16, invert: true }],
    defending: [{ key: 'tackles_won', weight: 0.28 }, { key: 'interceptions', weight: 0.24 }, { key: 'tackle_success_pct', weight: 0.18 }, { key: 'blocks_total', weight: 0.12 }, { key: 'errors_made', weight: 0.18, invert: true }]
  },
  [POSITION_MODEL_KEYS.defensiveMidfielder]: {
    attack: [{ key: 'goals', weight: 0.18 }, { key: 'assists', weight: 0.16 }, { key: 'passes_into_penalty_area', weight: 0.26 }, { key: 'expected_goals', weight: 0.18 }, { key: 'total_shots', weight: 0.22 }],
    creativity: [{ key: 'key_passes', weight: 0.22 }, { key: 'progressive_passes', weight: 0.34 }, { key: 'passes_into_final_third', weight: 0.24 }, { key: 'assists', weight: 0.2 }],
    possession: [{ key: 'passes_attempted', weight: 0.3 }, { key: 'pass_completion_pct', weight: 0.28 }, { key: 'progressive_passes', weight: 0.22 }, { key: 'progressive_carries', weight: 0.08 }, { key: 'possessions_lost', weight: 0.12, invert: true }],
    defending: [{ key: 'tackles_won', weight: 0.24 }, { key: 'interceptions', weight: 0.3 }, { key: 'blocks_total', weight: 0.14 }, { key: 'tackle_success_pct', weight: 0.16 }, { key: 'errors_made', weight: 0.16, invert: true }]
  },
  [POSITION_MODEL_KEYS.centralMidfielder]: {
    attack: [{ key: 'goals', weight: 0.22 }, { key: 'assists', weight: 0.18 }, { key: 'expected_goals', weight: 0.18 }, { key: 'total_shots', weight: 0.18 }, { key: 'passes_into_penalty_area', weight: 0.24 }],
    creativity: [{ key: 'key_passes', weight: 0.26 }, { key: 'assists', weight: 0.16 }, { key: 'shot_creating_actions_total', weight: 0.28 }, { key: 'progressive_passes', weight: 0.3 }],
    possession: [{ key: 'passes_attempted', weight: 0.28 }, { key: 'pass_completion_pct', weight: 0.28 }, { key: 'progressive_passes', weight: 0.18 }, { key: 'progressive_carries', weight: 0.14 }, { key: 'possessions_lost', weight: 0.12, invert: true }],
    defending: [{ key: 'tackles_won', weight: 0.26 }, { key: 'interceptions', weight: 0.28 }, { key: 'blocks_total', weight: 0.14 }, { key: 'tackle_success_pct', weight: 0.14 }, { key: 'errors_made', weight: 0.18, invert: true }]
  },
  [POSITION_MODEL_KEYS.attackingMidfielder]: {
    attack: [{ key: 'goals', weight: 0.28 }, { key: 'expected_goals', weight: 0.18 }, { key: 'total_shots', weight: 0.18 }, { key: 'passes_into_penalty_area', weight: 0.18 }, { key: 'goal_creating_actions_total', weight: 0.18 }],
    creativity: [{ key: 'key_passes', weight: 0.25 }, { key: 'assists', weight: 0.16 }, { key: 'shot_creating_actions_total', weight: 0.25 }, { key: 'goal_creating_actions_total', weight: 0.16 }, { key: 'passes_into_penalty_area', weight: 0.18 }],
    possession: [{ key: 'pass_completion_pct', weight: 0.24 }, { key: 'progressive_carries', weight: 0.26 }, { key: 'progressive_passes', weight: 0.2 }, { key: 'successful_take_ons_total', weight: 0.12 }, { key: 'possessions_lost', weight: 0.18, invert: true }],
    defending: [{ key: 'tackles_won', weight: 0.32 }, { key: 'interceptions', weight: 0.28 }, { key: 'blocks_total', weight: 0.14 }, { key: 'errors_made', weight: 0.26, invert: true }]
  },
  [POSITION_MODEL_KEYS.winger]: {
    attack: [{ key: 'goals', weight: 0.28 }, { key: 'expected_goals', weight: 0.18 }, { key: 'total_shots', weight: 0.18 }, { key: 'shots_on_target_pct', weight: 0.12 }, { key: 'carries_penalty_area', weight: 0.24 }],
    creativity: [{ key: 'key_passes', weight: 0.24 }, { key: 'assists', weight: 0.16 }, { key: 'shot_creating_actions_total', weight: 0.26 }, { key: 'passes_into_penalty_area', weight: 0.16 }, { key: 'progressive_passes', weight: 0.18 }],
    possession: [{ key: 'progressive_carries', weight: 0.28 }, { key: 'successful_take_ons_total', weight: 0.18 }, { key: 'take_on_success_pct', weight: 0.18 }, { key: 'pass_completion_pct', weight: 0.14 }, { key: 'possessions_lost', weight: 0.22, invert: true }],
    defending: [{ key: 'tackles_won', weight: 0.32 }, { key: 'interceptions', weight: 0.28 }, { key: 'blocks_total', weight: 0.1 }, { key: 'errors_made', weight: 0.3, invert: true }]
  },
  [POSITION_MODEL_KEYS.striker]: {
    attack: [{ key: 'goals', weight: 0.32 }, { key: 'non_penalty_goals', weight: 0.16 }, { key: 'expected_goals', weight: 0.16 }, { key: 'total_shots', weight: 0.16 }, { key: 'goals_per_shot', weight: 0.1 }, { key: 'carries_penalty_area', weight: 0.1 }],
    creativity: [{ key: 'key_passes', weight: 0.28 }, { key: 'assists', weight: 0.22 }, { key: 'shot_creating_actions_total', weight: 0.25 }, { key: 'passes_into_penalty_area', weight: 0.12 }, { key: 'progressive_passes', weight: 0.13 }],
    possession: [{ key: 'pass_completion_pct', weight: 0.24 }, { key: 'progressive_carries', weight: 0.18 }, { key: 'successful_take_ons_total', weight: 0.12 }, { key: 'possessions_lost', weight: 0.28, invert: true }, { key: 'times_tackled_during_take_on', weight: 0.18, invert: true }],
    defending: [{ key: 'tackles_won', weight: 0.42 }, { key: 'interceptions', weight: 0.28 }, { key: 'errors_made', weight: 0.3, invert: true }]
  }
};

const CATEGORY_DISPLAY_RANGES = {
  [POSITION_MODEL_KEYS.goalkeeper]: { attack: [6, 24], creativity: [14, 42], possession: [34, 74], defending: [58, 95] },
  [POSITION_MODEL_KEYS.centreBack]: { attack: [8, 34], creativity: [18, 54], possession: [42, 84], defending: [58, 97] },
  [POSITION_MODEL_KEYS.fullBack]: { attack: [32, 84], creativity: [34, 84], possession: [40, 82], defending: [46, 88] },
  [POSITION_MODEL_KEYS.defensiveMidfielder]: { attack: [18, 56], creativity: [34, 78], possession: [56, 95], defending: [56, 95] },
  [POSITION_MODEL_KEYS.centralMidfielder]: { attack: [28, 74], creativity: [42, 86], possession: [50, 93], defending: [36, 80] },
  [POSITION_MODEL_KEYS.attackingMidfielder]: { attack: [48, 92], creativity: [58, 97], possession: [42, 84], defending: [16, 48] },
  [POSITION_MODEL_KEYS.winger]: { attack: [52, 95], creativity: [44, 90], possession: [34, 78], defending: [14, 42] },
  [POSITION_MODEL_KEYS.striker]: { attack: [58, 97], creativity: [24, 72], possession: [22, 66], defending: [10, 36] }
};

const CATEGORY_TO_OVR_WEIGHTS = {
  [POSITION_MODEL_KEYS.goalkeeper]: { attack: 0.02, creativity: 0.13, possession: 0.2, defending: 0.65 },
  [POSITION_MODEL_KEYS.centreBack]: { attack: 0.06, creativity: 0.1, possession: 0.24, defending: 0.6 },
  [POSITION_MODEL_KEYS.fullBack]: { attack: 0.22, creativity: 0.2, possession: 0.22, defending: 0.36 },
  [POSITION_MODEL_KEYS.defensiveMidfielder]: { attack: 0.08, creativity: 0.16, possession: 0.38, defending: 0.38 },
  [POSITION_MODEL_KEYS.centralMidfielder]: { attack: 0.18, creativity: 0.25, possession: 0.34, defending: 0.23 },
  [POSITION_MODEL_KEYS.attackingMidfielder]: { attack: 0.33, creativity: 0.37, possession: 0.22, defending: 0.08 },
  [POSITION_MODEL_KEYS.winger]: { attack: 0.42, creativity: 0.28, possession: 0.2, defending: 0.1 },
  [POSITION_MODEL_KEYS.striker]: { attack: 0.6, creativity: 0.16, possession: 0.16, defending: 0.08 }
};

const ROLE_TEMPLATE_DEFINITIONS = {
  [POSITION_MODEL_KEYS.goalkeeper]: [
    { key: 'ShotStopper', label: 'Shot Stopper', targets: { attack: 10, creativity: 28, possession: 52, defending: 92 }, support: [{ key: 'saves_pct', weight: 0.6 }, { key: 'saves', weight: 0.4 }] },
    { key: 'SweeperKeeper', label: 'Sweeper Keeper', targets: { attack: 18, creativity: 58, possession: 74, defending: 82 }, support: [{ key: 'progressive_passes', weight: 0.55 }, { key: 'pass_completion_pct', weight: 0.45 }] },
    { key: 'CommandingKeeper', label: 'Commanding Keeper', targets: { attack: 10, creativity: 26, possession: 58, defending: 88 }, support: [{ key: 'clean_sheets_pct', weight: 0.5 }, { key: 'crosses_stopped', weight: 0.5 }] },
    { key: 'Distributor', label: 'Distributor', targets: { attack: 16, creativity: 68, possession: 82, defending: 74 }, support: [{ key: 'progressive_passes', weight: 0.6 }, { key: 'passes_attempted', weight: 0.4 }] }
  ],
  [POSITION_MODEL_KEYS.centreBack]: [
    { key: 'Stopper', label: 'Stopper', targets: { attack: 14, creativity: 24, possession: 52, defending: 92 }, support: [{ key: 'tackles_won', weight: 0.45 }, { key: 'interceptions', weight: 0.55 }] },
    { key: 'BallPlayingCB', label: 'Ball-Playing CB', targets: { attack: 18, creativity: 56, possession: 80, defending: 84 }, support: [{ key: 'progressive_passes', weight: 0.55 }, { key: 'pass_completion_pct', weight: 0.45 }] },
    { key: 'Sweeper', label: 'Sweeper', targets: { attack: 16, creativity: 38, possession: 72, defending: 88 }, support: [{ key: 'interceptions', weight: 0.55 }, { key: 'pass_completion_pct', weight: 0.45 }] },
    { key: 'AerialCB', label: 'Aerial CB', targets: { attack: 18, creativity: 22, possession: 48, defending: 90 }, support: [{ key: 'aerial_duel_win_pct', weight: 0.65 }, { key: 'clearances', weight: 0.35 }] }
  ],
  [POSITION_MODEL_KEYS.fullBack]: [
    { key: 'DefensiveFullBack', label: 'Defensive Full-Back', targets: { attack: 40, creativity: 48, possession: 66, defending: 86 }, support: [{ key: 'tackles_won', weight: 0.5 }, { key: 'interceptions', weight: 0.5 }] },
    { key: 'BalancedFullBack', label: 'Balanced Full-Back', targets: { attack: 58, creativity: 60, possession: 70, defending: 74 }, support: [{ key: 'progressive_passes', weight: 0.4 }, { key: 'tackles_won', weight: 0.3 }, { key: 'key_passes', weight: 0.3 }] },
    { key: 'AttackingFullBack', label: 'Attacking Full-Back', targets: { attack: 76, creativity: 74, possession: 66, defending: 62 }, support: [{ key: 'assists', weight: 0.35 }, { key: 'key_passes', weight: 0.3 }, { key: 'carries_penalty_area', weight: 0.35 }] },
    { key: 'InvertedProgressor', label: 'Inverted Progressor', targets: { attack: 54, creativity: 66, possession: 84, defending: 66 }, support: [{ key: 'progressive_passes', weight: 0.5 }, { key: 'passes_attempted', weight: 0.3 }, { key: 'pass_completion_pct', weight: 0.2 }] }
  ],
  [POSITION_MODEL_KEYS.defensiveMidfielder]: [
    { key: 'Destroyer', label: 'Destroyer', targets: { attack: 20, creativity: 34, possession: 66, defending: 92 }, support: [{ key: 'tackles_won', weight: 0.45 }, { key: 'interceptions', weight: 0.55 }] },
    { key: 'Anchor', label: 'Anchor', targets: { attack: 18, creativity: 42, possession: 76, defending: 88 }, support: [{ key: 'pass_completion_pct', weight: 0.35 }, { key: 'interceptions', weight: 0.35 }, { key: 'tackles_won', weight: 0.3 }] },
    { key: 'Regista', label: 'Regista', targets: { attack: 28, creativity: 72, possession: 90, defending: 70 }, support: [{ key: 'progressive_passes', weight: 0.55 }, { key: 'passes_attempted', weight: 0.45 }] },
    { key: 'DeepController', label: 'Deep Controller', targets: { attack: 26, creativity: 60, possession: 92, defending: 82 }, support: [{ key: 'pass_completion_pct', weight: 0.4 }, { key: 'progressive_passes', weight: 0.4 }, { key: 'interceptions', weight: 0.2 }] }
  ],
  [POSITION_MODEL_KEYS.centralMidfielder]: [
    { key: 'BoxToBox', label: 'Box-to-Box', targets: { attack: 62, creativity: 60, possession: 74, defending: 68 }, support: [{ key: 'goals', weight: 0.25 }, { key: 'progressive_carries', weight: 0.35 }, { key: 'tackles_won', weight: 0.4 }] },
    { key: 'DeepPlaymaker', label: 'Deep Playmaker', targets: { attack: 40, creativity: 78, possession: 88, defending: 54 }, support: [{ key: 'progressive_passes', weight: 0.55 }, { key: 'passes_attempted', weight: 0.45 }] },
    { key: 'Controller', label: 'Controller', targets: { attack: 42, creativity: 68, possession: 92, defending: 58 }, support: [{ key: 'pass_completion_pct', weight: 0.5 }, { key: 'passes_attempted', weight: 0.3 }, { key: 'progressive_passes', weight: 0.2 }] },
    { key: 'TwoWayCM', label: 'Two-Way CM', targets: { attack: 48, creativity: 58, possession: 82, defending: 74 }, support: [{ key: 'tackles_won', weight: 0.4 }, { key: 'interceptions', weight: 0.3 }, { key: 'progressive_passes', weight: 0.3 }] }
  ],
  [POSITION_MODEL_KEYS.attackingMidfielder]: [
    { key: 'Playmaker', label: 'Playmaker', targets: { attack: 64, creativity: 90, possession: 74, defending: 24 }, support: [{ key: 'key_passes', weight: 0.45 }, { key: 'assists', weight: 0.2 }, { key: 'progressive_passes', weight: 0.35 }] },
    { key: 'AdvancedCreator', label: 'Advanced Creator', targets: { attack: 74, creativity: 94, possession: 72, defending: 22 }, support: [{ key: 'shot_creating_actions_total', weight: 0.4 }, { key: 'goal_creating_actions_total', weight: 0.25 }, { key: 'key_passes', weight: 0.35 }] },
    { key: 'GoalScoringAM', label: 'Goal-Scoring AM', targets: { attack: 88, creativity: 76, possession: 58, defending: 18 }, support: [{ key: 'goals', weight: 0.45 }, { key: 'expected_goals', weight: 0.3 }, { key: 'total_shots', weight: 0.25 }] },
    { key: 'FreeRoamCreator', label: 'Free-Roam Creator', targets: { attack: 80, creativity: 86, possession: 66, defending: 20 }, support: [{ key: 'progressive_carries', weight: 0.4 }, { key: 'shot_creating_actions_total', weight: 0.35 }, { key: 'goals', weight: 0.25 }] }
  ],
  [POSITION_MODEL_KEYS.winger]: [
    { key: 'InsideForward', label: 'Inside Forward', targets: { attack: 92, creativity: 66, possession: 56, defending: 18 }, support: [{ key: 'goals', weight: 0.45 }, { key: 'expected_goals', weight: 0.25 }, { key: 'carries_penalty_area', weight: 0.3 }] },
    { key: 'WideCreator', label: 'Wide Creator', targets: { attack: 70, creativity: 88, possession: 62, defending: 20 }, support: [{ key: 'key_passes', weight: 0.4 }, { key: 'assists', weight: 0.25 }, { key: 'passes_into_penalty_area', weight: 0.35 }] },
    { key: 'DirectDribbler', label: 'Direct Dribbler', targets: { attack: 84, creativity: 62, possession: 58, defending: 16 }, support: [{ key: 'progressive_carries', weight: 0.35 }, { key: 'successful_take_ons_total', weight: 0.35 }, { key: 'take_on_success_pct', weight: 0.3 }] },
    { key: 'BalancedWinger', label: 'Balanced Winger', targets: { attack: 80, creativity: 76, possession: 64, defending: 18 }, support: [{ key: 'goals', weight: 0.25 }, { key: 'key_passes', weight: 0.25 }, { key: 'progressive_carries', weight: 0.25 }, { key: 'assists', weight: 0.25 }] }
  ],
  [POSITION_MODEL_KEYS.striker]: [
    { key: 'Poacher', label: 'Poacher', targets: { attack: 96, creativity: 30, possession: 28, defending: 12 }, support: [{ key: 'goals', weight: 0.5 }, { key: 'non_penalty_goals', weight: 0.25 }, { key: 'goals_per_shot', weight: 0.25 }] },
    { key: 'TargetMan', label: 'Target Man', targets: { attack: 88, creativity: 36, possession: 40, defending: 14 }, support: [{ key: 'aerial_duel_win_pct', weight: 0.45 }, { key: 'goals', weight: 0.35 }, { key: 'key_passes', weight: 0.2 }] },
    { key: 'CompleteForward', label: 'Complete Forward', targets: { attack: 90, creativity: 62, possession: 56, defending: 16 }, support: [{ key: 'goals', weight: 0.35 }, { key: 'assists', weight: 0.2 }, { key: 'key_passes', weight: 0.2 }, { key: 'shot_creating_actions_total', weight: 0.25 }] },
    { key: 'False9', label: 'False 9', targets: { attack: 74, creativity: 74, possession: 62, defending: 18 }, support: [{ key: 'key_passes', weight: 0.35 }, { key: 'assists', weight: 0.25 }, { key: 'progressive_passes', weight: 0.2 }, { key: 'shot_creating_actions_total', weight: 0.2 }] }
  ]
};
const DEBUG_SAMPLE_PLAYERS = [
  'Son Heung-min',
  'Martin Zubimendi',
  'Bruno Guimar\u00E3es',
  'Harry Kane',
  'Ollie Watkins',
  'Gabriel Jesus',
  'Mohamed Salah'
];

const SCOUTING_SECTION_ORDER = ['attacking', 'playmaking', 'possession', 'defensive', 'goalkeeping'];

const SCOUTING_SECTION_META = {
  attacking: {
    key: 'attacking',
    title: 'Attacking',
    description: 'Shot quality, finishing, and direct goal threat.'
  },
  playmaking: {
    key: 'playmaking',
    title: 'Playmaking',
    description: 'Chance creation and line-breaking distribution.'
  },
  possession: {
    key: 'possession',
    title: 'Possession & Dribbling',
    description: 'Ball carrying, retention, and progression under pressure.'
  },
  defensive: {
    key: 'defensive',
    title: 'Defensive',
    description: 'Defensive volume, duel efficiency, and error control.'
  },
  goalkeeping: {
    key: 'goalkeeping',
    title: 'Goalkeeping',
    description: 'Shot stopping and prevention output.'
  }
};

const SCOUTING_METRIC_DEFINITIONS = {
  xg_diff: {
    label: 'xG Diff',
    section: 'attacking',
    format: 'signed',
    tooltip: 'Goals scored minus expected goals. Positive values suggest finishing above expected output.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  xg_per_shot: {
    label: 'xG / Shot',
    section: 'attacking',
    format: 'decimal',
    tooltip: 'Average expected goals value generated per shot.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  finishing_ratio: {
    label: 'Finishing Ratio',
    section: 'attacking',
    format: 'decimal',
    tooltip: 'Goals divided by expected goals. Values above 1 mean stronger finishing than expected.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  shots_on_target_pct: {
    label: 'Shots On Target %',
    section: 'attacking',
    format: 'pct',
    tooltip: 'Share of total shots that force a save or score.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  goals_per_shot: {
    label: 'Goals / Shot',
    section: 'attacking',
    format: 'decimal',
    tooltip: 'Goals scored per shot taken.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  goals_p90: {
    label: 'Goals P90',
    section: 'attacking',
    format: 'decimal',
    tooltip: 'Goals scored per 90 minutes.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  shots_p90: {
    label: 'Shots P90',
    section: 'attacking',
    format: 'decimal',
    tooltip: 'Shots attempted per 90 minutes.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  key_pass_eff: {
    label: 'Key Pass Efficiency',
    section: 'playmaking',
    format: 'pct',
    tooltip: 'Assists per key pass. A proxy for how often chance creation turns into goals.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  progressive_pass_rate: {
    label: 'Progressive Pass Rate',
    section: 'playmaking',
    format: 'pct',
    tooltip: 'Progressive passes as a share of all passes attempted.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  final_third_rate: {
    label: 'Final Third Rate',
    section: 'playmaking',
    format: 'pct',
    tooltip: 'Passes into the final third as a share of all passes attempted.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  penalty_area_pass_rate: {
    label: 'Penalty Area Pass Rate',
    section: 'playmaking',
    format: 'pct',
    tooltip: 'Passes into the penalty area as a share of all passes attempted.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  key_passes: {
    label: 'Key Passes',
    section: 'playmaking',
    format: 'integer',
    tooltip: 'Passes leading directly to a shot.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  progressive_passes: {
    label: 'Progressive Passes',
    section: 'playmaking',
    format: 'integer',
    tooltip: 'Passes that move the ball significantly toward goal.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  shot_creating_actions_p90: {
    label: 'SCA P90',
    section: 'playmaking',
    format: 'decimal',
    tooltip: 'Shot-creating actions per 90 minutes.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  takeons_p90: {
    label: 'Take-Ons P90',
    section: 'possession',
    format: 'decimal',
    tooltip: 'Take-on attempts per 90 minutes.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  risk_index: {
    label: 'Risk Index',
    section: 'possession',
    format: 'pct',
    invert: true,
    tooltip: 'Possessions lost as a share of passing and carrying actions. Lower is better.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  ball_retention: {
    label: 'Ball Retention',
    section: 'possession',
    format: 'pct',
    tooltip: 'Completed passes as a share of completed passes plus possessions lost.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  carry_final_third_rate: {
    label: 'Carry Final Third Rate',
    section: 'possession',
    format: 'pct',
    tooltip: 'Carries into the final third as a share of progressive carries.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  carry_penalty_rate: {
    label: 'Carry Penalty Rate',
    section: 'possession',
    format: 'pct',
    tooltip: 'Carries into the penalty area as a share of progressive carries.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  progressive_carries: {
    label: 'Progressive Carries',
    section: 'possession',
    format: 'integer',
    tooltip: 'Carries that move the ball significantly toward goal.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  successful_take_ons_pct: {
    label: 'Successful Take-Ons %',
    section: 'possession',
    format: 'pct',
    tooltip: 'Share of take-ons completed successfully.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  tackle_success: {
    label: 'Tackle Success',
    section: 'defensive',
    format: 'pct',
    tooltip: 'Tackles won as a share of tackles attempted.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  def_actions: {
    label: 'Def. Actions',
    section: 'defensive',
    format: 'integer',
    tooltip: 'Combined tackles won, interceptions, clearances, and blocks.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  def_actions_p90: {
    label: 'Def. Actions P90',
    section: 'defensive',
    format: 'decimal',
    tooltip: 'Combined defensive actions per 90 minutes.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  def_engagement: {
    label: 'Def. Engagement',
    section: 'defensive',
    format: 'decimal',
    tooltip: 'Tackles attempted, interceptions, and blocks per 90 minutes.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  error_rate: {
    label: 'Error Rate',
    section: 'defensive',
    format: 'decimal',
    invert: true,
    tooltip: 'Errors leading to chances or shots per 90 minutes. Lower is better.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  interceptions: {
    label: 'Interceptions',
    section: 'defensive',
    format: 'integer',
    tooltip: 'Passes intercepted before reaching the opponent.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  aerial_duels_won_pct: {
    label: 'Aerial Duels Won %',
    section: 'defensive',
    format: 'pct',
    tooltip: 'Share of aerial duels won.',
    relevantFamilies: [POSITION_FAMILIES.defender]
  },
  save_eff: {
    label: 'Save Efficiency',
    section: 'goalkeeping',
    format: 'pct',
    tooltip: 'Save percentage against shots on target faced.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  },
  clean_sheet_rate: {
    label: 'Clean Sheet Rate',
    section: 'goalkeeping',
    format: 'pct',
    tooltip: 'Share of appearances ending with a clean sheet.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  },
  goals_against: {
    label: 'Goals Against',
    section: 'goalkeeping',
    format: 'integer',
    invert: true,
    tooltip: 'Total goals conceded. Lower is better, especially across similar minutes.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  },
  goals_against_p90: {
    label: 'Goals Against P90',
    section: 'goalkeeping',
    format: 'decimal',
    invert: true,
    tooltip: 'Goals conceded per 90 minutes.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  },
  crosses_stopped: {
    label: 'Crosses Stopped',
    section: 'goalkeeping',
    format: 'integer',
    tooltip: 'Crosses claimed or punched away successfully.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  }
};

const SCOUTING_SECTION_METRIC_KEYS = {
  attacking: ['xg_diff', 'finishing_ratio', 'shots_on_target_pct', 'goals_per_shot', 'xg_per_shot', 'goals_p90', 'shots_p90'],
  playmaking: ['key_pass_eff', 'progressive_pass_rate', 'final_third_rate', 'penalty_area_pass_rate', 'key_passes', 'progressive_passes', 'shot_creating_actions_p90'],
  possession: ['takeons_p90', 'risk_index', 'ball_retention', 'carry_final_third_rate', 'carry_penalty_rate', 'progressive_carries', 'successful_take_ons_pct'],
  defensive: ['tackle_success', 'def_actions_p90', 'interceptions', 'error_rate', 'ball_retention', 'def_actions', 'def_engagement', 'aerial_duels_won_pct'],
  goalkeeping: ['save_eff', 'clean_sheet_rate', 'goals_against', 'goals_against_p90', 'crosses_stopped']
};

const POSITION_PRIORITY_METRICS = {
  [POSITION_FAMILIES.forward]: ['xg_diff', 'finishing_ratio', 'shots_on_target_pct', 'goals_per_shot', 'takeons_p90', 'risk_index'],
  [POSITION_FAMILIES.midfielder]: ['key_pass_eff', 'progressive_pass_rate', 'final_third_rate', 'ball_retention', 'def_engagement'],
  [POSITION_FAMILIES.defender]: ['tackle_success', 'def_actions_p90', 'interceptions', 'error_rate', 'ball_retention'],
  [POSITION_FAMILIES.goalkeeper]: ['save_eff', 'clean_sheet_rate', 'goals_against']
};

const POSITION_DEFAULT_SCOUTING_SECTION = {
  [POSITION_FAMILIES.forward]: 'attacking',
  [POSITION_FAMILIES.midfielder]: 'playmaking',
  [POSITION_FAMILIES.defender]: 'defensive',
  [POSITION_FAMILIES.goalkeeper]: 'goalkeeping'
};

const ARCHETYPE_PROFILES = {
  [POSITION_FAMILIES.forward]: [
    { label: 'Finisher', metrics: ['xg_diff', 'finishing_ratio', 'goals_per_shot', 'shots_on_target_pct'] },
    { label: 'Dribble Threat', metrics: ['takeons_p90', 'carry_penalty_rate', 'carry_final_third_rate', 'risk_index'] },
    { label: 'Creative Forward', metrics: ['key_pass_eff', 'penalty_area_pass_rate', 'progressive_pass_rate', 'shot_creating_actions_p90'] }
  ],
  [POSITION_FAMILIES.midfielder]: [
    { label: 'Playmaker', metrics: ['key_pass_eff', 'progressive_pass_rate', 'final_third_rate', 'penalty_area_pass_rate'] },
    { label: 'Ball Progressor', metrics: ['progressive_pass_rate', 'carry_final_third_rate', 'carry_penalty_rate', 'ball_retention'] },
    { label: 'Ball Winner', metrics: ['tackle_success', 'def_actions_p90', 'def_engagement', 'interceptions'] }
  ],
  [POSITION_FAMILIES.defender]: [
    { label: 'Front-Foot Defender', metrics: ['tackle_success', 'def_actions_p90', 'def_engagement', 'interceptions'] },
    { label: 'Ball-Playing Defender', metrics: ['progressive_pass_rate', 'final_third_rate', 'ball_retention', 'key_pass_eff'] },
    { label: 'Recovery Defender', metrics: ['error_rate', 'aerial_duels_won_pct', 'interceptions', 'ball_retention'] }
  ],
  [POSITION_FAMILIES.goalkeeper]: [
    { label: 'Shot Stopper', metrics: ['save_eff', 'clean_sheet_rate', 'goals_against_p90'] },
    { label: 'Reliable Keeper', metrics: ['clean_sheet_rate', 'goals_against', 'crosses_stopped'] }
  ]
};

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
  const positionFamily = EXACT_POSITION_TO_FAMILY[exactPosition] || POSITION_FAMILIES.midfielder;
  const positionModel = EXACT_POSITION_TO_MODEL_KEY[exactPosition] || POSITION_MODEL_KEYS.centralMidfielder;

  return {
    listedPositions,
    exactPosition,
    exactPositionGroup,
    positionModel,
    secondaryPositionGroupCandidate: resolveSecondaryPositionGroupCandidate(listedPositions),
    positionFamily,
    positionFamilyLabel: POSITION_FAMILY_LABELS[positionFamily]
  };
}

export function resolveExactPositionGroup(player) {
  return getPositionContext(player).exactPositionGroup;
}

export function resolvePositionGroup(player) {
  return resolveExactPositionGroup(player);
}

export function resolvePositionFamily(player) {
  return getPositionContext(player).positionFamily;
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
    ...CATEGORY_METRICS.attack,
    ...CATEGORY_METRICS.creativity,
    ...CATEGORY_METRICS.possession,
    ...CATEGORY_METRICS.defending,
    ...GOALKEEPER_DEFENDING_METRICS
  ]);
  const positionModel = OVR_POSITION_MODELS[EXACT_POSITION_GROUP_TO_MODEL_KEY[positionGroup]];

  for (const category of positionModel?.categories || []) {
    for (const metric of category.metrics) {
      metricKeys.add(metric.key);
    }
  }

  const roleFormulas = TACTICAL_ROLE_FORMULAS[positionGroup] || {};

  for (const roleMetrics of Object.values(roleFormulas)) {
    for (const [metricKey] of roleMetrics) {
      metricKeys.add(metricKey);
    }
  }

  return [...metricKeys];
}

function getAllComparableMetricKeys() {
  const metricKeys = new Set(Object.keys(SCOUTING_METRIC_DEFINITIONS));

  for (const positionGroup of Object.values(EXACT_POSITION_GROUPS)) {
    for (const metricKey of getMetricKeysForGroup(positionGroup)) {
      metricKeys.add(metricKey);
    }
  }

  return [...metricKeys];
}

function hasDefinedMetricValue(player, metricKey) {
  return player?.[metricKey] !== null && player?.[metricKey] !== undefined && player?.[metricKey] !== '';
}

function per30Metric(player, metricKey) {
  return roundMetricValue(safeDivide(player?.[metricKey], getEstimatedMinutes(player), 30));
}

function per30FromRate(player, metricKey) {
  return roundMetricValue(safeDivide(player?.[metricKey], 3));
}

function ratioMetric(player, numeratorKey, denominatorKey, scale = 100) {
  return roundMetricValue(safeDivide(player?.[numeratorKey], player?.[denominatorKey], scale));
}

function getMetricSnapshot(player, metricKey) {
  const minutesPlayed = getEstimatedMinutes(player);
  const zeroSnapshot = {
    rawValue: 0,
    derivedValue: 0,
    comparableValue: 0,
    isMissing: false,
    isVolume: VOLUME_METRIC_KEYS.has(metricKey)
  };

  if (!player || minutesPlayed < 0) {
    return {
      ...zeroSnapshot,
      isMissing: true
    };
  }

  switch (metricKey) {
    case 'goals_per30': {
      if (hasDefinedMetricValue(player, 'goals')) {
        return { ...zeroSnapshot, rawValue: roundMetricValue(player.goals), derivedValue: per30Metric(player, 'goals'), comparableValue: per30Metric(player, 'goals') };
      }

      if (hasDefinedMetricValue(player, 'goals_p90')) {
        return { ...zeroSnapshot, rawValue: roundMetricValue(player.goals_p90), derivedValue: per30FromRate(player, 'goals_p90'), comparableValue: per30FromRate(player, 'goals_p90') };
      }

      return { ...zeroSnapshot, isMissing: true };
    }
    case 'goals_p90':
      return hasDefinedMetricValue(player, 'goals_p90')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.goals_p90),
            derivedValue: per30FromRate(player, 'goals_p90'),
            comparableValue: per30FromRate(player, 'goals_p90')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'assists_p90':
      return hasDefinedMetricValue(player, 'assists_p90')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.assists_p90),
            derivedValue: per30FromRate(player, 'assists_p90'),
            comparableValue: per30FromRate(player, 'assists_p90')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'shots_p90':
      return hasDefinedMetricValue(player, 'shots_p90')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.shots_p90),
            derivedValue: per30FromRate(player, 'shots_p90'),
            comparableValue: per30FromRate(player, 'shots_p90')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'shot_creating_actions_p90':
      return hasDefinedMetricValue(player, 'shot_creating_actions_p90')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.shot_creating_actions_p90),
            derivedValue: per30FromRate(player, 'shot_creating_actions_p90'),
            comparableValue: per30FromRate(player, 'shot_creating_actions_p90')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'goal_creating_actions_p90':
      return hasDefinedMetricValue(player, 'goal_creating_actions_p90')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.goal_creating_actions_p90),
            derivedValue: per30FromRate(player, 'goal_creating_actions_p90'),
            comparableValue: per30FromRate(player, 'goal_creating_actions_p90')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'goals_against_p90':
      return hasDefinedMetricValue(player, 'goals_against_p90')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.goals_against_p90),
            derivedValue: per30FromRate(player, 'goals_against_p90'),
            comparableValue: per30FromRate(player, 'goals_against_p90')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'np_goals_per30':
      return hasDefinedMetricValue(player, 'non_penalty_goals')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.non_penalty_goals),
            derivedValue: per30Metric(player, 'non_penalty_goals'),
            comparableValue: per30Metric(player, 'non_penalty_goals')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'xg_per30':
      return hasDefinedMetricValue(player, 'expected_goals')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.expected_goals),
            derivedValue: per30Metric(player, 'expected_goals'),
            comparableValue: per30Metric(player, 'expected_goals')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'assists_per30':
      return hasDefinedMetricValue(player, 'assists')
        ? { ...zeroSnapshot, rawValue: roundMetricValue(player.assists), derivedValue: per30Metric(player, 'assists'), comparableValue: per30Metric(player, 'assists') }
        : hasDefinedMetricValue(player, 'assists_p90')
          ? {
              ...zeroSnapshot,
              rawValue: roundMetricValue(player.assists_p90),
              derivedValue: per30FromRate(player, 'assists_p90'),
              comparableValue: per30FromRate(player, 'assists_p90')
            }
          : { ...zeroSnapshot, isMissing: true };
    case 'shots_per30':
      return hasDefinedMetricValue(player, 'total_shots')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.total_shots),
            derivedValue: per30Metric(player, 'total_shots'),
            comparableValue: per30Metric(player, 'total_shots')
          }
        : hasDefinedMetricValue(player, 'shots_p90')
          ? {
              ...zeroSnapshot,
              rawValue: roundMetricValue(player.shots_p90),
              derivedValue: per30FromRate(player, 'shots_p90'),
              comparableValue: per30FromRate(player, 'shots_p90')
            }
          : { ...zeroSnapshot, isMissing: true };
    case 'key_passes_per30':
    case 'progressive_passes_per30':
    case 'progressive_carries_per30':
    case 'passes_attempted_per30':
    case 'passes_completed_per30':
    case 'passes_into_final_third_per30':
    case 'passes_into_penalty_area_per30':
    case 'tackles_won_per30':
    case 'tackles_attempted_per30':
    case 'interceptions_per30':
    case 'clearances_per30':
    case 'passes_blocked_per30':
    case 'shots_blocked_per30':
    case 'saves_per30':
    case 'crosses_stopped_per30':
    case 'carries_into_final_third_per30':
    case 'carries_into_penalty_area_per30':
    case 'possessions_lost_per30':
    case 'errors_made_per30':
    case 'take_on_attempts_per30': {
      const sourceKeyMap = {
        key_passes_per30: 'key_passes',
        progressive_passes_per30: 'progressive_passes',
        progressive_carries_per30: 'progressive_carries',
        passes_attempted_per30: 'passes_attempted',
        passes_completed_per30: 'passes_completed',
        passes_into_final_third_per30: 'passes_into_final_third',
        passes_into_penalty_area_per30: 'passes_into_penalty_area',
        tackles_won_per30: 'tackles_won',
        tackles_attempted_per30: 'tackles_attempted',
        interceptions_per30: 'interceptions',
        clearances_per30: 'clearances',
        passes_blocked_per30: 'passes_blocked',
        shots_blocked_per30: 'shots_blocked',
        saves_per30: 'saves',
        crosses_stopped_per30: 'crosses_stopped',
        carries_into_final_third_per30: 'carries_final_3rd',
        carries_into_penalty_area_per30: 'carries_penalty_area',
        possessions_lost_per30: 'possessions_lost',
        errors_made_per30: 'errors_made',
        take_on_attempts_per30: 'take_ons_attempted'
      };
      const sourceKey = sourceKeyMap[metricKey];
      return hasDefinedMetricValue(player, sourceKey)
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player[sourceKey]),
            derivedValue: per30Metric(player, sourceKey),
            comparableValue: per30Metric(player, sourceKey)
          }
        : { ...zeroSnapshot, isMissing: true };
    }
    case 'goals_against_per30':
      return hasDefinedMetricValue(player, 'goals_against')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.goals_against),
            derivedValue: per30Metric(player, 'goals_against'),
            comparableValue: per30Metric(player, 'goals_against')
          }
        : hasDefinedMetricValue(player, 'goals_against_p90')
          ? {
              ...zeroSnapshot,
              rawValue: roundMetricValue(player.goals_against_p90),
              derivedValue: per30FromRate(player, 'goals_against_p90'),
              comparableValue: per30FromRate(player, 'goals_against_p90')
            }
          : { ...zeroSnapshot, isMissing: true };
    case 'shot_creating_actions_per30':
      return hasDefinedMetricValue(player, 'shot_creating_actions_p90')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.shot_creating_actions_p90),
            derivedValue: per30FromRate(player, 'shot_creating_actions_p90'),
            comparableValue: per30FromRate(player, 'shot_creating_actions_p90')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'goal_creating_actions_per30':
      return hasDefinedMetricValue(player, 'goal_creating_actions_p90')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.goal_creating_actions_p90),
            derivedValue: per30FromRate(player, 'goal_creating_actions_p90'),
            comparableValue: per30FromRate(player, 'goal_creating_actions_p90')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'key_passes':
    case 'progressive_passes':
    case 'progressive_carries':
    case 'passes_attempted':
    case 'passes_completed':
    case 'passes_into_final_third':
    case 'passes_into_penalty_area':
    case 'tackles_won':
    case 'tackles_attempted':
    case 'interceptions':
    case 'clearances':
    case 'passes_blocked':
    case 'shots_blocked':
    case 'saves':
    case 'crosses_stopped':
    case 'carries_final_3rd':
    case 'carries_penalty_area':
    case 'take_ons_attempted':
    case 'clean_sheets':
    case 'errors_made':
      return hasDefinedMetricValue(player, metricKey)
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player[metricKey]),
            derivedValue: per30Metric(player, metricKey),
            comparableValue: per30Metric(player, metricKey)
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'blocks_per30': {
      const hasPassBlocks = hasDefinedMetricValue(player, 'passes_blocked');
      const hasShotBlocks = hasDefinedMetricValue(player, 'shots_blocked');

      if (!hasPassBlocks && !hasShotBlocks) {
        return { ...zeroSnapshot, isMissing: true };
      }

      const rawValue = toNumber(player?.passes_blocked) + toNumber(player?.shots_blocked);
      return {
        ...zeroSnapshot,
        rawValue: roundMetricValue(rawValue),
        derivedValue: roundMetricValue(safeDivide(rawValue, minutesPlayed, 30)),
        comparableValue: roundMetricValue(safeDivide(rawValue, minutesPlayed, 30))
      };
    }
    case 'successful_take_ons_per30': {
      const attemptsAvailable = hasDefinedMetricValue(player, 'take_ons_attempted');
      const successAvailable = hasDefinedMetricValue(player, 'successful_take_ons_pct');

      if (!attemptsAvailable || !successAvailable) {
        return { ...zeroSnapshot, isMissing: true };
      }

      const successfulTakeOns = safeDivide(player?.take_ons_attempted * player?.successful_take_ons_pct, 100);
      return {
        ...zeroSnapshot,
        rawValue: roundMetricValue(successfulTakeOns),
        derivedValue: roundMetricValue(safeDivide(successfulTakeOns, minutesPlayed, 30)),
        comparableValue: roundMetricValue(safeDivide(successfulTakeOns, minutesPlayed, 30))
      };
    }
    case 'times_tackled_during_take_on_per30':
      return hasDefinedMetricValue(player, 'times_tackled_during_take_on')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.times_tackled_during_take_on),
            derivedValue: per30Metric(player, 'times_tackled_during_take_on'),
            comparableValue: per30Metric(player, 'times_tackled_during_take_on')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'take_on_success_pct':
      return hasDefinedMetricValue(player, 'successful_take_ons_pct')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.successful_take_ons_pct),
            derivedValue: roundMetricValue(player.successful_take_ons_pct),
            comparableValue: roundMetricValue(player.successful_take_ons_pct),
            isVolume: false
          }
        : { ...zeroSnapshot, isMissing: true, isVolume: false };
    case 'aerial_duel_win_pct':
      return hasDefinedMetricValue(player, 'aerial_duels_won_pct')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.aerial_duels_won_pct),
            derivedValue: roundMetricValue(player.aerial_duels_won_pct),
            comparableValue: roundMetricValue(player.aerial_duels_won_pct),
            isVolume: false
          }
        : { ...zeroSnapshot, isMissing: true, isVolume: false };
    case 'tackle_success_pct':
      return hasDefinedMetricValue(player, 'dribbles_tackled_pct')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.dribbles_tackled_pct),
            derivedValue: roundMetricValue(player.dribbles_tackled_pct),
            comparableValue: roundMetricValue(player.dribbles_tackled_pct),
            isVolume: false
          }
        : hasDefinedMetricValue(player, 'tackles_attempted') && hasDefinedMetricValue(player, 'tackles_won')
          ? {
              ...zeroSnapshot,
              rawValue: roundMetricValue(player.tackles_won),
              derivedValue: ratioMetric(player, 'tackles_won', 'tackles_attempted'),
              comparableValue: ratioMetric(player, 'tackles_won', 'tackles_attempted'),
              isVolume: false
            }
          : { ...zeroSnapshot, isMissing: true, isVolume: false };
    case 'expected_goals':
      return hasDefinedMetricValue(player, 'expected_goals')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.expected_goals),
            derivedValue: per30Metric(player, 'expected_goals'),
            comparableValue: per30Metric(player, 'expected_goals')
          }
        : { ...zeroSnapshot, isMissing: true };
    case 'times_tackled_during_take_on':
      return hasDefinedMetricValue(player, 'times_tackled_during_take_on')
        ? {
            ...zeroSnapshot,
            rawValue: roundMetricValue(player.times_tackled_during_take_on),
            derivedValue: ratioMetric(player, 'times_tackled_during_take_on', 'take_ons_attempted'),
            comparableValue: ratioMetric(player, 'times_tackled_during_take_on', 'take_ons_attempted'),
            isVolume: false
          }
        : { ...zeroSnapshot, isMissing: true, isVolume: false };
    default: {
      const value = calculateScoutingMetricValue(player, metricKey);
      return {
        ...zeroSnapshot,
        rawValue: roundMetricValue(player?.[metricKey]),
        derivedValue: roundMetricValue(value),
        comparableValue: roundMetricValue(value),
        isMissing: !hasDefinedMetricValue(player, metricKey) && !Number.isFinite(value)
      };
    }
  }
}

export function getComparableMetricValue(player, metricKey) {
  return getMetricSnapshot(player, metricKey).comparableValue;
}

export function getEstimatedMinutes(player) {
  const directMinutes = toNumber(player?.minutes_played || player?.minutes);

  if (directMinutes > 0) {
    return directMinutes;
  }

  const rawMinutes = toNumber(player?.avg_mins_per_match);
  const matchesPlayed = toNumber(player?.matches_played);

  if (!rawMinutes) {
    return matchesPlayed * 90;
  }

  // Some imported tables still store total minutes in avg_mins_per_match.
  // Treat anything well above a single-match ceiling as total minutes so
  // per-30 values and reliability penalties stay grounded.
  if (rawMinutes > 130 || matchesPlayed <= 1) {
    return rawMinutes;
  }

  return rawMinutes * matchesPlayed;
}

function createPoolBucket() {
  return {
    players: [],
    metrics: {}
  };
}

function buildPoolMetricLookup(players = []) {
  const metricKeys = getAllComparableMetricKeys();
  const lookup = {
    exactPosition: {},
    positionGroup: Object.fromEntries(Object.values(EXACT_POSITION_GROUPS).map((positionGroup) => [positionGroup, createPoolBucket()])),
    positionFamily: Object.fromEntries(Object.values(POSITION_FAMILIES).map((positionFamily) => [positionFamily, createPoolBucket()])),
    league: {},
    all: createPoolBucket()
  };

  for (const player of players) {
    const positionContext = getPositionContext(player);
    const leagueKey = getPlayerLeagueKey(player);

    if (!lookup.exactPosition[positionContext.exactPosition]) {
      lookup.exactPosition[positionContext.exactPosition] = createPoolBucket();
    }

    lookup.exactPosition[positionContext.exactPosition].players.push(player);
    lookup.positionGroup[positionContext.exactPositionGroup].players.push(player);
    lookup.positionFamily[positionContext.positionFamily].players.push(player);
    lookup.all.players.push(player);

    if (!lookup.league[leagueKey]) {
      lookup.league[leagueKey] = createPoolBucket();
    }

    lookup.league[leagueKey].players.push(player);
  }

  function hydrateBucket(bucket) {
    for (const metricKey of metricKeys) {
      bucket.metrics[metricKey] = bucket.players
        .map((player) => getComparableMetricValue(player, metricKey))
        .filter((value) => Number.isFinite(value))
        .sort((left, right) => left - right);
    }
  }

  for (const bucket of Object.values(lookup.exactPosition)) {
    hydrateBucket(bucket);
  }

  for (const bucket of Object.values(lookup.positionGroup)) {
    hydrateBucket(bucket);
  }

  for (const bucket of Object.values(lookup.positionFamily)) {
    hydrateBucket(bucket);
  }

  for (const bucket of Object.values(lookup.league)) {
    hydrateBucket(bucket);
  }

  hydrateBucket(lookup.all);

  return lookup;
}

function resolveMetricPool(metricLookup, player, positionContext, metricKey) {
  const poolCandidates = [
    {
      type: 'exact_position',
      label: positionContext.exactPosition,
      values: metricLookup.exactPosition[positionContext.exactPosition]?.metrics?.[metricKey] || []
    },
    {
      type: 'position_group',
      label: `${positionContext.exactPositionGroup.replace(/_/g, ' ')} group`,
      values: metricLookup.positionGroup[positionContext.exactPositionGroup]?.metrics?.[metricKey] || []
    },
    {
      type: 'position_family',
      label: `${positionContext.positionFamily} family`,
      values: metricLookup.positionFamily[positionContext.positionFamily]?.metrics?.[metricKey] || []
    },
    {
      type: 'league',
      label: getPlayerLeagueLabel(player),
      values: metricLookup.league[getPlayerLeagueKey(player)]?.metrics?.[metricKey] || []
    },
    {
      type: 'global',
      label: 'global pool',
      values: metricLookup.all.metrics?.[metricKey] || []
    }
  ];

  return (
    poolCandidates.find((candidate) => candidate.values.length >= MINIMUM_NORMALIZATION_POOL_SIZE) ||
    poolCandidates.find((candidate) => candidate.values.length) ||
    { type: 'global', label: 'global pool', values: [] }
  );
}

function applyPercentileSoftCap(normalizedScore) {
  const score = clamp(normalizedScore, 0, 1);

  if (score <= 0.95) {
    return score;
  }

  return 0.95 + (score - 0.95) * 0.4;
}

function getMetricPercentile(metricLookup, player, positionContext, metricKey, invert = false) {
  const pool = resolveMetricPool(metricLookup, player, positionContext, metricKey);
  const snapshot = getMetricSnapshot(player, metricKey);

  if (snapshot.isMissing || !Number.isFinite(snapshot.comparableValue)) {
    return {
      ...snapshot,
      percentile: null,
      normalizedScore: null,
      pool
    };
  }

  const basePercentile = getPercentile(pool.values, snapshot.comparableValue);
  const normalizedPercentile = clamp(basePercentile / 100, 0, 1);
  const scoredPercentile = invert ? 1 - normalizedPercentile : normalizedPercentile;
  const normalizedScore = applyPercentileSoftCap(scoredPercentile);

  return {
    ...snapshot,
    rawPercentile: Number((normalizedPercentile * 100).toFixed(1)),
    percentile: Number((scoredPercentile * 100).toFixed(1)),
    normalizedScore: Number(normalizedScore.toFixed(3)),
    pool
  };
}

function calculateWeightedPercentile(metricWeights, player, metricLookup, positionContext = getPositionContext(player)) {
  let weightedTotal = 0;
  let appliedWeight = 0;
  const normalizedMetricBreakdown = [];

  for (const [metricKey, weight, invert = INVERSE_METRICS.has(metricKey)] of metricWeights) {
    const metricResult = getMetricPercentile(metricLookup, player, positionContext, metricKey, invert);

    if (!Number.isFinite(metricResult.normalizedScore)) {
      continue;
    }

    const weightedContribution = metricResult.normalizedScore * weight;
    weightedTotal += metricResult.normalizedScore * 100 * weight;
    appliedWeight += weight;
    normalizedMetricBreakdown.push({
      key: metricKey,
      label: getReadableMetricLabel(metricKey),
      rawValue: metricResult.rawValue,
      derivedValue: metricResult.derivedValue,
      comparableValue: metricResult.comparableValue,
      rawPercentile: metricResult.rawPercentile,
      percentile: metricResult.percentile,
      normalizedScore: metricResult.normalizedScore,
      weight,
      contribution: Number((weightedContribution * 100).toFixed(2)),
      weightedContribution: Number(weightedContribution.toFixed(3)),
      weightedPercentilePoints: Number((metricResult.normalizedScore * 100 * weight).toFixed(2)),
      invert,
      helped: metricResult.normalizedScore >= 0.55,
      impact: metricResult.normalizedScore >= 0.55 ? 'helped' : metricResult.normalizedScore <= 0.45 ? 'hurt' : 'neutral',
      poolType: metricResult.pool.type,
      poolLabel: metricResult.pool.label,
      poolSize: metricResult.pool.values.length
    });
  }

  if (!appliedWeight) {
    return {
      weightedPercentileScore: 50,
      normalizedMetricBreakdown: []
    };
  }

  return {
    weightedPercentileScore: weightedTotal / appliedWeight,
    normalizedMetricBreakdown
  };
}

function getAveragedPercentile(metricLookup, player, positionContext, metricKeys, inverseMetricKeys = new Set()) {
  const availableScores = metricKeys
    .map((metricKey) => getMetricPercentile(metricLookup, player, positionContext, metricKey, inverseMetricKeys.has(metricKey)).percentile)
    .filter((score) => Number.isFinite(score));

  if (!availableScores.length) {
    return 50;
  }

  return availableScores.reduce((total, score) => total + score, 0) / availableScores.length;
}

function calculateScoutingMetricValue(player, metricKey) {
  const minutes = getEstimatedMinutes(player);
  const totalShots = toNumber(player?.total_shots);
  const expectedGoals = toNumber(player?.expected_goals);
  const goals = toNumber(player?.goals);
  const passesAttempted = toNumber(player?.passes_attempted);
  const progressiveCarries = toNumber(player?.progressive_carries);
  const takeOnsAttempted = toNumber(player?.take_ons_attempted);
  const possessionsLost = toNumber(player?.possessions_lost);
  const tacklesAttempted = toNumber(player?.tackles_attempted);
  const tacklesWon = toNumber(player?.tackles_won);
  const interceptions = toNumber(player?.interceptions);
  const clearances = toNumber(player?.clearances);
  const passesBlocked = toNumber(player?.passes_blocked);
  const shotsBlocked = toNumber(player?.shots_blocked);
  const defensiveActions = tacklesWon + interceptions + clearances + passesBlocked + shotsBlocked;
  const defensiveEngagements = tacklesAttempted + interceptions + passesBlocked + shotsBlocked;

  switch (metricKey) {
    case 'xg_diff':
      return roundMetricValue(goals - expectedGoals);
    case 'xg_per_shot':
      return roundMetricValue(safeDivide(expectedGoals, totalShots));
    case 'finishing_ratio':
      return roundMetricValue(safeDivide(goals, expectedGoals));
    case 'key_pass_eff':
      return roundMetricValue(safeDivide(player?.assists, player?.key_passes, 100));
    case 'progressive_pass_rate':
      return roundMetricValue(safeDivide(player?.progressive_passes, passesAttempted, 100));
    case 'final_third_rate':
      return roundMetricValue(safeDivide(player?.passes_into_final_third, passesAttempted, 100));
    case 'penalty_area_pass_rate':
      return roundMetricValue(safeDivide(player?.passes_into_penalty_area, passesAttempted, 100));
    case 'takeons_p90':
      return roundMetricValue(safeDivide(takeOnsAttempted, minutes, 90));
    case 'risk_index':
      return roundMetricValue(safeDivide(possessionsLost, passesAttempted + takeOnsAttempted + progressiveCarries, 100));
    case 'ball_retention':
      return roundMetricValue(safeDivide(player?.passes_completed, toNumber(player?.passes_completed) + possessionsLost, 100));
    case 'carry_final_third_rate':
      return roundMetricValue(safeDivide(player?.carries_final_3rd, progressiveCarries, 100));
    case 'carry_penalty_rate':
      return roundMetricValue(safeDivide(player?.carries_penalty_area, progressiveCarries, 100));
    case 'tackle_success':
      return roundMetricValue(safeDivide(tacklesWon, tacklesAttempted, 100));
    case 'def_actions':
      return roundMetricValue(defensiveActions);
    case 'def_actions_p90':
      return roundMetricValue(safeDivide(defensiveActions, minutes, 90));
    case 'def_engagement':
      return roundMetricValue(safeDivide(defensiveEngagements, minutes, 90));
    case 'error_rate':
      return roundMetricValue(safeDivide(player?.errors_made, minutes, 90));
    case 'save_eff':
      return roundMetricValue(player?.saves_pct);
    case 'clean_sheet_rate':
      return roundMetricValue(player?.clean_sheets_pct);
    default:
      return roundMetricValue(player?.[metricKey]);
  }
}

function getScoutingMetricStatus(percentile) {
  if (percentile >= 67) {
    return 'positive';
  }

  if (percentile >= 34) {
    return 'average';
  }

  return 'negative';
}

function getRelevantScoutingMetricKeys(positionFamily) {
  return SCOUTING_SECTION_ORDER.flatMap((sectionKey) =>
    (SCOUTING_SECTION_METRIC_KEYS[sectionKey] || []).filter((metricKey) =>
      SCOUTING_METRIC_DEFINITIONS[metricKey]?.relevantFamilies?.includes(positionFamily)
    )
  ).filter((metricKey, index, metricKeys) => metricKeys.indexOf(metricKey) === index);
}

function buildScoutingMetricContext(players) {
  const familyLookup = Object.fromEntries(
    Object.values(POSITION_FAMILIES).map((positionFamily) => [
      positionFamily,
      {
        metrics: {},
        snapshots: []
      }
    ])
  );
  const snapshotsByKey = {};

  for (const player of players) {
    const uniqueKey = getRatingLookupKey(player);
    const nameKey = normalizeString(player?.player || '');

    if (!uniqueKey) {
      continue;
    }

    const positionFamily = resolvePositionFamily(player);
    const rawMetrics = Object.fromEntries(
      Object.keys(SCOUTING_METRIC_DEFINITIONS).map((metricKey) => [metricKey, calculateScoutingMetricValue(player, metricKey)])
    );

    familyLookup[positionFamily].snapshots.push(rawMetrics);
    snapshotsByKey[uniqueKey] = {
      positionFamily,
      rawMetrics
    };

    if (nameKey && !snapshotsByKey[nameKey]) {
      snapshotsByKey[nameKey] = {
        positionFamily,
        rawMetrics
      };
    }
  }

  for (const positionFamily of Object.values(POSITION_FAMILIES)) {
    for (const metricKey of getRelevantScoutingMetricKeys(positionFamily)) {
      familyLookup[positionFamily].metrics[metricKey] = familyLookup[positionFamily].snapshots
        .map((snapshot) => toNumber(snapshot[metricKey]))
        .sort((left, right) => left - right);
    }
  }

  return {
    familyLookup,
    snapshotsByKey
  };
}

function buildScoutingMetricMap(positionFamily, rawMetrics, scoutingLookup) {
  return Object.fromEntries(
    getRelevantScoutingMetricKeys(positionFamily).map((metricKey) => {
      const definition = SCOUTING_METRIC_DEFINITIONS[metricKey];
      const value = rawMetrics[metricKey];
      const sortedValues = scoutingLookup[positionFamily]?.metrics?.[metricKey] || [];
      const percentile = definition?.invert ? getInversePercentile(sortedValues, value) : getPercentile(sortedValues, value);

      return [
        metricKey,
        {
          key: metricKey,
          label: definition.label,
          tooltip: definition.tooltip,
          section: definition.section,
          format: definition.format,
          invert: Boolean(definition.invert),
          value,
          percentile: Number(percentile.toFixed(1)),
          status: getScoutingMetricStatus(percentile)
        }
      ];
    })
  );
}

function getMetricPriorityIndex(metricKey, positionFamily) {
  const priorityKeys = POSITION_PRIORITY_METRICS[positionFamily] || [];
  const priorityIndex = priorityKeys.indexOf(metricKey);

  if (priorityIndex !== -1) {
    return priorityIndex;
  }

  const sectionMetricKeys = SCOUTING_SECTION_METRIC_KEYS[SCOUTING_METRIC_DEFINITIONS[metricKey]?.section] || [];
  return priorityKeys.length + Math.max(sectionMetricKeys.indexOf(metricKey), 0);
}

function buildScoutingSections(positionFamily, metricMap) {
  return SCOUTING_SECTION_ORDER.map((sectionKey) => {
    if (sectionKey === 'goalkeeping' && positionFamily !== POSITION_FAMILIES.goalkeeper) {
      return null;
    }

    if (sectionKey !== 'goalkeeping' && positionFamily === POSITION_FAMILIES.goalkeeper) {
      return null;
    }

    const metrics = (SCOUTING_SECTION_METRIC_KEYS[sectionKey] || [])
      .filter((metricKey) => SCOUTING_METRIC_DEFINITIONS[metricKey]?.relevantFamilies?.includes(positionFamily))
      .map((metricKey) => metricMap[metricKey])
      .filter(Boolean)
      .sort((left, right) => {
        const priorityDiff = getMetricPriorityIndex(left.key, positionFamily) - getMetricPriorityIndex(right.key, positionFamily);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return right.percentile - left.percentile;
      });

    if (!metrics.length) {
      return null;
    }

    return {
      ...SCOUTING_SECTION_META[sectionKey],
      metrics,
      compactCount: Math.min(4, metrics.length)
    };
  }).filter(Boolean);
}

function getAverageMetricPercentile(metricMap, metricKeys) {
  const relevantMetrics = metricKeys.map((metricKey) => metricMap[metricKey]).filter(Boolean);

  if (!relevantMetrics.length) {
    return 0;
  }

  return relevantMetrics.reduce((total, metric) => total + metric.percentile, 0) / relevantMetrics.length;
}

function buildPlayerArchetype(positionFamily, metricMap) {
  const profiles = ARCHETYPE_PROFILES[positionFamily] || [];

  if (!profiles.length) {
    return POSITION_FAMILY_LABELS[positionFamily] || 'Profile';
  }

  return profiles
    .map((profile) => ({
      label: profile.label,
      score: getAverageMetricPercentile(metricMap, profile.metrics)
    }))
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label))[0]?.label;
}

function getSeasonModel(positionContext) {
  return SEASON_OVR_POSITION_MODELS[positionContext.positionModel] || SEASON_OVR_POSITION_MODELS[POSITION_MODEL_KEYS.centralMidfielder];
}

function getSeasonMetricValue(player, metricKey) {
  const minutes = getEstimatedMinutes(player);

  switch (metricKey) {
    case 'blocks_total':
      return roundMetricValue(toNumber(player?.passes_blocked) + toNumber(player?.shots_blocked));
    case 'successful_take_ons_total':
      return roundMetricValue(safeDivide(toNumber(player?.take_ons_attempted) * toNumber(player?.successful_take_ons_pct), 100));
    case 'shot_creating_actions_total':
      return roundMetricValue((toNumber(player?.shot_creating_actions_p90) * minutes) / 90);
    case 'goal_creating_actions_total':
      return roundMetricValue((toNumber(player?.goal_creating_actions_p90) * minutes) / 90);
    case 'take_on_success_pct':
      return roundMetricValue(player?.successful_take_ons_pct);
    case 'aerial_duel_win_pct':
      return roundMetricValue(player?.aerial_duels_won_pct);
    case 'tackle_success_pct':
      return hasDefinedMetricValue(player, 'dribbles_tackled_pct')
        ? roundMetricValue(player?.dribbles_tackled_pct)
        : ratioMetric(player, 'tackles_won', 'tackles_attempted');
    default:
      return roundMetricValue(player?.[metricKey]);
  }
}

function getSeasonModelMetricKeys() {
  const metricKeys = new Set();

  for (const model of Object.values(SEASON_OVR_POSITION_MODELS)) {
    for (const category of model.categories) {
      for (const metric of category.metrics) {
        metricKeys.add(metric.key);
      }
    }
  }

  for (const model of Object.values(POSITION_CATEGORY_MODELS)) {
    for (const metrics of Object.values(model || {})) {
      for (const metric of metrics || []) {
        metricKeys.add(metric.key);
      }
    }
  }

  for (const metrics of Object.values(BASE_OUTPUT_MODELS)) {
    for (const metric of metrics || []) {
      metricKeys.add(metric.key);
    }
  }

  for (const templates of Object.values(ROLE_TEMPLATE_DEFINITIONS)) {
    for (const template of templates || []) {
      for (const metric of template.support || []) {
        metricKeys.add(metric.key);
      }
    }
  }

  return [...metricKeys];
}

function buildSeasonMetricLookup(players = []) {
  const metricKeys = getSeasonModelMetricKeys();
  const lookup = {
    exactPosition: {},
    positionGroup: Object.fromEntries(Object.values(EXACT_POSITION_GROUPS).map((positionGroup) => [positionGroup, createPoolBucket()])),
    positionFamily: Object.fromEntries(Object.values(POSITION_FAMILIES).map((positionFamily) => [positionFamily, createPoolBucket()])),
    league: {},
    all: createPoolBucket()
  };

  for (const player of players) {
    const positionContext = getPositionContext(player);
    const leagueKey = getPlayerLeagueKey(player);

    if (!lookup.exactPosition[positionContext.exactPosition]) {
      lookup.exactPosition[positionContext.exactPosition] = createPoolBucket();
    }

    lookup.exactPosition[positionContext.exactPosition].players.push(player);
    lookup.positionGroup[positionContext.exactPositionGroup].players.push(player);
    lookup.positionFamily[positionContext.positionFamily].players.push(player);
    lookup.all.players.push(player);

    if (!lookup.league[leagueKey]) {
      lookup.league[leagueKey] = createPoolBucket();
    }

    lookup.league[leagueKey].players.push(player);
  }

  function hydrateBucket(bucket) {
    for (const metricKey of metricKeys) {
      bucket.metrics[metricKey] = bucket.players
        .map((player) => getSeasonMetricValue(player, metricKey))
        .filter((value) => Number.isFinite(value))
        .sort((left, right) => left - right);
    }
  }

  for (const bucket of Object.values(lookup.exactPosition)) {
    hydrateBucket(bucket);
  }

  for (const bucket of Object.values(lookup.positionGroup)) {
    hydrateBucket(bucket);
  }

  for (const bucket of Object.values(lookup.positionFamily)) {
    hydrateBucket(bucket);
  }

  for (const bucket of Object.values(lookup.league)) {
    hydrateBucket(bucket);
  }

  hydrateBucket(lookup.all);
  return lookup;
}

function getSeasonMetricSnapshot(player, metricKey) {
  const comparableValue = getSeasonMetricValue(player, metricKey);

  return {
    rawValue: comparableValue,
    comparableValue,
    isMissing: !Number.isFinite(comparableValue)
  };
}

function getSeasonMetricPercentile(seasonLookup, player, positionContext, metricKey, invert = false) {
  const pool = resolveMetricPool(seasonLookup, player, positionContext, metricKey);
  const snapshot = getSeasonMetricSnapshot(player, metricKey);

  if (snapshot.isMissing) {
    return {
      ...snapshot,
      rawPercentile: null,
      percentile: null,
      normalizedScore: null,
      pool
    };
  }

  const basePercentile = getPercentile(pool.values, snapshot.comparableValue);
  const normalizedPercentile = clamp(basePercentile / 100, 0, 1);
  const scoredPercentile = invert ? 1 - normalizedPercentile : normalizedPercentile;

  return {
    ...snapshot,
    rawPercentile: Number((normalizedPercentile * 100).toFixed(1)),
    percentile: Number((scoredPercentile * 100).toFixed(1)),
    normalizedScore: Number(applyPercentileSoftCap(scoredPercentile).toFixed(3)),
    pool
  };
}

function transformBaseOutputMetric(rawValue, target) {
  const safeValue = Math.max(toNumber(rawValue), 0);
  const safeTarget = Math.max(toNumber(target), 1);
  return clamp(Math.sqrt(Math.min(safeValue, safeTarget * 1.4) / safeTarget), 0, 1.08);
}

function calculateBaseOutputScore(player, positionContext) {
  const outputModel = BASE_OUTPUT_MODELS[positionContext.positionModel] || BASE_OUTPUT_MODELS[POSITION_MODEL_KEYS.centralMidfielder];
  const breakdown = [];
  let score = 0;

  for (const metric of outputModel) {
    const rawValue = getSeasonMetricValue(player, metric.key);
    const normalizedScore = transformBaseOutputMetric(rawValue, metric.target);
    const weightedContribution = normalizedScore * metric.weight;

    score += weightedContribution;
    breakdown.push({
      key: metric.key,
      label: metric.label,
      rawValue,
      normalizedScore: Number(normalizedScore.toFixed(3)),
      weight: metric.weight,
      contribution: Number((weightedContribution * 100).toFixed(2)),
      invert: false,
      helped: normalizedScore >= 0.55,
      impact: normalizedScore >= 0.55 ? 'helped' : normalizedScore <= 0.45 ? 'hurt' : 'neutral',
      source: 'base_output'
    });
  }

  return {
    baseOutputScore: roundScore(score * 100),
    baseOutputBreakdown: breakdown
  };
}

function calculateConsistencyScore(player, dataCoverageModifier = 1) {
  const minutesPlayed = getEstimatedMinutes(player);
  let consistencyScore = 35;

  if (minutesPlayed < 600) {
    consistencyScore = 25 + (minutesPlayed / 600) * 20;
  } else if (minutesPlayed < 1200) {
    consistencyScore = 45 + ((minutesPlayed - 600) / 600) * 17;
  } else if (minutesPlayed < 2000) {
    consistencyScore = 62 + ((minutesPlayed - 1200) / 800) * 20;
  } else if (minutesPlayed < 3000) {
    consistencyScore = 82 + ((minutesPlayed - 2000) / 1000) * 16;
  } else {
    consistencyScore = 98;
  }

  return roundScore(consistencyScore * (0.94 + 0.06 * dataCoverageModifier));
}

function pickContributionLeaders(metricBreakdown = []) {
  const actionable = metricBreakdown.filter((metric) => Number.isFinite(metric.contributionDelta));

  return {
    topPositiveContributors: [...actionable]
      .filter((metric) => metric.contributionDelta > 0)
      .sort((left, right) => right.contributionDelta - left.contributionDelta)
      .slice(0, 4),
    topNegativeContributors: [...actionable]
      .filter((metric) => metric.contributionDelta < 0)
      .sort((left, right) => left.contributionDelta - right.contributionDelta)
      .slice(0, 3)
  };
}

function mapCategoryScoreToDisplay(positionModelKey, categoryKey, normalizedScore, reliabilityModifier = 1) {
  const [minimum, maximum] = CATEGORY_DISPLAY_RANGES[positionModelKey]?.[categoryKey] || [30, 85];
  const midpoint = (minimum + maximum) / 2;
  const mappedScore = minimum + clamp(normalizedScore, 0, 1) * (maximum - minimum);
  const trustBlend = 0.86 + 0.14 * clamp(reliabilityModifier, 0, 1);
  return roundScore(midpoint + (mappedScore - midpoint) * trustBlend);
}

function buildPublicCategoryScore(positionContext, player, seasonLookup, categoryKey, reliabilityModifier = 1) {
  const categoryMetrics = POSITION_CATEGORY_MODELS[positionContext.positionModel]?.[categoryKey] || [];
  let weightedScore = 0;
  let totalWeight = 0;
  let availableWeight = 0;
  const breakdown = [];

  for (const metric of categoryMetrics) {
    const metricResult = getSeasonMetricPercentile(seasonLookup, player, positionContext, metric.key, Boolean(metric.invert));
    const normalizedScore = Number.isFinite(metricResult.normalizedScore) ? metricResult.normalizedScore : 0.5;
    const contribution = normalizedScore * metric.weight;

    totalWeight += metric.weight;

    if (Number.isFinite(metricResult.normalizedScore)) {
      availableWeight += metric.weight;
    }

    weightedScore += contribution;
    breakdown.push({
      key: metric.key,
      label: getReadableMetricLabel(metric.key),
      rawValue: metricResult.rawValue,
      comparableValue: metricResult.comparableValue,
      percentile: metricResult.percentile,
      normalizedScore: Number(normalizedScore.toFixed(3)),
      weight: metric.weight,
      contribution: Number((contribution * 100).toFixed(2)),
      invert: Boolean(metric.invert),
      helped: normalizedScore >= 0.55,
      impact: normalizedScore >= 0.55 ? 'helped' : normalizedScore <= 0.45 ? 'hurt' : 'neutral',
      missing: !Number.isFinite(metricResult.normalizedScore),
      poolType: metricResult.pool?.type || 'global',
      poolLabel: metricResult.pool?.label || 'global pool'
    });
  }

  const normalizedScore = totalWeight ? weightedScore / totalWeight : 0.5;
  const displayScore = mapCategoryScoreToDisplay(positionContext.positionModel, categoryKey, normalizedScore, reliabilityModifier);

  return {
    key: categoryKey,
    normalizedScore: Number(normalizedScore.toFixed(3)),
    displayScore,
    availableRatio: totalWeight ? Number((availableWeight / totalWeight).toFixed(3)) : 1,
    breakdown
  };
}

function getPublicCategoryLabel(categoryKey) {
  switch (categoryKey) {
    case 'attack':
      return 'Attack';
    case 'creativity':
      return 'Creativity';
    case 'possession':
      return 'Possession';
    case 'defending':
      return 'Defending';
    default:
      return formatLabelFromMetricKey(categoryKey);
  }
}

function calculateCategoryDrivenPositionScore(positionContext, publicCategoryScores = {}) {
  const categoryWeights = CATEGORY_TO_OVR_WEIGHTS[positionContext.positionModel] || CATEGORY_TO_OVR_WEIGHTS[POSITION_MODEL_KEYS.centralMidfielder];
  let weightedScore = 0;
  let totalWeight = 0;

  for (const [categoryKey, weight] of Object.entries(categoryWeights)) {
    weightedScore += toNumber(publicCategoryScores[categoryKey]) * weight;
    totalWeight += weight;
  }

  return totalWeight ? Number((weightedScore / totalWeight).toFixed(2)) : 50;
}

function getRoleTemplatesForPosition(positionContext) {
  return ROLE_TEMPLATE_DEFINITIONS[positionContext.positionModel] || [];
}

function getRoleSupportScore(template, player, seasonLookup, positionContext) {
  const supportMetrics = template?.support || [];

  if (!supportMetrics.length) {
    return 0.5;
  }

  let weightedScore = 0;
  let totalWeight = 0;

  for (const metric of supportMetrics) {
    const metricResult = getSeasonMetricPercentile(seasonLookup, player, positionContext, metric.key, Boolean(metric.invert));
    const normalizedScore = Number.isFinite(metricResult.normalizedScore) ? metricResult.normalizedScore : 0.5;
    weightedScore += normalizedScore * metric.weight;
    totalWeight += metric.weight;
  }

  return totalWeight ? weightedScore / totalWeight : 0.5;
}

function getRoleTemplateScore(template, publicCategoryScores, player, seasonLookup, positionContext) {
  const categories = ['attack', 'creativity', 'possession', 'defending'];
  let weightedMatch = 0;
  let totalWeight = 0;

  for (const categoryKey of categories) {
    const playerScore = toNumber(publicCategoryScores[categoryKey]);
    const targetScore = toNumber(template?.targets?.[categoryKey]);
    const targetWeight = 0.8 + targetScore / 100;
    const closeness = clamp(1 - Math.abs(playerScore - targetScore) / 100, 0, 1);
    weightedMatch += closeness * targetWeight;
    totalWeight += targetWeight;
  }

  const categoryFit = totalWeight ? weightedMatch / totalWeight : 0.5;
  const supportFit = getRoleSupportScore(template, player, seasonLookup, positionContext);
  return Number(((categoryFit * 0.84 + supportFit * 0.16) * 100).toFixed(2));
}

function buildRoleFitExplanation(primaryRole, secondaryRole, publicCategoryScores = {}) {
  const dominantCategories = Object.entries(publicCategoryScores)
    .filter(([, value]) => Number.isFinite(value))
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([key]) => getPublicCategoryLabel(key).toLowerCase());
  const dominantLabel = dominantCategories.length ? dominantCategories.join(' and ') : 'the strongest category mix';

  if (!primaryRole) {
    return 'Not enough information was available to derive a clearer role fit.';
  }

  if (secondaryRole && Math.abs(toNumber(primaryRole.score) - toNumber(secondaryRole.score)) <= 4) {
    return `${dominantLabel} pull the profile toward a hybrid between ${primaryRole.label} and ${secondaryRole.label}.`;
  }

  return `${dominantLabel} are the clearest strengths, which makes ${primaryRole.label} the strongest role fit.`;
}

function derivePlayerArchetype(positionContext, rankedRoleScores = [], publicCategoryScores = {}, categoryBreakdowns = {}) {
  const primaryRole = rankedRoleScores[0];
  const secondaryRole = rankedRoleScores[1];
  const dominantCategories = Object.entries(publicCategoryScores)
    .filter(([, value]) => Number.isFinite(value))
    .sort((left, right) => right[1] - left[1]);
  const primaryLabel = primaryRole?.label || POSITION_FAMILY_LABELS[positionContext.positionFamily] || 'Profile';
  const secondaryLabel = secondaryRole && Math.abs(toNumber(primaryRole?.score) - toNumber(secondaryRole?.score)) <= 4 ? secondaryRole.label : null;
  const leadCategory = dominantCategories[0]?.[0];
  const supportCategory = dominantCategories[1]?.[0];
  const leadMetric = categoryBreakdowns?.[leadCategory]?.breakdown
    ?.filter((metric) => !metric.missing)
    ?.sort((left, right) => right.normalizedScore - left.normalizedScore)[0];
  const leadBits = [getPublicCategoryLabel(leadCategory).toLowerCase(), supportCategory ? getPublicCategoryLabel(supportCategory).toLowerCase() : null].filter(Boolean);
  const explanation = secondaryLabel
    ? `${leadBits.join(' and ')} shape a ${primaryLabel} profile with a secondary ${secondaryLabel.toLowerCase()} tendency${leadMetric ? `, led by ${leadMetric.label.toLowerCase()}` : ''}.`
    : `${leadBits.join(' and ')} make ${primaryLabel} the clearest archetype${leadMetric ? `, with ${leadMetric.label.toLowerCase()} as a standout supporting trait` : ''}.`;

  return {
    label: primaryLabel,
    secondaryLabel,
    explanation
  };
}

function getPositionModel(positionContext) {
  return getSeasonModel(positionContext);
}

function getCoverageProfile(availableMetricCount, totalMetricCount) {
  const dataCoverageRatio = totalMetricCount ? clamp(availableMetricCount / totalMetricCount, 0, 1) : 1;
  const dataCoverageModifier = Number((0.92 + 0.08 * dataCoverageRatio).toFixed(3));

  return {
    availableMetricCount,
    totalMetricCount,
    dataCoverageRatio: Number(dataCoverageRatio.toFixed(3)),
    dataCoverageModifier
  };
}

function mapCompositeScoreToOvr(basePositionScore, reliabilityModifier = 1, dataCoverageModifier = 1) {
  const normalizedComposite = clamp((toNumber(basePositionScore) / 100) * reliabilityModifier * dataCoverageModifier, 0, 1);
  let mapped = OVR_MINIMUM_SCORE + OVR_SCORE_SPAN * Math.pow(normalizedComposite, 1.2);

  if (normalizedComposite >= 0.985 && reliabilityModifier >= 1 && dataCoverageModifier >= 0.99) {
    mapped += 2;
  } else if (normalizedComposite >= 0.965 && reliabilityModifier >= 0.94 && dataCoverageModifier >= 0.98) {
    mapped += 1;
  }

  return roundScore(mapped);
}

export function calculateExactPositionOVR(player, metricLookup, positionGroup = resolveExactPositionGroup(player)) {
  const positionContext = getPositionContext(player);
  const positionModel = getPositionModel(positionContext);
  const modelCategories = [];
  const normalizedMetricBreakdown = [];
  let positionScore = 0;
  let totalMetricCount = 0;
  let availableMetricCount = 0;

  for (const category of positionModel.categories) {
    let categoryScore = 0;

    for (const metric of category.metrics) {
      totalMetricCount += 1;
      const metricResult = getSeasonMetricPercentile(metricLookup, player, positionContext, metric.key, Boolean(metric.invert));
      const metricScore = Number.isFinite(metricResult.normalizedScore) ? metricResult.normalizedScore : 0.5;
      const metricWeight = category.weight * metric.weight;
      const contributionDelta = (metricScore - 0.5) * metricWeight * 100;

      if (Number.isFinite(metricResult.normalizedScore)) {
        availableMetricCount += 1;
      }

      categoryScore += metricScore * metric.weight;
      normalizedMetricBreakdown.push({
        key: metric.key,
        label: getReadableMetricLabel(metric.key),
        categoryKey: category.key,
        categoryLabel: category.label,
        rawValue: metricResult.rawValue,
        comparableValue: metricResult.comparableValue,
        rawPercentile: metricResult.rawPercentile,
        percentile: metricResult.percentile,
        normalizedScore: Number(metricScore.toFixed(3)),
        weight: Number(metricWeight.toFixed(3)),
        localWeight: metric.weight,
        contribution: Number((metricScore * metricWeight * 100).toFixed(2)),
        contributionDelta: Number(contributionDelta.toFixed(2)),
        weightedContribution: Number((metricScore * metricWeight).toFixed(3)),
        invert: Boolean(metric.invert),
        missing: !Number.isFinite(metricResult.normalizedScore),
        source: 'position',
        helped: metricScore >= 0.55,
        impact: !Number.isFinite(metricResult.normalizedScore) ? 'neutral' : metricScore >= 0.55 ? 'helped' : metricScore <= 0.45 ? 'hurt' : 'neutral',
        poolType: metricResult.pool?.type || 'global',
        poolLabel: metricResult.pool?.label || 'global pool',
        poolSize: metricResult.pool?.values?.length || 0
      });
    }

    const categoryPercent = Number((categoryScore * 100).toFixed(2));
    positionScore += categoryPercent * category.weight;
    modelCategories.push({
      key: category.key,
      label: category.label,
      weight: category.weight,
      score: roundScore(categoryPercent)
    });
  }

  const coverageProfile = getCoverageProfile(availableMetricCount, totalMetricCount);
  const { baseOutputScore, baseOutputBreakdown } = calculateBaseOutputScore(player, positionContext);
  const consistencyScore = calculateConsistencyScore(player, coverageProfile.dataCoverageModifier);
  const compositeScore = 0.7 * positionScore + 0.2 * baseOutputScore + 0.1 * consistencyScore;
  const exactPositionOVR = mapCompositeScoreToOvr(compositeScore, 1, coverageProfile.dataCoverageModifier);

  return {
    exactPositionOVR,
    positionModel: positionContext.positionModel,
    positionScore: Number(positionScore.toFixed(2)),
    baseOutputScore,
    consistencyScore,
    basePositionScore: Number(compositeScore.toFixed(2)),
    weightedPercentileScore: Number(positionScore.toFixed(2)),
    normalizedMetricBreakdown: [...normalizedMetricBreakdown, ...baseOutputBreakdown],
    positionCategoryScores: modelCategories,
    ...coverageProfile
  };
}

export function calculateTacticalRoleScores(player, seasonLookup, positionGroup = resolveExactPositionGroup(player), publicCategoryScores = {}) {
  const positionContext = getPositionContext(player);
  const roleTemplates = getRoleTemplatesForPosition(positionContext);

  if (!roleTemplates.length) {
    return {
      [positionContext.positionModel]: 50
    };
  }

  return Object.fromEntries(
    roleTemplates.map((template) => [
      template.key,
      getRoleTemplateScore(template, publicCategoryScores, player, seasonLookup, positionContext)
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
  return mapCompositeScoreToOvr(roleScore, 1, 1);
}

export function calculateFinalOVR({
  exactPositionOVR,
  primaryRoleScore,
  secondaryRoleScore,
  tacticalRoleConfidence,
  roleCount = 0
}) {
  const primaryRoleOVR = mapRoleScoreToOVR(primaryRoleScore);
  const secondaryRoleSupport = mapRoleScoreToOVR(secondaryRoleScore);

  return {
    primaryRoleOVR,
    secondaryRoleSupport,
    finalOVR: roundScore(exactPositionOVR)
  };
}

function getReliabilityModifier(reliabilityScore) {
  return RELIABILITY_MINUTES_TABLE.find((entry) => reliabilityScore <= entry.max)?.modifier || 1;
}

export function getReliabilityProfile(player) {
  const minutesPlayed = getEstimatedMinutes(player);
  const matchesPlayed = toNumber(player?.matches_played);
  const reliabilityStep = RELIABILITY_MINUTES_TABLE.find((entry) => minutesPlayed <= entry.max) || RELIABILITY_MINUTES_TABLE[RELIABILITY_MINUTES_TABLE.length - 1];
  const reliabilityModifier = Number(getReliabilityModifier(minutesPlayed).toFixed(3));
  const reliabilityScore = reliabilityModifier;
  const reliabilityLabel = reliabilityStep.label;

  return {
    minutesPlayed,
    matchesPlayed,
    reliabilityScore,
    reliabilityLabel,
    reliabilityModifier
  };
}

function buildOvrExplanationNote({
  exactPosition,
  positionModel,
  primaryRoleLabel,
  reliabilityLabel,
  useBackendFallback,
  reliabilityModifier,
  dataCoverageModifier
}) {
  if (useBackendFallback) {
    return 'Frontend model did not have enough comparable data, so the stored overall rating is shown as a fallback.';
  }

  if (reliabilityLabel === 'Low') {
    return `This ${positionModel} season model blends position-category quality with real seasonal output, but the final OVR is trimmed by a lighter minutes sample (${Math.round(reliabilityModifier * 100)}% trust).`;
  }

  if (reliabilityLabel === 'Medium') {
    return `This ${positionModel} rating balances the public category profile, season output, and a moderate consistency score from the minutes sample.`;
  }

  if (dataCoverageModifier < 0.99) {
    return `This ${exactPosition} rating is driven by strong ${primaryRoleLabel.toLowerCase()} traits and season output, with a small confidence trim because some tracked inputs are missing.`;
  }

  return `This ${positionModel} rating is driven by the player's exact-position category profile, strong season-long output, and a high-trust minutes sample.`;
}

export function getReadableTacticalRoleLabel(roleKey) {
  if (!roleKey) {
    return '-';
  }

  if (TACTICAL_ROLE_LABELS[roleKey]) {
    return TACTICAL_ROLE_LABELS[roleKey];
  }

  for (const templates of Object.values(ROLE_TEMPLATE_DEFINITIONS)) {
    const template = (templates || []).find((entry) => entry.key === roleKey);

    if (template?.label) {
      return template.label;
    }
  }

  return String(roleKey)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

function buildCategoryScores(positionContext, player, metricLookup, reliabilityModifier = 1) {
  const attack = buildPublicCategoryScore(positionContext, player, metricLookup, 'attack', reliabilityModifier);
  const creativity = buildPublicCategoryScore(positionContext, player, metricLookup, 'creativity', reliabilityModifier);
  const possession = buildPublicCategoryScore(positionContext, player, metricLookup, 'possession', reliabilityModifier);
  const defending = buildPublicCategoryScore(positionContext, player, metricLookup, 'defending', reliabilityModifier);
  const publicCategoryScores = {
    attack: attack.displayScore,
    creativity: creativity.displayScore,
    possession: possession.displayScore,
    defending: defending.displayScore
  };
  const categoryDrivenPositionScore = calculateCategoryDrivenPositionScore(positionContext, publicCategoryScores);

  return {
    attackScore: attack.displayScore,
    creativityScore: creativity.displayScore,
    possessionScore: possession.displayScore,
    defendingScore: defending.displayScore,
    categoryScores: {
      attacking: attack.displayScore,
      playmaking: creativity.displayScore,
      possession: possession.displayScore,
      defending: defending.displayScore,
      goalkeeping: positionContext.exactPositionGroup === EXACT_POSITION_GROUPS.goalkeeper ? defending.displayScore : null
    },
    categoryBreakdowns: {
      attack,
      creativity,
      possession,
      defending
    },
    publicCategoryScores,
    categoryDrivenPositionScore
  };
}

export function buildPlayerRatingIndex(players = []) {
  const seasonMetricLookup = buildSeasonMetricLookup(players);
  const scoutingContext = buildScoutingMetricContext(players);
  const ratingsIndex = {};

  for (const player of players) {
    const uniqueKey = getRatingLookupKey(player);
    const nameKey = normalizeString(player?.player || '');

    if (!uniqueKey) {
      continue;
    }

    const positionContext = getPositionContext(player);
    const {
      exactPositionOVR,
      positionModel,
      positionScore,
      baseOutputScore,
      consistencyScore,
      weightedPercentileScore,
      normalizedMetricBreakdown,
      positionCategoryScores,
      availableMetricCount,
      totalMetricCount,
      dataCoverageRatio,
      dataCoverageModifier
    } = calculateExactPositionOVR(
      player,
      seasonMetricLookup,
      positionContext.exactPositionGroup
    );
    const reliabilityProfile = getReliabilityProfile(player);
    const categoryScores = buildCategoryScores(positionContext, player, seasonMetricLookup, reliabilityProfile.reliabilityModifier);
    const blendedPositionScore = Number((positionScore * 0.42 + categoryScores.categoryDrivenPositionScore * 0.58).toFixed(2));
    const blendedBasePositionScore = Number((0.7 * blendedPositionScore + 0.2 * baseOutputScore + 0.1 * consistencyScore).toFixed(2));
    const primaryRoleScoreMap = calculateTacticalRoleScores(player, seasonMetricLookup, positionContext.exactPositionGroup, categoryScores.publicCategoryScores);
    const recalculatedRankedRoles = getRankedRoleScores(primaryRoleScoreMap);
    const resolvedPrimaryRole = recalculatedRankedRoles[0] || null;
    const resolvedSecondaryRole = recalculatedRankedRoles[1] || null;
    const resolvedRoleGap = Number(Math.max((resolvedPrimaryRole?.score || 0) - (resolvedSecondaryRole?.score || 0), 0).toFixed(2));
    const resolvedRoleConfidence = getTacticalRoleConfidence(resolvedRoleGap, recalculatedRankedRoles.length);
    const primaryRoleOVR = mapRoleScoreToOVR(resolvedPrimaryRole?.score || 50);
    const secondaryRoleSupport = mapRoleScoreToOVR(resolvedSecondaryRole?.score || 50);
    const frontendFinalOVR = mapCompositeScoreToOvr(blendedBasePositionScore, 1, dataCoverageModifier);
    const scoutingSnapshot = scoutingContext.snapshotsByKey[uniqueKey] || scoutingContext.snapshotsByKey[nameKey] || {
      positionFamily: positionContext.positionFamily,
      rawMetrics: Object.fromEntries(
        Object.keys(SCOUTING_METRIC_DEFINITIONS).map((metricKey) => [metricKey, calculateScoutingMetricValue(player, metricKey)])
      )
    };
    const scoutingMetricMap = buildScoutingMetricMap(positionContext.positionFamily, scoutingSnapshot.rawMetrics, scoutingContext.familyLookup);
    const scoutingSections = buildScoutingSections(positionContext.positionFamily, scoutingMetricMap);
    const backendOverallRating = getBackendOverallRating(player);
    const backendRoleTag = getBackendRoleTag(player);
    const usableMetricCount = normalizedMetricBreakdown.filter((metric) => !metric.missing).length;
    const useBackendFallback = usableMetricCount < FRONTEND_OVR_MINIMUM_METRICS && backendOverallRating !== null;
    const finalOVR = useBackendFallback ? backendOverallRating : frontendFinalOVR;
    const contributionLeaders = pickContributionLeaders(normalizedMetricBreakdown);
    const topMetricContributors = contributionLeaders.topPositiveContributors;
    const archetype = derivePlayerArchetype(positionContext, recalculatedRankedRoles, categoryScores.publicCategoryScores, categoryScores.categoryBreakdowns);
    const explanationSummary = buildOvrExplanationNote({
      exactPosition: positionContext.exactPosition,
      positionModel,
      primaryRoleLabel: archetype.label,
      reliabilityLabel: reliabilityProfile.reliabilityLabel,
      useBackendFallback,
      reliabilityModifier: reliabilityProfile.reliabilityModifier,
      dataCoverageModifier
    });

    const ratingEntry = {
      exactPosition: positionContext.exactPosition,
      exactPositionGroup: positionContext.exactPositionGroup,
      positionModel,
      secondaryPositionGroupCandidate: positionContext.secondaryPositionGroupCandidate,
      positionFamily: positionContext.positionFamily,
      positionFamilyLabel: positionContext.positionFamilyLabel,
      tacticalRoleScores: primaryRoleScoreMap,
      primaryTacticalRole: resolvedPrimaryRole?.key || null,
      primaryTacticalRoleLabel: resolvedPrimaryRole?.label || '-',
      secondaryTacticalRole: resolvedSecondaryRole?.key || null,
      secondaryTacticalRoleLabel: resolvedSecondaryRole?.label || '-',
      tacticalRoleConfidence: resolvedRoleConfidence,
      tacticalRoleGap: resolvedRoleGap,
      topTacticalRoles: recalculatedRankedRoles.slice(0, 3),
      exactPositionOVR: frontendFinalOVR,
      baseOVR: frontendFinalOVR,
      positionScore: blendedPositionScore,
      baseOutputScore: Number(baseOutputScore.toFixed(2)),
      consistencyScore: Number(consistencyScore.toFixed(2)),
      primaryRoleOVR,
      secondaryRoleSupport,
      weightedPercentileScore: Number(weightedPercentileScore.toFixed(2)),
      basePositionScore: blendedBasePositionScore,
      ovrBaseScore: blendedBasePositionScore,
      reliabilityScore: reliabilityProfile.reliabilityScore,
      reliabilityLabel: reliabilityProfile.reliabilityLabel,
      reliabilityModifier: reliabilityProfile.reliabilityModifier,
      minutesModifier: reliabilityProfile.reliabilityModifier,
      dataCoverageRatio,
      dataCoverageModifier,
      availableMetricCount,
      totalMetricCount,
      minutesPlayed: reliabilityProfile.minutesPlayed,
      matchesPlayed: reliabilityProfile.matchesPlayed,
      normalizedMetricBreakdown,
      metricBreakdown: normalizedMetricBreakdown,
      topMetricContributors,
      topContributors: topMetricContributors,
      topPositiveContributors: contributionLeaders.topPositiveContributors,
      topNegativeContributors: contributionLeaders.topNegativeContributors,
      positionCategoryScores,
      finalOVR,
      overall: finalOVR,
      ratingSource: useBackendFallback ? 'backend_fallback' : 'frontend_model',
      usedBackendFallback: useBackendFallback,
      positionGroup: positionContext.exactPositionGroup,
      scoutingMetricMap,
      scoutingSections,
      compactMetricKeys: POSITION_PRIORITY_METRICS[positionContext.positionFamily] || [],
      defaultScoutingSection: POSITION_DEFAULT_SCOUTING_SECTION[positionContext.positionFamily] || scoutingSections[0]?.key || null,
      playerArchetype: archetype.label,
      archetype: archetype.label,
      archetypeExplanation: archetype.explanation,
      secondaryArchetype: archetype.secondaryLabel,
      roleFitExplanation: buildRoleFitExplanation(resolvedPrimaryRole, resolvedSecondaryRole, categoryScores.publicCategoryScores),
      publicCategoryScores: categoryScores.publicCategoryScores,
      categoryBreakdowns: categoryScores.categoryBreakdowns,
      categoryDrivenPositionScore: categoryScores.categoryDrivenPositionScore,
      ovrExplanationNote: explanationSummary,
      explanationSummary,
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
      finalOVR: rating.finalOVR,
      basePositionScore: rating.basePositionScore,
      ovrBaseScore: rating.ovrBaseScore,
      reliabilityScore: rating.reliabilityScore,
      reliabilityLabel: rating.reliabilityLabel,
      reliabilityModifier: rating.reliabilityModifier,
      dataCoverageModifier: rating.dataCoverageModifier
    });
  }

  return ratingsIndex;
}

export function computeDisplayMetrics(player, ratingIndex = {}) {
  const safePlayer = player || {};
  const rating = ratingIndex[getRatingLookupKey(safePlayer)] || ratingIndex[normalizeString(safePlayer.player || '')];
  const positionContext = getPositionContext(safePlayer);
  const backendOverallRating = getBackendOverallRating(safePlayer);
  const backendRoleTag = getBackendRoleTag(safePlayer);

  if (!rating) {
    return {
      attackScore: 50,
      creativityScore: 50,
      possessionScore: 50,
      defendingScore: 50,
      summaryScore: 50,
      initials: getInitials(safePlayer.player),
      positionGroup: positionContext.exactPositionGroup,
      positionFamily: positionContext.positionFamily,
      positionFamilyLabel: positionContext.positionFamilyLabel,
      exactPosition: positionContext.exactPosition,
      exactPositionGroup: positionContext.exactPositionGroup,
      positionModel: positionContext.positionModel,
      secondaryPositionGroupCandidate: positionContext.secondaryPositionGroupCandidate,
      exactPositionOVR: 50,
      baseOVR: 50,
      positionScore: 50,
      baseOutputScore: 50,
      consistencyScore: 50,
      primaryRoleOVR: 50,
      secondaryRoleSupport: 50,
      weightedPercentileScore: 50,
      basePositionScore: 50,
      ovrBaseScore: 50,
      reliabilityScore: 0.5,
      reliabilityLabel: 'Medium',
      reliabilityModifier: 0.9,
      minutesModifier: 0.9,
      dataCoverageRatio: 1,
      dataCoverageModifier: 1,
      availableMetricCount: 0,
      totalMetricCount: 0,
      minutesPlayed: getEstimatedMinutes(safePlayer),
      matchesPlayed: toNumber(safePlayer.matches_played),
      normalizedMetricBreakdown: [],
      metricBreakdown: [],
      topMetricContributors: [],
      topContributors: [],
      topPositiveContributors: [],
      topNegativeContributors: [],
      positionCategoryScores: [],
      finalOVR: 50,
      tacticalRoleScores: {},
      topTacticalRoles: [],
      primaryTacticalRole: null,
      primaryTacticalRoleLabel: '-',
      secondaryTacticalRole: null,
      secondaryTacticalRoleLabel: '-',
      tacticalRoleConfidence: '-',
      tacticalRoleGap: 0,
      roleFitExplanation: 'Not enough information was available to build a clearer role-fit profile.',
      scoutingMetricMap: {},
      scoutingSections: [],
      compactMetricKeys: POSITION_PRIORITY_METRICS[positionContext.positionFamily] || [],
      defaultScoutingSection: POSITION_DEFAULT_SCOUTING_SECTION[positionContext.positionFamily] || null,
      playerArchetype: POSITION_FAMILY_LABELS[positionContext.positionFamily] || 'Profile',
      archetype: POSITION_FAMILY_LABELS[positionContext.positionFamily] || 'Profile',
      archetypeExplanation: 'Not enough data was available to derive a richer archetype.',
      secondaryArchetype: null,
      publicCategoryScores: {
        attack: 50,
        creativity: 50,
        possession: 50,
        defending: 50
      },
      categoryBreakdowns: {},
      categoryDrivenPositionScore: 50,
      categoryScores: {
        attacking: 50,
        playmaking: 50,
        possession: 50,
        defending: 50,
        goalkeeping: positionContext.positionFamily === POSITION_FAMILIES.goalkeeper ? 50 : null
      },
      ratingSource: backendOverallRating !== null ? 'backend_fallback' : 'frontend_model',
      usedBackendFallback: backendOverallRating !== null,
      ovrExplanationNote: 'The player did not have enough comparable data to build a detailed OVR breakdown.',
      explanationSummary: 'The player did not have enough comparable data to build a detailed OVR breakdown.'
    };
  }

  return {
    attackScore: rating.attackScore,
    creativityScore: rating.creativityScore,
    possessionScore: rating.possessionScore,
    defendingScore: rating.defendingScore,
    categoryScores: rating.categoryScores,
    summaryScore: rating.finalOVR,
    initials: getInitials(safePlayer.player),
    positionGroup: rating.exactPositionGroup,
    positionFamily: rating.positionFamily,
    positionFamilyLabel: rating.positionFamilyLabel,
    exactPosition: rating.exactPosition,
    exactPositionGroup: rating.exactPositionGroup,
    positionModel: rating.positionModel,
    secondaryPositionGroupCandidate: rating.secondaryPositionGroupCandidate,
    exactPositionOVR: rating.exactPositionOVR,
    baseOVR: rating.baseOVR,
    positionScore: rating.positionScore,
    baseOutputScore: rating.baseOutputScore,
    consistencyScore: rating.consistencyScore,
    primaryRoleOVR: rating.primaryRoleOVR,
    secondaryRoleSupport: rating.secondaryRoleSupport,
    weightedPercentileScore: rating.weightedPercentileScore,
    basePositionScore: rating.basePositionScore,
    ovrBaseScore: rating.ovrBaseScore,
    reliabilityScore: rating.reliabilityScore,
    reliabilityLabel: rating.reliabilityLabel,
    reliabilityModifier: rating.reliabilityModifier,
    minutesModifier: rating.minutesModifier,
    dataCoverageRatio: rating.dataCoverageRatio,
    dataCoverageModifier: rating.dataCoverageModifier,
    availableMetricCount: rating.availableMetricCount,
    totalMetricCount: rating.totalMetricCount,
    minutesPlayed: rating.minutesPlayed,
    matchesPlayed: rating.matchesPlayed,
    normalizedMetricBreakdown: rating.normalizedMetricBreakdown,
    metricBreakdown: rating.metricBreakdown,
    topMetricContributors: rating.topMetricContributors,
    topContributors: rating.topContributors,
    topPositiveContributors: rating.topPositiveContributors,
    topNegativeContributors: rating.topNegativeContributors,
    positionCategoryScores: rating.positionCategoryScores,
    finalOVR: rating.finalOVR,
    tacticalRoleScores: rating.tacticalRoleScores,
    topTacticalRoles: rating.topTacticalRoles,
    primaryTacticalRole: rating.primaryTacticalRole,
    primaryTacticalRoleLabel: rating.primaryTacticalRoleLabel,
    secondaryTacticalRole: rating.secondaryTacticalRole,
    secondaryTacticalRoleLabel: rating.secondaryTacticalRoleLabel,
    tacticalRoleConfidence: rating.tacticalRoleConfidence,
    tacticalRoleGap: rating.tacticalRoleGap,
    roleFitExplanation: rating.roleFitExplanation,
    scoutingMetricMap: rating.scoutingMetricMap,
    scoutingSections: rating.scoutingSections,
    compactMetricKeys: rating.compactMetricKeys,
    defaultScoutingSection: rating.defaultScoutingSection,
    playerArchetype: rating.playerArchetype,
    archetype: rating.archetype,
    archetypeExplanation: rating.archetypeExplanation,
    secondaryArchetype: rating.secondaryArchetype,
    publicCategoryScores: rating.publicCategoryScores,
    categoryBreakdowns: rating.categoryBreakdowns,
    categoryDrivenPositionScore: rating.categoryDrivenPositionScore,
    ratingSource: rating.ratingSource,
    usedBackendFallback: rating.usedBackendFallback,
    ovrExplanationNote: rating.ovrExplanationNote,
    explanationSummary: rating.explanationSummary
  };
}

function formatSignedValue(value) {
  const numericValue = toNumber(value);
  const formatted = formatStatValue(Math.abs(numericValue), '0');
  return numericValue > 0 ? `+${formatted}` : numericValue < 0 ? `-${formatted}` : '0';
}

export function formatScoutingMetricValue(metricOrKey, maybeValue, fallback = '-') {
  const metricKey = typeof metricOrKey === 'object' ? metricOrKey?.key : metricOrKey;
  const value = typeof metricOrKey === 'object' ? metricOrKey?.value : maybeValue;
  const definition = SCOUTING_METRIC_DEFINITIONS[metricKey];

  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  switch (definition?.format) {
    case 'signed':
      return formatSignedValue(value);
    case 'pct':
      return `${formatStatValue(value, fallback)}%`;
    case 'integer':
      return String(Math.round(toNumber(value)));
    default:
      return formatStatValue(value, fallback);
  }
}

function compareScoutingMetricValues(leftMetric, rightMetric, samePositionFamily) {
  if (!leftMetric || !rightMetric) {
    return 'tie';
  }

  const definition = SCOUTING_METRIC_DEFINITIONS[leftMetric.key];
  const leftValue = samePositionFamily ? toNumber(leftMetric.value) : toNumber(leftMetric.percentile);
  const rightValue = samePositionFamily ? toNumber(rightMetric.value) : toNumber(rightMetric.percentile);

  if (leftValue === rightValue) {
    return 'tie';
  }

  if (samePositionFamily && definition?.invert) {
    return leftValue < rightValue ? 'left' : 'right';
  }

  return leftValue > rightValue ? 'left' : 'right';
}

export function buildScoutingComparison(leftMetrics, rightMetrics) {
  const leftPositionFamily = leftMetrics?.positionFamily;
  const rightPositionFamily = rightMetrics?.positionFamily;
  const samePositionFamily = leftPositionFamily && leftPositionFamily === rightPositionFamily;
  const leftRelevantMetrics = new Set(getRelevantScoutingMetricKeys(leftPositionFamily));
  const rightRelevantMetrics = new Set(getRelevantScoutingMetricKeys(rightPositionFamily));
  const allowedMetricKeys = samePositionFamily
    ? [...leftRelevantMetrics]
    : [...leftRelevantMetrics].filter((metricKey) => rightRelevantMetrics.has(metricKey));

  let leftWins = 0;
  let rightWins = 0;
  let tieCount = 0;

  const sections = SCOUTING_SECTION_ORDER.map((sectionKey) => {
    const rows = (SCOUTING_SECTION_METRIC_KEYS[sectionKey] || [])
      .filter((metricKey) => allowedMetricKeys.includes(metricKey))
      .map((metricKey) => {
        const leftMetric = leftMetrics?.scoutingMetricMap?.[metricKey];
        const rightMetric = rightMetrics?.scoutingMetricMap?.[metricKey];

        if (!leftMetric || !rightMetric) {
          return null;
        }

        const winner = compareScoutingMetricValues(leftMetric, rightMetric, samePositionFamily);

        if (winner === 'left') {
          leftWins += 1;
        } else if (winner === 'right') {
          rightWins += 1;
        } else {
          tieCount += 1;
        }

        return {
          key: metricKey,
          label: leftMetric.label,
          tooltip: leftMetric.tooltip,
          winner,
          leftMetric,
          rightMetric
        };
      })
      .filter(Boolean);

    if (!rows.length) {
      return null;
    }

    return {
      ...SCOUTING_SECTION_META[sectionKey],
      rows
    };
  }).filter(Boolean);

  return {
    samePositionFamily,
    leftWins,
    rightWins,
    tieCount,
    sections,
    defaultOpenSection:
      sections.find((section) => section.key === (samePositionFamily ? leftMetrics?.defaultScoutingSection : null))?.key || sections[0]?.key || null
  };
}
