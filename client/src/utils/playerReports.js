import { buildPlayerKey, getLeagueFilterValue, getLeagueName } from './dataset';
import { computeDisplayMetrics, formatStatValue, toNumber } from './playerMetrics';

const MINIMUM_LEAGUE_PEERS = 8;

const POSITION_BUCKETS = {
  GK: 'Goalkeeper',
  CB: 'Centre-Back',
  'LB/RB': 'Full-Back',
  DM: 'Defensive Midfielder',
  CM: 'Central Midfielder',
  CAM: 'Attacking Midfielder',
  'LW/RW': 'Winger',
  ST: 'Striker'
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function buildMetricMap(metrics = {}) {
  return Object.fromEntries((metrics.metricBreakdown || []).map((metric) => [metric.key, metric]));
}

function formatDisplayValue(value, unit = 'integer') {
  if (!Number.isFinite(value)) {
    return '-';
  }

  if (unit === 'pct') {
    return `${formatStatValue(value, '-')}%`;
  }

  if (unit === 'per90') {
    return formatStatValue(value * 3, '-');
  }

  return formatStatValue(value, '-');
}

function formatTableValue(value, kind = 'integer') {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return kind === 'pct' ? `${formatStatValue(value, '-')}%` : formatStatValue(value, '-');
}

function getDeltaLabel(delta, unit = 'integer') {
  if (!Number.isFinite(delta) || Math.abs(delta) < 0.001) {
    return 'Level';
  }

  const sign = delta > 0 ? '+' : '-';
  const absoluteValue = Math.abs(delta);

  if (unit === 'pct') {
    return `${sign}${formatStatValue(absoluteValue, '0')} pts`;
  }

  if (unit === 'per90') {
    return `${sign}${formatStatValue(absoluteValue * 3, '0')}/90`;
  }

  return `${sign}${formatStatValue(absoluteValue, '0')}`;
}

function calculatePercentile(values = [], target, invert = false) {
  if (!values.length || !Number.isFinite(target)) {
    return 50;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const lowerCount = sorted.filter((value) => value < target).length;
  const equalCount = sorted.filter((value) => value === target).length;
  const rank = ((lowerCount + Math.max(equalCount - 1, 0) * 0.5) / Math.max(sorted.length - 1, 1)) * 100;
  const normalized = clamp(rank, 0, 100);
  return Math.round(invert ? 100 - normalized : normalized);
}

function scaleRadarValue(value, min, max, invert = false) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max - min < 0.001) {
    return 50;
  }

  const ratio = clamp((value - min) / (max - min), 0, 1);
  return Math.round((invert ? 1 - ratio : ratio) * 100);
}

