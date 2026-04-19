import { formatStatValue, toNumber } from './playerMetrics';

export const SCOUT_SIGNAL_CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Signals', shortLabel: 'All' },
  { id: 'attacking', label: 'Attacking', shortLabel: 'Attack' },
  { id: 'creative', label: 'Creative', shortLabel: 'Creative' },
  { id: 'defensive', label: 'Defensive', shortLabel: 'Defensive' }
];

const CONFIDENCE_META = {
  high: { id: 'high', label: 'High', rank: 3 },
  medium: { id: 'medium', label: 'Medium', rank: 2 },
  low: { id: 'low', label: 'Low', rank: 1 }
};

const SIGNAL_DEFINITIONS = [
  {
    id: 'top-goalscorer',
    category: 'attacking',
    title: 'Top Goalscorer',
    metricLabel: 'Goals',
    symbol: 'G',
    tone: 'emerald',
    allowedPositions: ['ST', 'LW/RW', 'CAM'],
    minimumMinutes: 1000,
    selectionMarginPct: 0.05,
    selectionMarginAbsolute: 1,
    summary: 'Qualified scorer output from attacking profiles with a meaningful season sample.',
    detail:
      'Ranks goal scorers from ST, LW/RW, and CAM lanes. Only players above the minimum minutes gate are eligible, with stronger samples preferred when values are close.',
    eligibilityLabel: '1000+ mins · ST/LW-RW/CAM',
    qualify: (record) => toNumber(record.player.goals) > 0,
    buildRatedCandidates(eligibleRecords) {
      return eligibleRecords
        .map((record) => ({
          record,
          score: toNumber(record.player.goals),
          displayValue: toNumber(record.player.goals),
          supportLabel: `${formatStatValue(record.player.goals_p90)} G/90`
        }))
        .filter((entry) => entry.score > 0);
    },
    formatDisplayValue: (value) => String(Math.round(toNumber(value)))
  },
  {
    id: 'creative-efficiency',
    category: 'creative',
    title: 'Creative Efficiency',
    metricLabel: '%',
    symbol: 'CE',
    tone: 'cyan',
    allowedPositions: ['CAM', 'CM', 'LW/RW'],
    minimumMinutes: 1200,
    selectionMarginPct: 0.04,
    selectionMarginAbsolute: 1.5,
    summary: 'Chance creation efficiency with volume guardrails for real creators.',
    detail:
      'Uses key-pass efficiency with extra weight on key-pass volume so one-off creators do not hijack the leaderboard. Only qualified creative positions above the minutes gate are eligible.',
    eligibilityLabel: '1200+ mins · CAM/CM/LW-RW · 24+ key passes',
    qualify: (record) =>
      toNumber(record.metrics.scoutingMetricMap?.key_pass_eff?.value) > 0 &&
      toNumber(record.player.key_passes) >= 24,
    buildRatedCandidates(eligibleRecords) {
      const efficiencyValues = eligibleRecords.map((record) => toNumber(record.metrics.scoutingMetricMap?.key_pass_eff?.value));
      const keyPassValues = eligibleRecords.map((record) => toNumber(record.player.key_passes));

      return eligibleRecords
        .map((record) => {
          const efficiency = toNumber(record.metrics.scoutingMetricMap?.key_pass_eff?.value);
          const keyPasses = toNumber(record.player.key_passes);

          return {
            record,
            score: 0.65 * getPercentileScore(efficiencyValues, efficiency) + 0.35 * getPercentileScore(keyPassValues, keyPasses),
            displayValue: efficiency,
            supportLabel: `${Math.round(keyPasses)} key passes`
          };
        })
        .filter((entry) => entry.displayValue > 0);
    },
    formatDisplayValue: (value) => formatStatValue(value)
  },
  {
    id: 'progressive-distributor',
    category: 'creative',
    title: 'Progressive Distributor',
    metricLabel: '%',
    symbol: 'PD',
    tone: 'violet',
    allowedPositions: ['CB', 'DM', 'CM', 'LB/RB'],
    minimumMinutes: 1400,
    selectionMarginPct: 0.04,
    selectionMarginAbsolute: 1.5,
    summary: 'Line-breaking passing signal built from progression rate and real passing volume.',
    detail:
      'Favors progressive distributors in CB, DM, CM, and LB/RB lanes. Progressive pass rate drives the ranking, but total progressive-pass volume is blended in to reward sustained distribution.',
    eligibilityLabel: '1400+ mins · CB/DM/CM/LB-RB · 80+ progressive passes',
    qualify: (record) =>
      toNumber(record.metrics.scoutingMetricMap?.progressive_pass_rate?.value) > 0 &&
      toNumber(record.player.progressive_passes) >= 80,
    buildRatedCandidates(eligibleRecords) {
      const rateValues = eligibleRecords.map((record) => toNumber(record.metrics.scoutingMetricMap?.progressive_pass_rate?.value));
      const volumeValues = eligibleRecords.map((record) => toNumber(record.player.progressive_passes));

      return eligibleRecords
        .map((record) => {
          const rate = toNumber(record.metrics.scoutingMetricMap?.progressive_pass_rate?.value);
          const progressivePasses = toNumber(record.player.progressive_passes);

          return {
            record,
            score: 0.58 * getPercentileScore(rateValues, rate) + 0.42 * getPercentileScore(volumeValues, progressivePasses),
            displayValue: rate,
            supportLabel: `${Math.round(progressivePasses)} progressive passes`
          };
        })
        .filter((entry) => entry.displayValue > 0);
    },
    formatDisplayValue: (value) => formatStatValue(value)
  },
  {
    id: 'xg-overperformance',
    category: 'attacking',
    title: 'xG Overperformance',
    metricLabel: 'Diff',
    symbol: 'xG',
    tone: 'amber',
    allowedPositions: ['ST', 'LW/RW', 'CAM'],
    minimumMinutes: 1000,
    selectionMarginPct: 0.08,
    selectionMarginAbsolute: 0.3,
    summary: 'Positive finishing over expected-goals output from real attacking samples.',
    detail:
      'Highlights qualified attackers beating their expected-goals baseline. Players need a meaningful minutes sample plus a real shot/xG footprint before they can appear here.',
    eligibilityLabel: '1000+ mins · ST/LW-RW/CAM · 6+ xG or 40+ shots',
    qualify: (record) =>
      toNumber(record.metrics.scoutingMetricMap?.xg_diff?.value) > 0 &&
      (toNumber(record.player.expected_goals) >= 6 || toNumber(record.player.total_shots) >= 40),
    buildRatedCandidates(eligibleRecords) {
      return eligibleRecords
        .map((record) => ({
          record,
          score: toNumber(record.metrics.scoutingMetricMap?.xg_diff?.value),
          displayValue: toNumber(record.metrics.scoutingMetricMap?.xg_diff?.value),
          supportLabel: `${Math.round(toNumber(record.player.goals))} goals · ${formatStatValue(record.player.expected_goals)} xG`
        }))
        .filter((entry) => entry.score > 0);
    },
    formatDisplayValue: (value) => formatSignedValue(value)
  },
  {
    id: 'ball-winning',
    category: 'defensive',
    title: 'Ball Winning',
    metricLabel: 'Index',
    symbol: 'BW',
    tone: 'cyan',
    allowedPositions: ['CB', 'DM', 'LB/RB'],
    minimumMinutes: 1400,
    selectionMarginPct: 0.03,
    selectionMarginAbsolute: 2,
    summary: 'Defensive regain signal built from tackles, interceptions, and action volume.',
    detail:
      'Combines tackles won, interceptions, and defensive-actions-per-90 for qualified CB, DM, and LB/RB profiles. The leaderboard is sample-gated so short bursts do not dominate.',
    eligibilityLabel: '1400+ mins · CB/DM/LB-RB',
    qualify: (record) =>
      toNumber(record.player.tackles_won) > 0 &&
      toNumber(record.player.interceptions) > 0 &&
      toNumber(record.metrics.scoutingMetricMap?.def_actions_p90?.value) > 0,
    buildRatedCandidates(eligibleRecords) {
      const tacklesValues = eligibleRecords.map((record) => toNumber(record.player.tackles_won));
      const interceptionValues = eligibleRecords.map((record) => toNumber(record.player.interceptions));
      const actionValues = eligibleRecords.map((record) => toNumber(record.metrics.scoutingMetricMap?.def_actions_p90?.value));

      return eligibleRecords.map((record) => {
        const tacklesWon = toNumber(record.player.tackles_won);
        const interceptions = toNumber(record.player.interceptions);
        const defensiveActionsP90 = toNumber(record.metrics.scoutingMetricMap?.def_actions_p90?.value);
        const score =
          0.38 * getPercentileScore(actionValues, defensiveActionsP90) +
          0.34 * getPercentileScore(tacklesValues, tacklesWon) +
          0.28 * getPercentileScore(interceptionValues, interceptions);

        return {
          record,
          score,
          displayValue: score,
          supportLabel: `${Math.round(tacklesWon)} tackles won · ${Math.round(interceptions)} INT`
        };
      });
    },
    formatDisplayValue: (value) => String(Math.round(toNumber(value)))
  },
  {
    id: 'possession-security',
    category: 'creative',
    title: 'Possession Security',
    metricLabel: 'Index',
    symbol: 'PS',
    tone: 'emerald',
    allowedPositions: ['CB', 'DM', 'CM', 'LB/RB'],
    minimumMinutes: 1400,
    selectionMarginPct: 0.03,
    selectionMarginAbsolute: 2,
    summary: 'Secure circulation signal blending retention, pass completion, and lower turnover risk.',
    detail:
      'Rewards midfielders and build-up defenders who keep possession cleanly. Ball retention and pass completion are rewarded, while higher turnover risk pulls a profile down.',
    eligibilityLabel: '1400+ mins · CB/DM/CM/LB-RB · 900+ passes attempted',
    qualify: (record) =>
      toNumber(record.player.passes_attempted) >= 900 &&
      toNumber(record.metrics.scoutingMetricMap?.ball_retention?.value) > 0 &&
      toNumber(record.player.pass_completion_pct) > 0,
    buildRatedCandidates(eligibleRecords) {
      const completionValues = eligibleRecords.map((record) => toNumber(record.player.pass_completion_pct));
      const retentionValues = eligibleRecords.map((record) => toNumber(record.metrics.scoutingMetricMap?.ball_retention?.value));
      const riskValues = eligibleRecords.map((record) => toNumber(record.metrics.scoutingMetricMap?.risk_index?.value));

      return eligibleRecords.map((record) => {
        const passCompletion = toNumber(record.player.pass_completion_pct);
        const retention = toNumber(record.metrics.scoutingMetricMap?.ball_retention?.value);
        const riskIndex = toNumber(record.metrics.scoutingMetricMap?.risk_index?.value);
        const score =
          0.45 * getPercentileScore(retentionValues, retention) +
          0.35 * getPercentileScore(completionValues, passCompletion) +
          0.2 * getPercentileScore(riskValues, riskIndex, true);

        return {
          record,
          score,
          displayValue: score,
          supportLabel: `${formatStatValue(passCompletion)}% pass completion`
        };
      });
    },
    formatDisplayValue: (value) => String(Math.round(toNumber(value)))
  }
];

