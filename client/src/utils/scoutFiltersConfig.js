function readNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const POSITION_FAMILIES = {
  goalkeeper: 'goalkeeper',
  defender: 'defender',
  midfielder: 'midfielder',
  forward: 'forward'
};

export const EXACT_POSITION_OPTIONS = [
  { value: 'GK', label: 'GK', family: POSITION_FAMILIES.goalkeeper },
  { value: 'CB', label: 'CB', family: POSITION_FAMILIES.defender },
  { value: 'LB/RB', label: 'LB/RB', family: POSITION_FAMILIES.defender },
  { value: 'DM', label: 'DM', family: POSITION_FAMILIES.midfielder },
  { value: 'CM', label: 'CM', family: POSITION_FAMILIES.midfielder },
  { value: 'CAM', label: 'CAM', family: POSITION_FAMILIES.midfielder },
  { value: 'LW/RW', label: 'LW/RW', family: POSITION_FAMILIES.forward },
  { value: 'ST', label: 'ST', family: POSITION_FAMILIES.forward }
];

export const POSITION_FAMILY_BY_MODEL = Object.fromEntries(EXACT_POSITION_OPTIONS.map((option) => [option.value, option.family]));

export const RELIABILITY_OPTIONS = [
  { value: 'all', label: 'Any Sample' },
  { value: 'Medium', label: 'Medium +' },
  { value: 'High', label: 'High Only' }
];

export const RELIABILITY_RANK = {
  Low: 1,
  Medium: 2,
  High: 3
};

export const TACTICAL_CATEGORY_FILTERS = [
  { key: 'attackMin', label: 'Attack Floor' },
  { key: 'creativityMin', label: 'Creativity Floor' },
  { key: 'possessionMin', label: 'Possession Floor' },
  { key: 'defendingMin', label: 'Defending Floor' }
];

export const TACTICAL_ROLE_GROUPS = [
  {
    positionModel: 'GK',
    label: 'GK',
    roles: [
      { key: 'ShotStopper', label: 'Shot Stopper' },
      { key: 'SweeperKeeper', label: 'Sweeper Keeper' },
      { key: 'CommandingKeeper', label: 'Commanding Keeper' },
      { key: 'Distributor', label: 'Distributor' }
    ]
  },
  {
    positionModel: 'CB',
    label: 'CB',
    roles: [
      { key: 'Stopper', label: 'Stopper' },
      { key: 'BallPlayingCB', label: 'Ball-Playing CB' },
      { key: 'Sweeper', label: 'Sweeper' },
      { key: 'AerialCB', label: 'Aerial CB' }
    ]
  },
  {
    positionModel: 'LB/RB',
    label: 'LB/RB',
    roles: [
      { key: 'DefensiveFullBack', label: 'Defensive Full-Back' },
      { key: 'BalancedFullBack', label: 'Balanced Full-Back' },
      { key: 'AttackingFullBack', label: 'Attacking Full-Back' },
      { key: 'InvertedProgressor', label: 'Inverted Progressor' }
    ]
  },
  {
    positionModel: 'DM',
    label: 'DM',
    roles: [
      { key: 'Destroyer', label: 'Destroyer' },
      { key: 'Anchor', label: 'Anchor' },
      { key: 'Regista', label: 'Regista' },
      { key: 'DeepController', label: 'Deep Controller' }
    ]
  },
  {
    positionModel: 'CM',
    label: 'CM',
    roles: [
      { key: 'BoxToBox', label: 'Box-to-Box' },
      { key: 'DeepPlaymaker', label: 'Deep Playmaker' },
      { key: 'Controller', label: 'Controller' },
      { key: 'TwoWayCM', label: 'Two-Way CM' }
    ]
  },
  {
    positionModel: 'CAM',
    label: 'CAM',
    roles: [
      { key: 'Playmaker', label: 'Playmaker' },
      { key: 'AdvancedCreator', label: 'Advanced Creator' },
      { key: 'GoalScoringAM', label: 'Goal-Scoring AM' },
      { key: 'FreeRoamCreator', label: 'Free-Roam Creator' }
    ]
  },
  {
    positionModel: 'LW/RW',
    label: 'LW/RW',
    roles: [
      { key: 'InsideForward', label: 'Inside Forward' },
      { key: 'WideCreator', label: 'Wide Creator' },
      { key: 'DirectDribbler', label: 'Direct Dribbler' },
      { key: 'BalancedWinger', label: 'Balanced Winger' }
    ]
  },
  {
    positionModel: 'ST',
    label: 'ST',
    roles: [
      { key: 'Poacher', label: 'Poacher' },
      { key: 'TargetMan', label: 'Target Man' },
      { key: 'CompleteForward', label: 'Complete Forward' },
      { key: 'False9', label: 'False 9' }
    ]
  }
];

