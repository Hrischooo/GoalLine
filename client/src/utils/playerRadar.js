function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function roundScore(value) {
  return Math.round(clamp(value, 0, 100));
}

function buildPositionCategoryLookup(metrics = {}) {
  return Object.fromEntries((metrics.positionCategoryScores || []).map((entry) => [entry.key, toNumber(entry.score)]));
}

function buildMetricLookup(metrics = {}) {
  return Object.fromEntries((metrics.metricBreakdown || []).map((entry) => [entry.key, toNumber(entry.normalizedScore) * 100]));
}

function getPublicCategoryValue(metrics = {}, key) {
  const publicScores = metrics.publicCategoryScores || {};

  switch (key) {
    case 'attack':
      return toNumber(publicScores.attack || metrics.attackScore);
    case 'creativity':
      return toNumber(publicScores.creativity || metrics.creativityScore);
    case 'possession':
      return toNumber(publicScores.possession || metrics.possessionScore);
    case 'defending':
      return toNumber(publicScores.defending || metrics.defendingScore);
    default:
      return toNumber(publicScores[key]);
  }
}

function getSourceValue(metrics, positionCategoryLookup, metricLookup, source) {
  switch (source.type) {
    case 'publicCategory':
      return getPublicCategoryValue(metrics, source.key);
    case 'positionCategory':
      return toNumber(positionCategoryLookup[source.key]);
    case 'metric':
      return toNumber(metricLookup[source.key]);
    case 'consistency':
      return toNumber(metrics.consistencyScore);
    case 'reliability':
      return toNumber(metrics.reliabilityModifier) * 100;
    default:
      return 0;
  }
}

function calculateAxisValue(metrics, axis, positionCategoryLookup, metricLookup) {
  let weightedTotal = 0;
  let totalWeight = 0;

  for (const source of axis.sources || []) {
    const sourceValue = getSourceValue(metrics, positionCategoryLookup, metricLookup, source);

    if (!Number.isFinite(sourceValue) || sourceValue <= 0) {
      continue;
    }

    weightedTotal += sourceValue * source.weight;
    totalWeight += source.weight;
  }

  if (!totalWeight) {
    return 50;
  }

  return roundScore(weightedTotal / totalWeight);
}