function formatSignedValue(value) {
  const numericValue = toNumber(value);

  if (numericValue > 0) {
    return `+${formatStatValue(numericValue)}`;
  }

  if (numericValue < 0) {
    return `-${formatStatValue(Math.abs(numericValue))}`;
  }

  return '0';
}

function getPercentileScore(values = [], value, invert = false) {
  const numericValues = values.filter((entry) => Number.isFinite(entry));

  if (!numericValues.length || !Number.isFinite(value)) {
    return 0;
  }

  const comparableValues = invert ? numericValues.map((entry) => -entry) : numericValues;
  const comparableValue = invert ? -value : value;
  const belowCount = comparableValues.filter((entry) => entry < comparableValue).length;
  const equalCount = comparableValues.filter((entry) => entry === comparableValue).length;

  return Math.round(((belowCount + equalCount * 0.5) / comparableValues.length) * 100);
}

function getSignalConfidence(record) {
  const minutes = toNumber(record.metrics.minutesPlayed);
  const coverage = toNumber(record.metrics.dataCoverageModifier) || 1;

  if (minutes >= 2200 && coverage >= 0.98) {
    return CONFIDENCE_META.high;
  }

  if (minutes >= 1400 && coverage >= 0.95) {
    return CONFIDENCE_META.medium;
  }

  return CONFIDENCE_META.low;
}