export const DISCOVERY_SORT_OPTIONS = [
  {
    value: 'rating',
    label: 'Rating',
    getValue: (record) => Number(record.metrics.finalOVR) || 0
  },
  {
    value: 'minutes',
    label: 'Minutes',
    getValue: (record) => Number(record.metrics.minutesPlayed) || 0
  },
  {
    value: 'goals',
    label: 'Goals',
    getValue: (record) => Number(record.metricValues.goals) || 0
  },
  {
    value: 'assists',
    label: 'Assists',
    getValue: (record) => Number(record.metricValues.assists) || 0
  },
  {
    value: 'key_passes',
    label: 'Key Passes',
    getValue: (record) => Number(record.metricValues.key_passes) || 0
  },
  {
    value: 'progressive_passes',
    label: 'Prog. Passes',
    getValue: (record) => Number(record.metricValues.progressive_passes) || 0
  },
  {
    value: 'progressive_carries',
    label: 'Prog. Carries',
    getValue: (record) => Number(record.metricValues.progressive_carries) || 0
  },
  {
    value: 'tackles_won',
    label: 'Tackles Won',
    getValue: (record) => Number(record.metricValues.tackles_won) || 0
  }
];

export const DISCOVERY_METRIC_DEFINITIONS = [
  {
    key: 'goals',
    label: 'Goals',
    section: 'attacking',
    format: 'integer',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 30 },
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder],
    valueGetter: (player) => readNumber(player?.goals)
  },
  {
    key: 'expected_goals',
    label: 'xG',
    section: 'attacking',
    format: 'decimal',
    step: 0.1,
    mode: 'min',
    fallback: { min: 0, max: 25 },
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder],
    valueGetter: (player) => readNumber(player?.expected_goals)
  },
  {
    key: 'total_shots',
    label: 'Shots',
    section: 'attacking',
    format: 'integer',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 120 },
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder],
    valueGetter: (player) => readNumber(player?.total_shots)
  },
  {
    key: 'assists',
    label: 'Assists',
    section: 'playmaking',
    format: 'integer',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 20 },
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender],
    valueGetter: (player) => readNumber(player?.assists)
  },
  {
    key: 'key_passes',
    label: 'Key Passes',
    section: 'playmaking',
    format: 'integer',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 100 },
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender],
    valueGetter: (player) => readNumber(player?.key_passes)
  },
  {
    key: 'progressive_passes',
    label: 'Progressive Passes',
    section: 'playmaking',
    format: 'integer',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 260 },
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender, POSITION_FAMILIES.goalkeeper],
    valueGetter: (player) => readNumber(player?.progressive_passes)
  },
  {
    key: 'progressive_carries',
    label: 'Progressive Carries',
    section: 'possession',
    format: 'integer',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 200 },
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender],
    valueGetter: (player) => readNumber(player?.progressive_carries)
  },
  {
    key: 'pass_completion_pct',
    label: 'Pass Completion %',
    section: 'possession',
    format: 'pct',
    step: 1,
    mode: 'min',
    fallback: { min: 40, max: 100 },
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender, POSITION_FAMILIES.goalkeeper],
    valueGetter: (player) => readNumber(player?.pass_completion_pct)
  },
  {
    key: 'successful_take_ons_pct',
    label: 'Take-On Success %',
    section: 'possession',
    format: 'pct',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 100 },
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender],
    valueGetter: (player) => readNumber(player?.successful_take_ons_pct)
  },
  {
    key: 'tackles_won',
    label: 'Tackles Won',
    section: 'defensive',
    format: 'integer',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 90 },
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender],
    valueGetter: (player) => readNumber(player?.tackles_won)
  },
  {
    key: 'interceptions',
    label: 'Interceptions',
    section: 'defensive',
    format: 'integer',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 90 },
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender],
    valueGetter: (player) => readNumber(player?.interceptions)
  },
  {
    key: 'aerial_duels_won_pct',
    label: 'Aerial Win %',
    section: 'defensive',
    format: 'pct',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 100 },
    relevantFamilies: [POSITION_FAMILIES.defender, POSITION_FAMILIES.forward],
    valueGetter: (player) => readNumber(player?.aerial_duels_won_pct)
  },
  {
    key: 'save_eff',
    label: 'Save %',
    section: 'goalkeeping',
    format: 'pct',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 100 },
    relevantFamilies: [POSITION_FAMILIES.goalkeeper],
    valueGetter: (_, metrics) => readNumber(metrics?.scoutingMetricMap?.save_eff?.value)
  },
  {
    key: 'clean_sheet_rate',
    label: 'Clean Sheet %',
    section: 'goalkeeping',
    format: 'pct',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 100 },
    relevantFamilies: [POSITION_FAMILIES.goalkeeper],
    valueGetter: (_, metrics) => readNumber(metrics?.scoutingMetricMap?.clean_sheet_rate?.value)
  },
  {
    key: 'goals_against_p90',
    label: 'Goals Against P90',
    section: 'goalkeeping',
    format: 'decimal',
    step: 0.05,
    mode: 'max',
    fallback: { min: 0, max: 3 },
    relevantFamilies: [POSITION_FAMILIES.goalkeeper],
    valueGetter: (_, metrics) => readNumber(metrics?.scoutingMetricMap?.goals_against_p90?.value)
  },
  {
    key: 'crosses_stopped',
    label: 'Crosses Stopped',
    section: 'goalkeeping',
    format: 'integer',
    step: 1,
    mode: 'min',
    fallback: { min: 0, max: 60 },
    relevantFamilies: [POSITION_FAMILIES.goalkeeper],
    valueGetter: (player) => readNumber(player?.crosses_stopped)
  }
];