function getAnalyticsCardConfigs(positionModel) {
  switch (positionModel) {
    case 'GK':
      return [
        { key: 'shot_stopping', title: 'Shot Stopping', metrics: [['saves_per30', 'Saves', 'per90'], ['saves_pct', 'Save %', 'pct'], ['clean_sheets_pct', 'Clean Sheet %', 'pct'], ['goals_against_per30', 'Goals Against', 'per90', true]] },
        { key: 'command', title: 'Command', metrics: [['crosses_stopped_per30', 'Crosses Stopped', 'per90'], ['clean_sheets_pct', 'Clean Sheet %', 'pct'], ['passes_attempted_per30', 'Passes Attempted', 'per90'], ['pass_completion_pct', 'Pass Completion', 'pct']] },
        { key: 'distribution', title: 'Distribution', metrics: [['pass_completion_pct', 'Pass Completion', 'pct'], ['progressive_passes_per30', 'Progressive Passes', 'per90'], ['passes_completed_per30', 'Completed Passes', 'per90'], ['passes_attempted_per30', 'Pass Volume', 'per90']] }
      ];
    case 'CB':
      return [
        { key: 'defending', title: 'Defending', metrics: [['tackles_won_per30', 'Tackles Won', 'per90'], ['interceptions_per30', 'Interceptions', 'per90'], ['clearances_per30', 'Clearances', 'per90'], ['aerial_duel_win_pct', 'Aerial Wins', 'pct'], ['tackle_success_pct', 'Tackle Success', 'pct']] },
        { key: 'progression', title: 'Progression', metrics: [['progressive_passes_per30', 'Progressive Passes', 'per90'], ['passes_into_final_third_per30', 'Passes Into Final Third', 'per90'], ['passes_attempted_per30', 'Pass Volume', 'per90'], ['pass_completion_pct', 'Pass Completion', 'pct']] },
        { key: 'possession', title: 'Possession', metrics: [['pass_completion_pct', 'Pass Completion', 'pct'], ['passes_completed_per30', 'Completed Passes', 'per90'], ['progressive_passes_per30', 'Progressive Passes', 'per90'], ['possessions_lost_per30', 'Possessions Lost', 'per90', true]] }
      ];
    case 'LB/RB':
      return [
        { key: 'defending', title: 'Defending', metrics: [['tackles_won_per30', 'Tackles Won', 'per90'], ['interceptions_per30', 'Interceptions', 'per90'], ['blocks_per30', 'Blocks', 'per90'], ['tackle_success_pct', 'Tackle Success', 'pct']] },
        { key: 'creativity', title: 'Creativity', metrics: [['key_passes_per30', 'Key Passes', 'per90'], ['assists_per30', 'Assists', 'per90'], ['passes_into_penalty_area_per30', 'Passes Into Box', 'per90'], ['pass_completion_pct', 'Pass Completion', 'pct']] },
        { key: 'progression', title: 'Progression', metrics: [['progressive_carries_per30', 'Progressive Carries', 'per90'], ['progressive_passes_per30', 'Progressive Passes', 'per90'], ['carries_into_final_third_per30', 'Carries Into Final Third', 'per90'], ['successful_take_ons_per30', 'Successful Take-Ons', 'per90']] }
      ];
    case 'DM':
      return [
        { key: 'ball_winning', title: 'Ball Winning', metrics: [['tackles_won_per30', 'Tackles Won', 'per90'], ['interceptions_per30', 'Interceptions', 'per90'], ['passes_blocked_per30', 'Passes Blocked', 'per90'], ['tackle_success_pct', 'Tackle Success', 'pct']] },
        { key: 'control', title: 'Control', metrics: [['passes_attempted_per30', 'Pass Volume', 'per90'], ['passes_completed_per30', 'Completed Passes', 'per90'], ['pass_completion_pct', 'Pass Completion', 'pct'], ['possessions_lost_per30', 'Possessions Lost', 'per90', true]] },
        { key: 'progression', title: 'Progression', metrics: [['progressive_passes_per30', 'Progressive Passes', 'per90'], ['passes_into_final_third_per30', 'Passes Into Final Third', 'per90'], ['progressive_carries_per30', 'Progressive Carries', 'per90'], ['key_passes_per30', 'Key Passes', 'per90']] }
      ];
    case 'CAM':
      return [
        { key: 'creativity', title: 'Creativity', metrics: [['key_passes_per30', 'Key Passes', 'per90'], ['assists_per30', 'Assists', 'per90'], ['shot_creating_actions_per30', 'Shot Creating Actions', 'per90'], ['goal_creating_actions_per30', 'Goal Creating Actions', 'per90']] },
        { key: 'attacking', title: 'Attacking', metrics: [['goals_per30', 'Goals', 'per90'], ['xg_per30', 'xG', 'per90'], ['shots_per30', 'Shots', 'per90'], ['passes_into_penalty_area_per30', 'Passes Into Box', 'per90']] },
        { key: 'progression', title: 'Progression', metrics: [['progressive_passes_per30', 'Progressive Passes', 'per90'], ['progressive_carries_per30', 'Progressive Carries', 'per90'], ['carries_into_final_third_per30', 'Carries Into Final Third', 'per90'], ['pass_completion_pct', 'Pass Completion', 'pct']] }
      ];
    case 'LW/RW':
      return [
        { key: 'attacking', title: 'Attacking', metrics: [['goals_per30', 'Goals', 'per90'], ['xg_per30', 'xG', 'per90'], ['shots_per30', 'Shots', 'per90'], ['shots_on_target_pct', 'Shots On Target', 'pct']] },
        { key: 'creativity', title: 'Creativity', metrics: [['key_passes_per30', 'Key Passes', 'per90'], ['assists_per30', 'Assists', 'per90'], ['passes_into_penalty_area_per30', 'Passes Into Box', 'per90'], ['shot_creating_actions_per30', 'Shot Creating Actions', 'per90']] },
        { key: 'carrying', title: 'Carrying', metrics: [['successful_take_ons_per30', 'Successful Take-Ons', 'per90'], ['take_on_success_pct', 'Take-On Success', 'pct'], ['progressive_carries_per30', 'Progressive Carries', 'per90'], ['carries_into_penalty_area_per30', 'Carries Into Box', 'per90']] }
      ];
    case 'ST':
      return [
        { key: 'finishing', title: 'Finishing', metrics: [['goals_per30', 'Goals', 'per90'], ['np_goals_per30', 'NP Goals', 'per90'], ['xg_per30', 'xG', 'per90'], ['goals_per_shot', 'Goals Per Shot', 'decimal']] },
        { key: 'shot_threat', title: 'Shot Threat', metrics: [['shots_per30', 'Shots', 'per90'], ['xg_per30', 'xG', 'per90'], ['shots_on_target_pct', 'Shots On Target', 'pct'], ['carries_into_penalty_area_per30', 'Carries Into Box', 'per90']] },
        { key: 'link_play', title: 'Link Play', metrics: [['key_passes_per30', 'Key Passes', 'per90'], ['assists_per30', 'Assists', 'per90'], ['shot_creating_actions_per30', 'Shot Creating Actions', 'per90'], ['aerial_duel_win_pct', 'Aerial Wins', 'pct']] }
      ];
    case 'CM':
    default:
      return [
        { key: 'creativity', title: 'Creativity', metrics: [['key_passes_per30', 'Key Passes', 'per90'], ['assists_per30', 'Assists', 'per90'], ['shot_creating_actions_per30', 'Shot Creating Actions', 'per90'], ['passes_into_penalty_area_per30', 'Passes Into Box', 'per90']] },
        { key: 'possession', title: 'Possession', metrics: [['passes_attempted_per30', 'Pass Volume', 'per90'], ['passes_completed_per30', 'Completed Passes', 'per90'], ['pass_completion_pct', 'Pass Completion', 'pct'], ['progressive_passes_per30', 'Progressive Passes', 'per90']] },
        { key: 'ball_winning', title: 'Ball Winning', metrics: [['tackles_won_per30', 'Tackles Won', 'per90'], ['interceptions_per30', 'Interceptions', 'per90'], ['tackle_success_pct', 'Tackle Success', 'pct'], ['possessions_lost_per30', 'Possessions Lost', 'per90', true]] }
      ];
  }
}

