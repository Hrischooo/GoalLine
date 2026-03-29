function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function safeDivide(numerator, denominator, fallback = 0) {
  const numericDenominator = toNumber(denominator);

  if (!numericDenominator) {
    return fallback;
  }

  return toNumber(numerator) / numericDenominator;
}

function roundTo(value, digits = 3) {
  return Number(toNumber(value).toFixed(digits));
}

const POSITION_BUCKETS = {
  GK: 'GK',
  CB: 'DEF',
  RB: 'DEF',
  LB: 'DEF',
  LWB: 'DEF',
  RWB: 'DEF',
  DF: 'DEF',
  DM: 'MID',
  CM: 'MID',
  AM: 'MID',
  CAM: 'MID',
  MF: 'MID',
  RW: 'ATT',
  LW: 'ATT',
  ST: 'ATT',
  CF: 'ATT',
  FW: 'ATT'
};

function getExactPosition(player = {}) {
  return String(player.pos || '')
    .split(/[\/,;]+/)
    .map((part) => String(part || '').trim().toUpperCase())
    .filter(Boolean)[0] || 'CM';
}

function getPositionBucket(player = {}) {
  return POSITION_BUCKETS[getExactPosition(player)] || 'MID';
}

function getMinutesPlayed(player = {}) {
  const rawMinutes = toNumber(player.avg_mins_per_match);
  const matchesPlayed = toNumber(player.matches_played);

  if (!rawMinutes) {
    return matchesPlayed * 90;
  }

  if (rawMinutes > 130 || matchesPlayed <= 1) {
    return rawMinutes;
  }

  return rawMinutes * matchesPlayed;
}

function getScoutingMetrics(player = {}) {
  const minutes = getMinutesPlayed(player);
  const goals = toNumber(player.goals);
  const expectedGoals = toNumber(player.expected_goals);
  const totalShots = toNumber(player.total_shots);
  const shotsOnTargetPct = toNumber(player.shots_on_target_pct) / 100;
  const assists = toNumber(player.assists);
  const keyPasses = toNumber(player.key_passes);
  const progressivePasses = toNumber(player.progressive_passes);
  const passesAttempted = toNumber(player.passes_attempted);
  const takeOnsAttempted = toNumber(player.take_ons_attempted);
  const progressiveCarries = toNumber(player.progressive_carries);
  const possessionsLost = toNumber(player.possessions_lost);
  const passesIntoFinalThird = toNumber(player.passes_into_final_third);
  const passesCompleted = toNumber(player.passes_completed);
  const tacklesAttempted = toNumber(player.tackles_attempted);
  const tacklesWon = toNumber(player.tackles_won);
  const interceptions = toNumber(player.interceptions);
  const clearances = toNumber(player.clearances);
  const passesBlocked = toNumber(player.passes_blocked);
  const shotsBlocked = toNumber(player.shots_blocked);
  const errorsMade = toNumber(player.errors_made);
  const savesPct = toNumber(player.saves_pct) / 100;
  const cleanSheetsPct = toNumber(player.clean_sheets_pct) / 100;
  const goalsAgainst = toNumber(player.goals_against);
  const passAccuracy = toNumber(player.pass_completion_pct) / 100;
  const defensiveActions = tacklesWon + interceptions + clearances + passesBlocked + shotsBlocked;
  const defensiveEngagement = tacklesAttempted + interceptions + passesBlocked + shotsBlocked;
  const actionsInPossession = passesAttempted + takeOnsAttempted + progressiveCarries;
  const turnoverRate = safeDivide(possessionsLost, Math.max(actionsInPossession, 1));

  return {
    goals_p90: roundTo(safeDivide(goals * 90, Math.max(minutes, 1))),
    xg_diff: roundTo(goals - expectedGoals),
    finishing_ratio: roundTo(safeDivide(goals, Math.max(expectedGoals, 0.25))),
    shots_on_target_pct: roundTo(shotsOnTargetPct),
    key_pass_eff: roundTo(safeDivide(assists, Math.max(keyPasses, 1))),
    progressive_pass_rate: roundTo(safeDivide(progressivePasses, Math.max(passesAttempted, 1))),
    takeons_p90: roundTo(safeDivide(takeOnsAttempted * 90, Math.max(minutes, 1))),
    risk_index: roundTo(clamp(1 - turnoverRate, 0, 1)),
    final_third_rate: roundTo(safeDivide(passesIntoFinalThird, Math.max(passesAttempted, 1))),
    ball_retention: roundTo(safeDivide(passesCompleted, Math.max(passesCompleted + possessionsLost, 1))),
    def_engagement: roundTo(safeDivide(defensiveEngagement * 90, Math.max(minutes, 1))),
    tackle_success: roundTo(safeDivide(tacklesWon, Math.max(tacklesAttempted, 1))),
    def_actions_p90: roundTo(safeDivide(defensiveActions * 90, Math.max(minutes, 1))),
    interceptions: roundTo(interceptions),
    error_rate: roundTo(safeDivide(errorsMade * 90, Math.max(minutes, 1))),
    save_eff: roundTo(savesPct),
    clean_sheet_rate: roundTo(
      cleanSheetsPct || safeDivide(toNumber(player.clean_sheets), Math.max(toNumber(player.matches_played), 1))
    ),
    goals_against: roundTo(goalsAgainst),
    pass_accuracy: roundTo(passAccuracy),
    total_shots: roundTo(totalShots)
  };
}