export const DISCOVERY_METRIC_LOOKUP = Object.fromEntries(DISCOVERY_METRIC_DEFINITIONS.map((metric) => [metric.key, metric]));

export const ADVANCED_METRIC_GROUPS = [
  { key: 'attacking', label: 'Attack' },
  { key: 'playmaking', label: 'Playmaking' },
  { key: 'possession', label: 'Possession' },
  { key: 'defensive', label: 'Defending' },
  { key: 'goalkeeping', label: 'Goalkeeping' }
];

export const SCOUT_PRESETS = [
  {
    id: 'creative_cam',
    label: 'Creative CAM',
    description: 'High-end chance creator between the lines.',
    filters: {
      positions: ['CAM'],
      primaryRole: 'Advanced Creator',
      creativityMin: 82,
      attackMin: 62,
      possessionMin: 60,
      metricFloorRatios: {
        key_passes: 0.5,
        progressive_passes: 0.42,
        assists: 0.35
      }
    }
  },
  {
    id: 'ball_winning_dm',
    label: 'Ball-Winning DM',
    description: 'Defensive midfielder who protects space and wins duels.',
    filters: {
      positions: ['DM'],
      defendingMin: 80,
      possessionMin: 58,
      metricFloorRatios: {
        tackles_won: 0.58,
        interceptions: 0.58
      }
    }
  },
  {
    id: 'possession_cm',
    label: 'Possession CM',
    description: 'Secure central midfielder for circulation and control.',
    filters: {
      positions: ['CM'],
      primaryRole: 'Controller',
      creativityMin: 58,
      possessionMin: 82,
      metricFloorRatios: {
        pass_completion_pct: 0.68,
        progressive_passes: 0.45
      }
    }
  },
  {
    id: 'progressive_cb',
    label: 'Progressive CB',
    description: 'Centre-back who advances play without losing control.',
    filters: {
      positions: ['CB'],
      primaryRole: 'Ball-Playing CB',
      possessionMin: 72,
      defendingMin: 68,
      metricFloorRatios: {
        progressive_passes: 0.56,
        pass_completion_pct: 0.62
      }
    }
  },
  {
    id: 'attacking_full_back',
    label: 'Attacking Full-Back',
    description: 'Wide defender with progression and final-third support.',
    filters: {
      positions: ['LB/RB'],
      primaryRole: 'Attacking Full-Back',
      attackMin: 66,
      creativityMin: 62,
      metricFloorRatios: {
        progressive_carries: 0.52,
        assists: 0.28,
        key_passes: 0.35
      }
    }
  },
  {
    id: 'direct_winger',
    label: 'Direct Winger',
    description: 'Aggressive wide threat with carries and dribbles.',
    filters: {
      positions: ['LW/RW'],
      primaryRole: 'Direct Dribbler',
      attackMin: 74,
      creativityMin: 50,
      metricFloorRatios: {
        progressive_carries: 0.58,
        successful_take_ons_pct: 0.5,
        total_shots: 0.36
      }
    }
  },
  {
    id: 'goal_scoring_st',
    label: 'Goal-Scoring ST',
    description: 'Penalty-box scorer with repeatable shot volume.',
    filters: {
      positions: ['ST'],
      primaryRole: 'Poacher',
      attackMin: 84,
      metricFloorRatios: {
        goals: 0.62,
        expected_goals: 0.48,
        total_shots: 0.55
      }
    }
  },
  {
    id: 'aerial_cb',
    label: 'Aerial CB',
    description: 'Dominant central defender for duels and box defending.',
    filters: {
      positions: ['CB'],
      primaryRole: 'Aerial CB',
      defendingMin: 82,
      metricFloorRatios: {
        aerial_duels_won_pct: 0.66,
        interceptions: 0.3
      }
    }
  },
  {
    id: 'high_control_midfielder',
    label: 'High-Control Midfielder',
    description: 'Secure midfield profile with possession leadership.',
    filters: {
      positions: ['DM', 'CM'],
      creativityMin: 54,
      possessionMin: 84,
      metricFloorRatios: {
        pass_completion_pct: 0.72,
        progressive_passes: 0.38
      }
    }
  }
];

export function getRoleGroupsForPositions(positionModels = []) {
  if (!positionModels.length) {
    return TACTICAL_ROLE_GROUPS;
  }

  const allowedPositions = new Set(positionModels);
  return TACTICAL_ROLE_GROUPS.filter((group) => allowedPositions.has(group.positionModel));
}

export function getMetricGroupsForPositions(positionModels = []) {
  const allowedFamilies = positionModels.length ? new Set(positionModels.map((position) => POSITION_FAMILY_BY_MODEL[position])) : null;

  return ADVANCED_METRIC_GROUPS.map((group) => ({
    ...group,
    metrics: DISCOVERY_METRIC_DEFINITIONS.filter((metric) => {
      if (metric.section !== group.key) {
        return false;
      }

      return !allowedFamilies || metric.relevantFamilies.some((family) => allowedFamilies.has(family));
    })
  })).filter((group) => group.metrics.length);
}

export function getDefaultMetricGroup(positionModels = []) {
  return getMetricGroupsForPositions(positionModels)[0]?.key || ADVANCED_METRIC_GROUPS[0].key;
}