function getTableColumns(positionModel) {
  const columns = [{ key: 'competition', label: 'Competition', kind: 'competition' }, { key: 'apps', label: 'Apps', kind: 'integer' }];

  if (positionModel === 'GK') {
    return [...columns, { key: 'clean_sheets', label: 'Clean Sheets', kind: 'integer' }, { key: 'saves', label: 'Saves', kind: 'integer' }, { key: 'saves_pct', label: 'Save %', kind: 'pct' }, { key: 'goals_against', label: 'Goals Against', kind: 'integer' }, { key: 'pass_completion_pct', label: 'Pass %', kind: 'pct' }];
  }

  if (positionModel === 'CB') {
    return [...columns, { key: 'goals', label: 'Goals', kind: 'integer' }, { key: 'assists', label: 'Assists', kind: 'integer' }, { key: 'tackles_won', label: 'Tackles', kind: 'integer' }, { key: 'interceptions', label: 'Interceptions', kind: 'integer' }, { key: 'clearances', label: 'Clearances', kind: 'integer' }, { key: 'pass_completion_pct', label: 'Pass %', kind: 'pct' }];
  }

  if (positionModel === 'LB/RB' || positionModel === 'DM' || positionModel === 'CM' || positionModel === 'CAM') {
    return [...columns, { key: 'goals', label: 'Goals', kind: 'integer' }, { key: 'assists', label: 'Assists', kind: 'integer' }, { key: 'expected_goals', label: 'xG', kind: 'decimal' }, { key: 'key_passes', label: 'Key Passes', kind: 'integer' }, { key: 'progressive_passes', label: 'Prog. Passes', kind: 'integer' }, { key: 'pass_completion_pct', label: 'Pass %', kind: 'pct' }];
  }

  return [...columns, { key: 'goals', label: 'Goals', kind: 'integer' }, { key: 'assists', label: 'Assists', kind: 'integer' }, { key: 'expected_goals', label: 'xG', kind: 'decimal' }, { key: 'total_shots', label: 'Shots', kind: 'integer' }, { key: 'key_passes', label: 'Key Passes', kind: 'integer' }, { key: 'pass_completion_pct', label: 'Pass %', kind: 'pct' }];
}