function isWithinSelectionMargin(value, topValue, definition) {
  const numericValue = toNumber(value);
  const numericTopValue = toNumber(topValue);

  if (!Number.isFinite(numericValue) || !Number.isFinite(numericTopValue)) {
    return false;
  }

  const delta = Math.max(
    toNumber(definition.selectionMarginAbsolute),
    Math.abs(numericTopValue) * toNumber(definition.selectionMarginPct)
  );

  return numericValue >= numericTopValue - delta;
}

function getEligibleRecords(records = [], definition) {
  return records.filter((record) => {
    if (!record?.player || !record?.metrics) {
      return false;
    }

    if (!definition.allowedPositions.includes(record.metrics.positionModel)) {
      return false;
    }

    if (toNumber(record.metrics.minutesPlayed) < definition.minimumMinutes) {
      return false;
    }

    return definition.qualify(record);
  });
}

function getRoleSummary(record) {
  const role = record.metrics.primaryTacticalRoleLabel && record.metrics.primaryTacticalRoleLabel !== '-' ? record.metrics.primaryTacticalRoleLabel : null;
  return [record.metrics.positionModel, role].filter(Boolean).join(' · ');
}

function getTrustLine(record, confidence) {
  return `${Math.round(toNumber(record.metrics.minutesPlayed)).toLocaleString()} mins · ${confidence.label} confidence`;
}