const RADAR_MODELS = {
  GK: {
    title: 'Goalkeeper Profile',
    axes: [
      { key: 'shot_stopping', label: 'Shot Stopping', sources: [{ type: 'positionCategory', key: 'shot_stopping', weight: 0.8 }, { type: 'publicCategory', key: 'defending', weight: 0.2 }] },
      { key: 'command', label: 'Command', sources: [{ type: 'positionCategory', key: 'prevention_command', weight: 0.8 }, { type: 'metric', key: 'clean_sheets_pct', weight: 0.2 }] },
      { key: 'distribution', label: 'Distribution', sources: [{ type: 'positionCategory', key: 'distribution', weight: 0.8 }, { type: 'publicCategory', key: 'creativity', weight: 0.2 }] },
      { key: 'handling_security', label: 'Handling / Security', sources: [{ type: 'positionCategory', key: 'error_avoidance', weight: 0.7 }, { type: 'publicCategory', key: 'possession', weight: 0.3 }] },
      { key: 'sweeping', label: 'Sweeping', sources: [{ type: 'metric', key: 'progressive_passes', weight: 0.45 }, { type: 'metric', key: 'passes_attempted', weight: 0.25 }, { type: 'publicCategory', key: 'possession', weight: 0.3 }] },
      { key: 'reliability', label: 'Reliability', sources: [{ type: 'consistency', weight: 0.7 }, { type: 'reliability', weight: 0.3 }] }
    ]
  },
  CB: {
    title: 'Centre-Back Profile',
    axes: [
      { key: 'defending', label: 'Defending', sources: [{ type: 'publicCategory', key: 'defending', weight: 0.55 }, { type: 'positionCategory', key: 'duel_defending', weight: 0.2 }, { type: 'positionCategory', key: 'defensive_reading', weight: 0.25 }] },
      { key: 'aerial', label: 'Aerial', sources: [{ type: 'positionCategory', key: 'aerial_ability', weight: 0.75 }, { type: 'metric', key: 'aerial_duel_win_pct', weight: 0.25 }] },
      { key: 'positioning', label: 'Positioning', sources: [{ type: 'positionCategory', key: 'defensive_reading', weight: 0.7 }, { type: 'positionCategory', key: 'error_avoidance', weight: 0.3 }] },
      { key: 'progression', label: 'Progression', sources: [{ type: 'positionCategory', key: 'progression', weight: 0.7 }, { type: 'publicCategory', key: 'creativity', weight: 0.3 }] },
      { key: 'ball_security', label: 'Ball Security', sources: [{ type: 'positionCategory', key: 'ball_security', weight: 0.7 }, { type: 'publicCategory', key: 'possession', weight: 0.3 }] },
      { key: 'physical_dueling', label: 'Physical Dueling', sources: [{ type: 'positionCategory', key: 'duel_defending', weight: 0.65 }, { type: 'positionCategory', key: 'aerial_ability', weight: 0.35 }] }
    ]
  },
  'LB/RB': {
    title: 'Full-Back Profile',
    axes: [
      { key: 'defending', label: 'Defending', sources: [{ type: 'publicCategory', key: 'defending', weight: 0.6 }, { type: 'positionCategory', key: 'defensive_work', weight: 0.4 }] },
      { key: 'progression', label: 'Progression', sources: [{ type: 'positionCategory', key: 'progression', weight: 0.7 }, { type: 'publicCategory', key: 'possession', weight: 0.3 }] },
      { key: 'delivery', label: 'Crossing / Delivery', sources: [{ type: 'positionCategory', key: 'chance_support', weight: 0.65 }, { type: 'publicCategory', key: 'creativity', weight: 0.35 }] },
      { key: 'carrying', label: 'Carrying', sources: [{ type: 'positionCategory', key: 'one_v_one_carrying', weight: 0.55 }, { type: 'metric', key: 'progressive_carries', weight: 0.45 }] },
      { key: 'ball_security', label: 'Ball Security', sources: [{ type: 'positionCategory', key: 'ball_security', weight: 0.7 }, { type: 'publicCategory', key: 'possession', weight: 0.3 }] },
      { key: 'support_play', label: 'Support Play', sources: [{ type: 'positionCategory', key: 'chance_support', weight: 0.4 }, { type: 'positionCategory', key: 'progression', weight: 0.3 }, { type: 'publicCategory', key: 'attack', weight: 0.3 }] }
    ]
  },
  DM: {
    title: 'Defensive Midfield Profile',
    axes: [
      { key: 'ball_winning', label: 'Ball Winning', sources: [{ type: 'positionCategory', key: 'ball_winning', weight: 0.6 }, { type: 'publicCategory', key: 'defending', weight: 0.4 }] },
      { key: 'positioning', label: 'Positioning', sources: [{ type: 'positionCategory', key: 'defensive_reading', weight: 0.65 }, { type: 'positionCategory', key: 'security', weight: 0.35 }] },
      { key: 'possession_control', label: 'Possession Control', sources: [{ type: 'positionCategory', key: 'control_circulation', weight: 0.65 }, { type: 'publicCategory', key: 'possession', weight: 0.35 }] },
      { key: 'progression', label: 'Progression', sources: [{ type: 'positionCategory', key: 'progression', weight: 0.7 }, { type: 'publicCategory', key: 'creativity', weight: 0.3 }] },
      { key: 'security', label: 'Security', sources: [{ type: 'positionCategory', key: 'security', weight: 0.7 }, { type: 'publicCategory', key: 'possession', weight: 0.3 }] },
      { key: 'passing_range', label: 'Passing Range', sources: [{ type: 'metric', key: 'progressive_passes', weight: 0.45 }, { type: 'positionCategory', key: 'progression', weight: 0.35 }, { type: 'positionCategory', key: 'control_circulation', weight: 0.2 }] }
    ]
  },
  CM: {
    title: 'Central Midfield Profile',
    axes: [
      { key: 'progression', label: 'Progression', sources: [{ type: 'positionCategory', key: 'progression', weight: 0.7 }, { type: 'publicCategory', key: 'creativity', weight: 0.15 }, { type: 'publicCategory', key: 'possession', weight: 0.15 }] },
      { key: 'creativity', label: 'Creativity', sources: [{ type: 'publicCategory', key: 'creativity', weight: 0.65 }, { type: 'positionCategory', key: 'creation', weight: 0.35 }] },
      { key: 'possession', label: 'Possession', sources: [{ type: 'publicCategory', key: 'possession', weight: 0.7 }, { type: 'positionCategory', key: 'control', weight: 0.3 }] },
      { key: 'work_rate', label: 'Work Rate / Defending', sources: [{ type: 'publicCategory', key: 'defending', weight: 0.65 }, { type: 'positionCategory', key: 'defensive_work', weight: 0.35 }] },
      { key: 'ball_security', label: 'Ball Security', sources: [{ type: 'positionCategory', key: 'retention_efficiency', weight: 0.7 }, { type: 'publicCategory', key: 'possession', weight: 0.3 }] },
      { key: 'control', label: 'Control', sources: [{ type: 'positionCategory', key: 'control', weight: 0.7 }, { type: 'publicCategory', key: 'possession', weight: 0.3 }] }
    ]
  },
  CAM: {
    title: 'Attacking Midfield Profile',
    axes: [
      { key: 'creativity', label: 'Creativity', sources: [{ type: 'publicCategory', key: 'creativity', weight: 0.7 }, { type: 'positionCategory', key: 'chance_creation', weight: 0.3 }] },
      { key: 'attack', label: 'Attack', sources: [{ type: 'publicCategory', key: 'attack', weight: 0.7 }, { type: 'positionCategory', key: 'goal_threat', weight: 0.3 }] },
      { key: 'progression', label: 'Progression', sources: [{ type: 'positionCategory', key: 'progression', weight: 0.7 }, { type: 'publicCategory', key: 'possession', weight: 0.3 }] },
      { key: 'final_third_delivery', label: 'Final Third Delivery', sources: [{ type: 'positionCategory', key: 'final_third_delivery', weight: 0.7 }, { type: 'publicCategory', key: 'creativity', weight: 0.3 }] },
      { key: 'possession', label: 'Possession', sources: [{ type: 'publicCategory', key: 'possession', weight: 0.7 }, { type: 'positionCategory', key: 'retention', weight: 0.3 }] },
      { key: 'flair_carrying', label: 'Flair / Ball Carrying', sources: [{ type: 'metric', key: 'progressive_carries', weight: 0.45 }, { type: 'metric', key: 'successful_take_ons_total', weight: 0.3 }, { type: 'publicCategory', key: 'creativity', weight: 0.25 }] }
    ]
  },
  'LW/RW': {
    title: 'Wide Forward Profile',
    axes: [
      { key: 'attack', label: 'Attack', sources: [{ type: 'publicCategory', key: 'attack', weight: 0.7 }, { type: 'positionCategory', key: 'goal_threat', weight: 0.3 }] },
      { key: 'creativity', label: 'Creativity', sources: [{ type: 'publicCategory', key: 'creativity', weight: 0.7 }, { type: 'positionCategory', key: 'chance_creation', weight: 0.3 }] },
      { key: 'dribbling', label: 'Dribbling', sources: [{ type: 'positionCategory', key: 'one_v_one_quality', weight: 0.6 }, { type: 'metric', key: 'successful_take_ons_total', weight: 0.4 }] },
      { key: 'carry_threat', label: 'Carry Threat', sources: [{ type: 'positionCategory', key: 'carry_threat', weight: 0.75 }, { type: 'publicCategory', key: 'attack', weight: 0.25 }] },
      { key: 'delivery', label: 'Final Third Delivery', sources: [{ type: 'metric', key: 'passes_into_penalty_area', weight: 0.35 }, { type: 'metric', key: 'shot_creating_actions_total', weight: 0.35 }, { type: 'publicCategory', key: 'creativity', weight: 0.3 }] },
      { key: 'retention', label: 'Ball Retention', sources: [{ type: 'positionCategory', key: 'efficiency_retention', weight: 0.65 }, { type: 'publicCategory', key: 'possession', weight: 0.35 }] }
    ]
  },
  ST: {
    title: 'Striker Profile',
    axes: [
      { key: 'finishing', label: 'Finishing', sources: [{ type: 'positionCategory', key: 'finishing_efficiency', weight: 0.7 }, { type: 'metric', key: 'goals_per_shot', weight: 0.3 }] },
      { key: 'shot_threat', label: 'Shot Threat', sources: [{ type: 'positionCategory', key: 'shot_threat', weight: 0.75 }, { type: 'publicCategory', key: 'attack', weight: 0.25 }] },
      { key: 'box_presence', label: 'Box Presence', sources: [{ type: 'positionCategory', key: 'box_presence', weight: 0.8 }, { type: 'publicCategory', key: 'attack', weight: 0.2 }] },
      { key: 'link_play', label: 'Link Play', sources: [{ type: 'positionCategory', key: 'link_play', weight: 0.7 }, { type: 'publicCategory', key: 'creativity', weight: 0.3 }] },
      { key: 'aerial_threat', label: 'Aerial Threat', sources: [{ type: 'metric', key: 'aerial_duel_win_pct', weight: 0.75 }, { type: 'positionCategory', key: 'box_presence', weight: 0.25 }] },
      { key: 'attack', label: 'Attack', sources: [{ type: 'publicCategory', key: 'attack', weight: 0.75 }, { type: 'positionCategory', key: 'goal_output', weight: 0.25 }] }
    ]
  }
};