function getStatBlockConfigs(positionModel) {
  switch (positionModel) {
    case 'GK':
      return [
        { key: 'saves', label: 'Saves', sourceKey: 'saves', compareKey: 'saves_per30', kind: 'integer', tone: 'teal', support: ['saves_per30', 'saves_pct', 'clean_sheets'] },
        { key: 'save_pct', label: 'Save %', sourceKey: 'saves_pct', compareKey: 'saves_pct', kind: 'pct', tone: 'cyan', support: ['goals_against_per30', 'clean_sheets_pct', 'passes_attempted_per30'] },
        { key: 'clean_sheets', label: 'Clean Sheets', sourceKey: 'clean_sheets', compareKey: 'clean_sheets_pct', kind: 'integer', tone: 'lime', support: ['clean_sheets_pct', 'goals_against_per30', 'pass_completion_pct'] },
        { key: 'distribution', label: 'Distribution', sourceKey: 'passes_completed', compareKey: 'pass_completion_pct', kind: 'integer', tone: 'cyan', support: ['pass_completion_pct', 'progressive_passes_per30', 'passes_attempted'] }
      ];
    case 'CB':
      return [
        { key: 'tackles', label: 'Tackles Won', sourceKey: 'tackles_won', compareKey: 'tackles_won_per30', kind: 'integer', tone: 'teal', support: ['tackles_won_per30', 'tackle_success_pct', 'interceptions'] },
        { key: 'interceptions', label: 'Interceptions', sourceKey: 'interceptions', compareKey: 'interceptions_per30', kind: 'integer', tone: 'cyan', support: ['interceptions_per30', 'clearances', 'blocks_per30'] },
        { key: 'clearances', label: 'Clearances', sourceKey: 'clearances', compareKey: 'clearances_per30', kind: 'integer', tone: 'lime', support: ['clearances_per30', 'aerial_duel_win_pct', 'pass_completion_pct'] },
        { key: 'passing', label: 'Passing', sourceKey: 'passes_completed', compareKey: 'pass_completion_pct', kind: 'integer', tone: 'cyan', support: ['pass_completion_pct', 'progressive_passes', 'passes_into_final_third'] }
      ];
    case 'LB/RB':
      return [
        { key: 'tackles', label: 'Tackles Won', sourceKey: 'tackles_won', compareKey: 'tackles_won_per30', kind: 'integer', tone: 'teal', support: ['tackles_won_per30', 'interceptions', 'tackle_success_pct'] },
        { key: 'progression', label: 'Progression', sourceKey: 'progressive_carries', compareKey: 'progressive_carries_per30', kind: 'integer', tone: 'cyan', support: ['progressive_carries_per30', 'progressive_passes', 'carries_into_final_third_per30'] },
        { key: 'creation', label: 'Chances Created', sourceKey: 'key_passes', compareKey: 'key_passes_per30', kind: 'integer', tone: 'lime', support: ['key_passes_per30', 'assists', 'passes_into_penalty_area'] },
        { key: 'passing', label: 'Passing', sourceKey: 'passes_completed', compareKey: 'pass_completion_pct', kind: 'integer', tone: 'cyan', support: ['pass_completion_pct', 'passes_attempted', 'progressive_passes_per30'] }
      ];
    case 'DM':
      return [
        { key: 'ball_winning', label: 'Ball Winning', sourceKey: 'tackles_won', compareKey: 'tackles_won_per30', kind: 'integer', tone: 'teal', support: ['tackles_won_per30', 'interceptions', 'passes_blocked_per30'] },
        { key: 'interceptions', label: 'Interceptions', sourceKey: 'interceptions', compareKey: 'interceptions_per30', kind: 'integer', tone: 'cyan', support: ['interceptions_per30', 'tackle_success_pct', 'pass_completion_pct'] },
        { key: 'progression', label: 'Progressive Passes', sourceKey: 'progressive_passes', compareKey: 'progressive_passes_per30', kind: 'integer', tone: 'lime', support: ['progressive_passes_per30', 'passes_into_final_third', 'key_passes'] },
        { key: 'passing', label: 'Passing', sourceKey: 'passes_completed', compareKey: 'pass_completion_pct', kind: 'integer', tone: 'cyan', support: ['pass_completion_pct', 'passes_attempted', 'possessions_lost_per30'] }
      ];
    case 'CAM':
      return [
        { key: 'goals', label: 'Goals', sourceKey: 'goals', compareKey: 'goals_per30', kind: 'integer', tone: 'lime', support: ['goals_per30', 'xg_per30', 'total_shots'] },
        { key: 'creation', label: 'Chances Created', sourceKey: 'key_passes', compareKey: 'key_passes_per30', kind: 'integer', tone: 'cyan', support: ['key_passes_per30', 'assists', 'shot_creating_actions_per30'] },
        { key: 'progression', label: 'Progression', sourceKey: 'progressive_passes', compareKey: 'progressive_passes_per30', kind: 'integer', tone: 'teal', support: ['progressive_passes_per30', 'progressive_carries_per30', 'passes_into_final_third'] },
        { key: 'attacking', label: 'xG', sourceKey: 'expected_goals', compareKey: 'xg_per30', kind: 'decimal', tone: 'lime', support: ['xg_per30', 'shots_per30', 'passes_into_penalty_area'] }
      ];
    case 'LW/RW':
      return [
        { key: 'goals', label: 'Goals', sourceKey: 'goals', compareKey: 'goals_per30', kind: 'integer', tone: 'lime', support: ['goals_per30', 'xg_per30', 'total_shots'] },
        { key: 'xg', label: 'xG', sourceKey: 'expected_goals', compareKey: 'xg_per30', kind: 'decimal', tone: 'cyan', support: ['xg_per30', 'shots_per30', 'shots_on_target_pct'] },
        { key: 'take_ons', label: 'Take-Ons', sourceKey: 'take_ons_attempted', compareKey: 'successful_take_ons_per30', kind: 'integer', tone: 'teal', support: ['successful_take_ons_per30', 'take_on_success_pct', 'carries_into_penalty_area_per30'] },
        { key: 'creation', label: 'Chances Created', sourceKey: 'key_passes', compareKey: 'key_passes_per30', kind: 'integer', tone: 'cyan', support: ['key_passes_per30', 'assists', 'passes_into_penalty_area'] }
      ];
    case 'ST':
      return [
        { key: 'goals', label: 'Goals', sourceKey: 'goals', compareKey: 'goals_per30', kind: 'integer', tone: 'lime', support: ['goals_per30', 'np_goals_per30', 'goals_per_shot'] },
        { key: 'shot_threat', label: 'Shot Threat', sourceKey: 'total_shots', compareKey: 'shots_per30', kind: 'integer', tone: 'cyan', support: ['shots_per30', 'shots_on_target_pct', 'xg_per30'] },
        { key: 'xg', label: 'xG', sourceKey: 'expected_goals', compareKey: 'xg_per30', kind: 'decimal', tone: 'teal', support: ['xg_per30', 'goals', 'carries_into_penalty_area_per30'] },
        { key: 'link_play', label: 'Link Play', sourceKey: 'key_passes', compareKey: 'key_passes_per30', kind: 'integer', tone: 'cyan', support: ['key_passes_per30', 'assists', 'shot_creating_actions_per30'] }
      ];
    case 'CM':
    default:
      return [
        { key: 'creation', label: 'Key Passes', sourceKey: 'key_passes', compareKey: 'key_passes_per30', kind: 'integer', tone: 'lime', support: ['key_passes_per30', 'assists', 'shot_creating_actions_per30'] },
        { key: 'progression', label: 'Progressive Passes', sourceKey: 'progressive_passes', compareKey: 'progressive_passes_per30', kind: 'integer', tone: 'cyan', support: ['progressive_passes_per30', 'passes_into_final_third', 'progressive_carries_per30'] },
        { key: 'ball_winning', label: 'Tackles Won', sourceKey: 'tackles_won', compareKey: 'tackles_won_per30', kind: 'integer', tone: 'teal', support: ['tackles_won_per30', 'interceptions', 'tackle_success_pct'] },
        { key: 'passing', label: 'Passing', sourceKey: 'passes_completed', compareKey: 'pass_completion_pct', kind: 'integer', tone: 'cyan', support: ['pass_completion_pct', 'passes_attempted', 'possessions_lost_per30'] }
      ];
  }
}