const WEIGHT_DEFINITIONS = {
  ATT: [
    ['goals_p90', 0.25],
    ['xg_diff', 0.15],
    ['finishing_ratio', 0.15],
    ['shots_on_target_pct', 0.1],
    ['key_pass_eff', 0.1],
    ['progressive_pass_rate', 0.1],
    ['takeons_p90', 0.1],
    ['risk_index', 0.05]
  ],
  MID: [
    ['key_pass_eff', 0.2],
    ['progressive_pass_rate', 0.2],
    ['final_third_rate', 0.15],
    ['ball_retention', 0.15],
    ['def_engagement', 0.15],
    ['xg_diff', 0.1],
    ['takeons_p90', 0.05]
  ],
  DEF: [
    ['tackle_success', 0.25],
    ['def_actions_p90', 0.25],
    ['interceptions', 0.2],
    ['error_rate', -0.1],
    ['ball_retention', 0.1],
    ['progressive_pass_rate', 0.1]
  ],
  GK: [
    ['save_eff', 0.4],
    ['clean_sheet_rate', 0.3],
    ['goals_against', -0.2],
    ['pass_accuracy', 0.1]
  ]
};

function buildMetricRanges(playerSnapshots = []) {
  const ranges = {};

  for (const metrics of playerSnapshots) {
    for (const [metricKey, rawValue] of Object.entries(metrics)) {
      const value = toNumber(rawValue);
      const current = ranges[metricKey] || { min: value, max: value };
      current.min = Math.min(current.min, value);
      current.max = Math.max(current.max, value);
      ranges[metricKey] = current;
    }
  }

  return ranges;
}

function normalizeMetric(value, range) {
  if (!range || range.max === range.min) {
    return 0.5;
  }

  return clamp((toNumber(value) - range.min) / (range.max - range.min), 0, 1);
}

function scorePlayerOverall(positionBucket, metrics, ranges) {
  const weights = WEIGHT_DEFINITIONS[positionBucket] || WEIGHT_DEFINITIONS.MID;
  const weighted = weights.reduce((total, [metricKey, weight]) => total + normalizeMetric(metrics[metricKey], ranges[metricKey]) * weight, 0);
  return Math.round(clamp(weighted, 0, 1) * 100);
}

function computeRoleTag(positionBucket, metrics, ranges) {
  const profiles = {
    ATT: [
      ['Finisher', ['goals_p90', 'finishing_ratio', 'xg_diff']],
      ['Playmaker', ['key_pass_eff', 'progressive_pass_rate']],
      ['Progressor', ['takeons_p90', 'progressive_pass_rate', 'risk_index']]
    ],
    MID: [
      ['Playmaker', ['key_pass_eff', 'final_third_rate', 'ball_retention']],
      ['Progressor', ['progressive_pass_rate', 'ball_retention', 'takeons_p90']],
      ['Defender', ['def_engagement', 'tackle_success', 'interceptions']]
    ],
    DEF: [
      ['Defender', ['tackle_success', 'def_actions_p90', 'interceptions']],
      ['Progressor', ['progressive_pass_rate', 'ball_retention']],
      ['Playmaker', ['progressive_pass_rate', 'ball_retention']]
    ],
    GK: [
      ['Shot Stopper', ['save_eff', 'clean_sheet_rate']],
      ['Distributor', ['pass_accuracy', 'save_eff']]
    ]
  };

  const options = profiles[positionBucket] || profiles.MID;

  return options
    .map(([label, metricKeys]) => ({
      label,
      score:
        metricKeys.reduce((total, metricKey) => total + normalizeMetric(metrics[metricKey], ranges[metricKey]), 0) /
        Math.max(metricKeys.length, 1)
    }))
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label))[0]?.label || 'Profile';
}