function getRadarModel(metrics = {}) {
  return RADAR_MODELS[metrics.positionModel] || RADAR_MODELS.CM;
}

export function getPlayerRadarProfile(metrics = {}) {
  if (!metrics) {
    return {
      exactPosition: 'CM',
      radarProfileName: 'Player Shape',
      radarAxes: [],
      strengths: [],
      weaknesses: [],
      explanation: 'Radar profile unavailable.'
    };
  }

  const positionCategoryLookup = buildPositionCategoryLookup(metrics);
  const metricLookup = buildMetricLookup(metrics);
  const model = getRadarModel(metrics);
  const radarAxes = model.axes.map((axis) => ({
    key: axis.key,
    label: axis.label,
    value: calculateAxisValue(metrics, axis, positionCategoryLookup, metricLookup)
  }));
  const rankedAxes = [...radarAxes].sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));
  const strengths = rankedAxes.slice(0, 2);
  const weaknesses = rankedAxes.slice(-1);

  return {
    exactPosition: metrics.exactPosition,
    positionModel: metrics.positionModel,
    radarProfileName: metrics.playerArchetype || metrics.primaryTacticalRoleLabel || model.title,
    title: model.title,
    radarAxes,
    strengths,
    weaknesses,
    explanation: `${metrics.exactPosition || metrics.positionModel} radar uses role-specific dimensions derived from the same normalized profile data that powers OVR, role fit, and category analysis.`
  };
}

export function canOverlayRadarProfiles(leftProfile, rightProfile) {
  if (!leftProfile?.radarAxes?.length || !rightProfile?.radarAxes?.length) {
    return false;
  }

  return (
    leftProfile.radarAxes.length === rightProfile.radarAxes.length &&
    leftProfile.radarAxes.every((axis, index) => axis.label === rightProfile.radarAxes[index]?.label)
  );
}