function collectPeerContext(player, metrics, players = [], ratingIndex = {}) {
  const playerKey = buildPlayerKey(player);
  const leagueId = getLeagueFilterValue(player);
  const allPeers = players
    .filter((candidate) => buildPlayerKey(candidate) !== playerKey)
    .map((candidate) => ({ player: candidate, metrics: computeDisplayMetrics(candidate, ratingIndex) }))
    .filter((entry) => entry.metrics.positionModel === metrics.positionModel);
  const leaguePeers = allPeers.filter((entry) => getLeagueFilterValue(entry.player) === leagueId);
  const peerSnapshots = leaguePeers.length >= MINIMUM_LEAGUE_PEERS ? leaguePeers : allPeers;

  return {
    peerSnapshots,
    averageLabel: leaguePeers.length >= MINIMUM_LEAGUE_PEERS ? 'League average' : 'Positional average',
    comparisonLabel:
      leaguePeers.length >= MINIMUM_LEAGUE_PEERS ? `${getLeagueName(player)} ${metrics.exactPosition} peers` : `${metrics.exactPosition} peers across the dataset`
  };
}

function buildMetricComparison(metricConfig, playerMetricMap, peerSnapshots) {
  const [key, label, unit, invert = false] = metricConfig;
  const playerMetric = playerMetricMap[key];

  if (!playerMetric || playerMetric.missing || !Number.isFinite(toNumber(playerMetric.comparableValue))) {
    return null;
  }

  const peerValues = peerSnapshots.map((entry) => buildMetricMap(entry.metrics)[key]).filter(Boolean).map((metric) => toNumber(metric.comparableValue)).filter((value) => Number.isFinite(value));
  const playerValue = toNumber(playerMetric.comparableValue);
  const averageValue = peerValues.length ? peerValues.reduce((sum, value) => sum + value, 0) / peerValues.length : playerValue;
  const rangeValues = [...peerValues, playerValue, averageValue];
  const direction = invert ? -1 : 1;
  const delta = (playerValue - averageValue) * direction;

  return {
    key,
    label,
    unit,
    delta,
    deltaLabel: getDeltaLabel(delta, unit),
    status: delta > 0.01 ? 'positive' : delta < -0.01 ? 'negative' : 'neutral',
    playerDisplay: formatDisplayValue(playerValue, unit),
    averageDisplay: formatDisplayValue(averageValue, unit),
    playerRadarValue: scaleRadarValue(playerValue, Math.min(...rangeValues), Math.max(...rangeValues), invert),
    averageRadarValue: scaleRadarValue(averageValue, Math.min(...rangeValues), Math.max(...rangeValues), invert),
    percentile: calculatePercentile([...peerValues, playerValue], playerValue, invert)
  };
}