function rankPlayersForTeam(players = []) {
  return [...players].sort((left, right) => {
    const leftMinutes = getMinutesPlayed(left);
    const rightMinutes = getMinutesPlayed(right);

    if (rightMinutes !== leftMinutes) {
      return rightMinutes - leftMinutes;
    }

    if (toNumber(right.overall_rating) !== toNumber(left.overall_rating)) {
      return toNumber(right.overall_rating) - toNumber(left.overall_rating);
    }

    return String(left.player || '').localeCompare(String(right.player || ''));
  });
}

function detectFormation(teamPlayers = [], preferredFormation = 'N/A') {
  if (!teamPlayers.length) {
    return preferredFormation || 'N/A';
  }

  const rankedPlayers = rankPlayersForTeam(teamPlayers);
  const goalkeeper = rankedPlayers.find((player) => getPositionBucket(player) === 'GK');
  const outfield = rankedPlayers.filter((player) => getPositionBucket(player) !== 'GK');

  if (!goalkeeper || outfield.length < 10) {
    return preferredFormation || 'N/A';
  }

  const startingEleven = [goalkeeper, ...outfield.slice(0, 10)];
  const defenders = startingEleven.filter((player) => getPositionBucket(player) === 'DEF');
  const midfielders = startingEleven.filter((player) => getPositionBucket(player) === 'MID');
  const attackers = startingEleven.filter((player) => getPositionBucket(player) === 'ATT');
  const exactCounts = startingEleven.reduce((accumulator, player) => {
    const position = getExactPosition(player);
    accumulator[position] = (accumulator[position] || 0) + 1;
    return accumulator;
  }, {});

  const defenderCount = defenders.length;
  const midfieldCount = midfielders.length;
  const attackerCount = attackers.length;
  const deeperMidfield = (exactCounts.DM || 0) + (exactCounts.CM || 0) + (exactCounts.MF || 0);
  const attackingBand = (exactCounts.AM || 0) + (exactCounts.CAM || 0) + (exactCounts.RW || 0) + (exactCounts.LW || 0);
  const strikerCount = (exactCounts.ST || 0) + (exactCounts.CF || 0) + (exactCounts.FW || 0);

  if (defenderCount >= 5) {
    return `5-${Math.max(2, midfieldCount)}-${Math.max(1, attackerCount)}`;
  }

  if (defenderCount === 4 && deeperMidfield >= 2 && attackingBand >= 3 && strikerCount >= 1) {
    return '4-2-3-1';
  }

  if (defenderCount === 4 && strikerCount >= 2 && midfieldCount >= 4) {
    return '4-4-2';
  }

  if (defenderCount && midfieldCount && attackerCount) {
    return `${defenderCount}-${midfieldCount}-${attackerCount}`;
  }

  return preferredFormation || 'N/A';
}

function buildPlayerAnalytics(players = []) {
  const snapshots = players.map((player) => getScoutingMetrics(player));
  const metricRanges = buildMetricRanges(snapshots);

  return players.map((player, index) => {
    const metrics = snapshots[index];
    const positionBucket = getPositionBucket(player);
    const overallRating = scorePlayerOverall(positionBucket, metrics, metricRanges);
    const roleTag = computeRoleTag(positionBucket, metrics, metricRanges);

    return {
      ...player,
      position_group: positionBucket,
      overall_rating: overallRating,
      role_tag: roleTag,
      analytics_snapshot: metrics
    };
  });
}

module.exports = {
  buildPlayerAnalytics,
  detectFormation,
  getExactPosition,
  getMinutesPlayed,
  getPositionBucket,
  getScoutingMetrics,
  toNumber
};
