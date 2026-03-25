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

  return {
    listedPositions,
    exactPosition,
    exactPositionGroup,
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

function getEstimatedMinutes(player) {
  return toNumber(player?.matches_played) * toNumber(player?.avg_mins_per_match);
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
  const scoutingContext = buildScoutingMetricContext(players);
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
    const scoutingSnapshot = scoutingContext.snapshotsByKey[uniqueKey] || scoutingContext.snapshotsByKey[nameKey] || {
      positionFamily: positionContext.positionFamily,
      rawMetrics: Object.fromEntries(
        Object.keys(SCOUTING_METRIC_DEFINITIONS).map((metricKey) => [metricKey, calculateScoutingMetricValue(player, metricKey)])
      )
    };
    const scoutingMetricMap = buildScoutingMetricMap(positionContext.positionFamily, scoutingSnapshot.rawMetrics, scoutingContext.familyLookup);
    const scoutingSections = buildScoutingSections(positionContext.positionFamily, scoutingMetricMap);

    const ratingEntry = {
      exactPosition: positionContext.exactPosition,
      exactPositionGroup: positionContext.exactPositionGroup,
      secondaryPositionGroupCandidate: positionContext.secondaryPositionGroupCandidate,
      positionFamily: positionContext.positionFamily,
      positionFamilyLabel: positionContext.positionFamilyLabel,
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
      scoutingMetricMap,
      scoutingSections,
      compactMetricKeys: POSITION_PRIORITY_METRICS[positionContext.positionFamily] || [],
      defaultScoutingSection: POSITION_DEFAULT_SCOUTING_SECTION[positionContext.positionFamily] || scoutingSections[0]?.key || null,
      playerArchetype: buildPlayerArchetype(positionContext.positionFamily, scoutingMetricMap),
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
      positionFamily: positionContext.positionFamily,
      positionFamilyLabel: positionContext.positionFamilyLabel,
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
      tacticalRoleGap: 0,
      scoutingMetricMap: {},
      scoutingSections: [],
      compactMetricKeys: POSITION_PRIORITY_METRICS[positionContext.positionFamily] || [],
      defaultScoutingSection: POSITION_DEFAULT_SCOUTING_SECTION[positionContext.positionFamily] || null,
      playerArchetype: POSITION_FAMILY_LABELS[positionContext.positionFamily] || 'Profile'
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
    positionFamily: rating.positionFamily,
    positionFamilyLabel: rating.positionFamilyLabel,
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
    tacticalRoleGap: rating.tacticalRoleGap,
    scoutingMetricMap: rating.scoutingMetricMap,
    scoutingSections: rating.scoutingSections,
    compactMetricKeys: rating.compactMetricKeys,
    defaultScoutingSection: rating.defaultScoutingSection,
    playerArchetype: rating.playerArchetype
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