function joinLabels(items = []) {
  if (items.length <= 1) {
    return items[0]?.label.toLowerCase() || '';
  }

  if (items.length === 2) {
    return `${items[0].label.toLowerCase()} and ${items[1].label.toLowerCase()}`;
  }

  return `${items.slice(0, -1).map((item) => item.label.toLowerCase()).join(', ')}, and ${items[items.length - 1].label.toLowerCase()}`;
}

function buildCardInsight(metricRows = []) {
  const positives = metricRows.filter((metric) => metric.playerRadarValue - metric.averageRadarValue >= 10).slice(0, 2);
  const negatives = metricRows.filter((metric) => metric.playerRadarValue - metric.averageRadarValue <= -10).slice(0, 1);

  if (positives.length && negatives.length) {
    return `Performs above average in ${joinLabels(positives)}, but sits below peers for ${negatives[0].label.toLowerCase()}.`;
  }

  if (positives.length) {
    return `Stands above positional peers in ${joinLabels(positives)}.`;
  }

  if (negatives.length) {
    return `Runs below the peer average for ${negatives[0].label.toLowerCase()}, with the rest of the profile closer to baseline.`;
  }

  return 'Tracks close to the positional average across this profile.';
}

function buildCardTone(metricRows = []) {
  const averageDelta = metricRows.reduce((sum, metric) => sum + (metric.playerRadarValue - metric.averageRadarValue), 0) / Math.max(metricRows.length, 1);

  if (averageDelta >= 8) {
    return { label: 'Above average', tone: 'positive' };
  }

  if (averageDelta <= -8) {
    return { label: 'Below average', tone: 'negative' };
  }

  return { label: 'Balanced', tone: 'neutral' };
}

function buildFallbackAnalyticsCard(metrics, peerContext) {
  const fallbackDefinitions = [
    { key: 'attacking', label: 'Attack', value: toNumber(metrics.categoryScores?.attacking) },
    { key: 'playmaking', label: 'Creativity', value: toNumber(metrics.categoryScores?.playmaking) },
    { key: 'possession', label: 'Possession', value: toNumber(metrics.categoryScores?.possession) },
    { key: 'defending', label: 'Defending', value: toNumber(metrics.categoryScores?.defending) }
  ].filter((entry) => Number.isFinite(entry.value));

  const metricRows = fallbackDefinitions.map((definition) => {
    const peerValues = peerContext.peerSnapshots
      .map((entry) => toNumber(entry.metrics?.categoryScores?.[definition.key]))
      .filter((value) => Number.isFinite(value));
    const averageValue = peerValues.length ? peerValues.reduce((sum, value) => sum + value, 0) / peerValues.length : definition.value;
    const rangeValues = [...peerValues, definition.value, averageValue];
    const delta = definition.value - averageValue;

    return {
      key: definition.key,
      label: definition.label,
      delta,
      deltaLabel: getDeltaLabel(delta),
      status: delta > 0.01 ? 'positive' : delta < -0.01 ? 'negative' : 'neutral',
      playerDisplay: formatDisplayValue(definition.value),
      averageDisplay: formatDisplayValue(averageValue),
      playerRadarValue: scaleRadarValue(definition.value, Math.min(...rangeValues), Math.max(...rangeValues)),
      averageRadarValue: scaleRadarValue(averageValue, Math.min(...rangeValues), Math.max(...rangeValues)),
      percentile: calculatePercentile([...peerValues, definition.value], definition.value)
    };
  });

  if (!metricRows.length) {
    return null;
  }

  return {
    key: 'profile-balance',
    title: 'Profile Balance',
    tone: buildCardTone(metricRows),
    insight: 'Fallback profile view built from GoalLine category scores when the position-specific report pack is too thin.',
    metrics: metricRows,
    radarAxes: metricRows.map((metric) => ({ key: metric.key, label: metric.label, value: metric.playerRadarValue })),
    averageAxes: metricRows.map((metric) => ({ key: `${metric.key}-avg`, label: metric.label, value: metric.averageRadarValue }))
  };
}