function getPercentileLine(percentile, definition) {
  if (!Number.isFinite(percentile)) {
    return definition.eligibilityLabel;
  }

  return `${percentile}th signal percentile · ${definition.eligibilityLabel}`;
}

function compareCandidates(left, right) {
  const leftConfidence = getSignalConfidence(left.record);
  const rightConfidence = getSignalConfidence(right.record);
  const confidenceDiff = rightConfidence.rank - leftConfidence.rank;

  if (confidenceDiff !== 0) {
    return confidenceDiff;
  }

  const scoreDiff = toNumber(right.score) - toNumber(left.score);

  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  const minuteDiff = toNumber(right.record.metrics.minutesPlayed) - toNumber(left.record.metrics.minutesPlayed);

  if (minuteDiff !== 0) {
    return minuteDiff;
  }

  return toNumber(right.record.metrics.finalOVR) - toNumber(left.record.metrics.finalOVR);
}

function buildSignalCard(definition, records) {
  const eligibleRecords = getEligibleRecords(records, definition);

  if (!eligibleRecords.length) {
    return null;
  }

  const ratedCandidates = definition.buildRatedCandidates(eligibleRecords).filter((entry) => Number.isFinite(entry.score) && Number.isFinite(entry.displayValue));

  if (!ratedCandidates.length) {
    return null;
  }

  const topScore = Math.max(...ratedCandidates.map((entry) => toNumber(entry.score)));
  const shortlist = ratedCandidates.filter((entry) => isWithinSelectionMargin(entry.score, topScore, definition));
  const sortedShortlist = [...shortlist].sort(compareCandidates);
  const winner = sortedShortlist[0] || ratedCandidates.sort(compareCandidates)[0];

  if (!winner) {
    return null;
  }

  const confidence = getSignalConfidence(winner.record);
  const signalPercentile = getPercentileScore(
    ratedCandidates.map((entry) => toNumber(entry.score)),
    toNumber(winner.score)
  );

  return {
    id: definition.id,
    category: definition.category,
    title: definition.title,
    metricLabel: definition.metricLabel,
    symbol: definition.symbol,
    tone: definition.tone,
    summary: definition.summary,
    detail: definition.detail,
    eligibilityLabel: definition.eligibilityLabel,
    value: definition.formatDisplayValue(winner.displayValue),
    playerName: winner.record.player.player,
    club: winner.record.player.squad,
    roleSummary: getRoleSummary(winner.record),
    trustLine: getTrustLine(winner.record, confidence),
    percentileLine: getPercentileLine(signalPercentile, definition),
    supportLabel: winner.supportLabel,
    confidence,
    playerKey: winner.record.key,
    record: winner.record
  };
}

export function buildScoutSignalCards(records = []) {
  return SIGNAL_DEFINITIONS.map((definition) => buildSignalCard(definition, records)).filter(Boolean);
}