function buildAnalyticsCards(metrics, peerContext) {
  const playerMetricMap = buildMetricMap(metrics);
  const analyticsCards = getAnalyticsCardConfigs(metrics.positionModel)
    .map((card) => {
      const metricRows = card.metrics.map((metric) => buildMetricComparison(metric, playerMetricMap, peerContext.peerSnapshots)).filter(Boolean);

      if (metricRows.length < 3) {
        return null;
      }

      return {
        key: card.key,
        title: card.title,
        tone: buildCardTone(metricRows),
        insight: buildCardInsight(metricRows),
        metrics: metricRows,
        radarAxes: metricRows.map((metric) => ({ key: metric.key, label: metric.label, value: metric.playerRadarValue })),
        averageAxes: metricRows.map((metric) => ({ key: `${metric.key}-avg`, label: metric.label, value: metric.averageRadarValue }))
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  if (analyticsCards.length) {
    return analyticsCards;
  }

  const fallbackCard = buildFallbackAnalyticsCard(metrics, peerContext);
  return fallbackCard ? [fallbackCard] : [];
}

function findCompetitionRows(players = [], player, ratingIndex = {}) {
  const targetName = normalizeText(player.player);
  const targetSeason = String(player.season || '');
  const targetBorn = String(player.born || '');
  const targetSquad = normalizeText(player.squad);
  const matches = players.filter((candidate) => normalizeText(candidate.player) === targetName && String(candidate.season || '') === targetSeason && (!targetBorn || !String(candidate.born || '') || String(candidate.born || '') === targetBorn) && (!targetSquad || normalizeText(candidate.squad) === targetSquad));
  const rows = (matches.length ? matches : [player]).map((record) => ({
    key: `${buildPlayerKey(record)}:${record.comp || record.league || 'competition'}`,
    competition: record.comp || getLeagueName(record),
    season: record.season || 'N/A',
    apps: toNumber(record.matches_played),
    minutes: Math.round(toNumber(record.matches_played) * toNumber(record.avg_mins_per_match)),
    goals: toNumber(record.goals),
    assists: toNumber(record.assists),
    expected_goals: toNumber(record.expected_goals),
    key_passes: toNumber(record.key_passes),
    progressive_passes: toNumber(record.progressive_passes),
    tackles_won: toNumber(record.tackles_won),
    interceptions: toNumber(record.interceptions),
    clearances: toNumber(record.clearances),
    total_shots: toNumber(record.total_shots),
    pass_completion_pct: toNumber(record.pass_completion_pct),
    saves: toNumber(record.saves),
    saves_pct: toNumber(record.saves_pct),
    clean_sheets: toNumber(record.clean_sheets),
    goals_against: toNumber(record.goals_against),
    passes_completed: toNumber(record.passes_completed),
    passes_attempted: toNumber(record.passes_attempted),
    take_ons_attempted: toNumber(record.take_ons_attempted),
    rating: toNumber(computeDisplayMetrics(record, ratingIndex).summaryScore)
  }));

  return rows.sort((left, right) => right.apps - left.apps || left.competition.localeCompare(right.competition));
}

function sumRows(rows = [], key) {
  return rows.reduce((sum, row) => sum + toNumber(row[key]), 0);
}

function averageRows(rows = [], key) {
  return rows.length ? sumRows(rows, key) / rows.length : 0;
}

function buildSummaryItems(metrics, rows) {
  const items = [{ key: 'apps', label: 'Total Apps', value: formatStatValue(sumRows(rows, 'apps'), '0') }, { key: 'minutes', label: 'Minutes', value: formatStatValue(sumRows(rows, 'minutes'), '0') }];

  if (metrics.positionModel === 'GK') {
    items.push({ key: 'saves', label: 'Saves', value: formatStatValue(sumRows(rows, 'saves'), '0') }, { key: 'clean_sheets', label: 'Clean Sheets', value: formatStatValue(sumRows(rows, 'clean_sheets'), '0') }, { key: 'save_pct', label: 'Save %', value: `${formatStatValue(averageRows(rows, 'saves_pct'), '0')}%` });
  } else {
    items.push({ key: 'goals', label: 'Goals', value: formatStatValue(sumRows(rows, 'goals'), '0') }, { key: 'assists', label: 'Assists', value: formatStatValue(sumRows(rows, 'assists'), '0') }, { key: 'key_passes', label: 'Key Passes', value: formatStatValue(sumRows(rows, 'key_passes'), '0') });
  }

  items.push({ key: 'rating', label: 'GoalLine Rating', value: formatStatValue(metrics.summaryScore, '0') });
  return items;
}

function buildSupportLabel(metricKey, metricMap, rowTotals) {
  const metric = metricMap[metricKey];

  if (metric) {
    if (metricKey.endsWith('_per30')) {
      return `${metric.label}: ${formatDisplayValue(toNumber(metric.comparableValue), 'per90')}/90`;
    }

    if (metricKey.includes('pct')) {
      return `${metric.label}: ${formatDisplayValue(toNumber(metric.comparableValue), 'pct')}`;
    }

    return `${metric.label}: ${formatStatValue(toNumber(metric.rawValue || metric.comparableValue), '-')}`;
  }

  if (metricKey in rowTotals) {
    return `${metricKey.replace(/_/g, ' ')}: ${formatStatValue(rowTotals[metricKey], '-')}`;
  }

  return null;
}

function buildStatBlocks(metrics, peerContext, rows) {
  const metricMap = buildMetricMap(metrics);
  const rowTotals = Object.keys(rows[0] || {}).reduce((accumulator, key) => {
    accumulator[key] = typeof rows[0]?.[key] === 'number' ? sumRows(rows, key) : rows[0]?.[key];
    return accumulator;
  }, {});

  return getStatBlockConfigs(metrics.positionModel)
    .map((config) => {
      const compareMetric = metricMap[config.compareKey];

      if (!compareMetric || compareMetric.missing) {
        return null;
      }

      const peerValues = peerContext.peerSnapshots.map((entry) => buildMetricMap(entry.metrics)[config.compareKey]).filter(Boolean).map((metric) => toNumber(metric.comparableValue)).filter((value) => Number.isFinite(value));
      const compareValue = toNumber(compareMetric.comparableValue);

      return {
        key: config.key,
        label: config.label,
        tone: config.tone,
        value: formatTableValue(config.sourceKey in rowTotals ? rowTotals[config.sourceKey] : toNumber(metricMap[config.sourceKey]?.comparableValue), config.kind),
        percentile: calculatePercentile([...peerValues, compareValue], compareValue),
        support: config.support.map((metricKey) => buildSupportLabel(metricKey, metricMap, rowTotals)).filter(Boolean).slice(0, 3)
      };
    })
    .filter(Boolean)
    .slice(0, 4);
}

export function buildPlayerReportsData({ player, metrics, players = [], ratingIndex = {} }) {
  if (!player || !metrics) {
    return { analyticsReport: null, statsReport: null };
  }

  const peerContext = collectPeerContext(player, metrics, players, ratingIndex);
  const competitionRows = findCompetitionRows(players, player, ratingIndex);

  return {
    analyticsReport: {
      title: 'Player Analytics Report',
      description: 'Position-specific radar cards benchmarked against the most relevant peer cohort.',
      meta: [{ label: 'Role', value: metrics.primaryTacticalRoleLabel || metrics.playerArchetype || POSITION_BUCKETS[metrics.positionModel] || metrics.exactPosition }, { label: 'Comparison set', value: peerContext.comparisonLabel }, { label: 'Minutes', value: formatStatValue(metrics.minutesPlayed, '0') }],
      averageLabel: peerContext.averageLabel,
      cards: buildAnalyticsCards(metrics, peerContext)
    },
    statsReport: {
      title: 'Player Stats Report',
      description: 'Competition output, a quick summary layer, and position-aware stat blocks in one clean view.',
      meta: [{ label: 'Competition set', value: competitionRows.length > 1 ? `${competitionRows.length} competitions` : competitionRows[0]?.competition || getLeagueName(player) }, { label: 'Apps', value: formatStatValue(sumRows(competitionRows, 'apps'), '0') }, { label: 'GoalLine rating', value: formatStatValue(metrics.summaryScore, '0') }],
      table: { columns: getTableColumns(metrics.positionModel), rows: competitionRows },
      summaryItems: buildSummaryItems(metrics, competitionRows),
      statBlocks: buildStatBlocks(metrics, peerContext, competitionRows)
    }
  };
}
