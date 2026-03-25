import { formatScoutingMetricValue, formatStatValue, toNumber } from './playerMetrics';

const POSITION_FAMILIES = {
  goalkeeper: 'goalkeeper',
  defender: 'defender',
  midfielder: 'midfielder',
  forward: 'forward'
};

const SECTION_META = {
  attacking: {
    key: 'attacking',
    title: 'Attacking',
    description: 'Direct output, shooting volume, and end-product.'
  },
  playmaking: {
    key: 'playmaking',
    title: 'Playmaking',
    description: 'Chance creation and line-breaking distribution.'
  },
  possession: {
    key: 'possession',
    title: 'Possession & Dribbling',
    description: 'Ball circulation, ball carrying, and on-ball security.'
  },
  defensive: {
    key: 'defensive',
    title: 'Defensive',
    description: 'Duel work, defensive actions, and recovery output.'
  },
  goalkeeping: {
    key: 'goalkeeping',
    title: 'Goalkeeping',
    description: 'Shot stopping and concession control.'
  }
};

const SECTION_ORDER = ['attacking', 'playmaking', 'possession', 'defensive', 'goalkeeping'];

const BASIC_METRIC_DEFINITIONS = {
  goals: {
    label: 'Goals',
    section: 'attacking',
    format: 'integer',
    tooltip: 'Total goals scored.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  goals_p90: {
    label: 'Goals P90',
    section: 'attacking',
    format: 'decimal',
    tooltip: 'Goals scored per 90 minutes.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  expected_goals: {
    label: 'Expected Goals',
    section: 'attacking',
    format: 'decimal',
    tooltip: 'Total expected goals generated from shots.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  shots_p90: {
    label: 'Shots P90',
    section: 'attacking',
    format: 'decimal',
    tooltip: 'Shots attempted per 90 minutes.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  total_shots: {
    label: 'Total Shots',
    section: 'attacking',
    format: 'integer',
    tooltip: 'Total shots attempted.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  shots_on_target_pct: {
    label: 'Shots On Target %',
    section: 'attacking',
    format: 'pct',
    tooltip: 'Share of shots that hit the target.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder]
  },
  assists: {
    label: 'Assists',
    section: 'playmaking',
    format: 'integer',
    tooltip: 'Total assists.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  assists_p90: {
    label: 'Assists P90',
    section: 'playmaking',
    format: 'decimal',
    tooltip: 'Assists per 90 minutes.',
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
  passes_into_final_third: {
    label: 'Passes Into Final Third',
    section: 'playmaking',
    format: 'integer',
    tooltip: 'Passes completed into the final third.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  passes_into_penalty_area: {
    label: 'Passes Into Penalty Area',
    section: 'playmaking',
    format: 'integer',
    tooltip: 'Passes completed into the opposition penalty area.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  pass_completion_pct: {
    label: 'Pass Completion %',
    section: 'possession',
    format: 'pct',
    tooltip: 'Share of attempted passes completed.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender, POSITION_FAMILIES.goalkeeper]
  },
  passes_completed: {
    label: 'Passes Completed',
    section: 'possession',
    format: 'integer',
    tooltip: 'Total completed passes.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender, POSITION_FAMILIES.goalkeeper]
  },
  progressive_carries: {
    label: 'Progressive Carries',
    section: 'possession',
    format: 'integer',
    tooltip: 'Carries that advance the ball significantly toward goal.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  take_ons_attempted: {
    label: 'Take-Ons Attempted',
    section: 'possession',
    format: 'integer',
    tooltip: 'Total dribble attempts versus a defender.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  successful_take_ons_pct: {
    label: 'Successful Take-Ons %',
    section: 'possession',
    format: 'pct',
    tooltip: 'Share of take-ons completed successfully.',
    relevantFamilies: [POSITION_FAMILIES.forward, POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  tackles_won: {
    label: 'Tackles Won',
    section: 'defensive',
    format: 'integer',
    tooltip: 'Successful tackles made.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  tackles_attempted: {
    label: 'Tackles Attempted',
    section: 'defensive',
    format: 'integer',
    tooltip: 'Total tackle attempts.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  interceptions: {
    label: 'Interceptions',
    section: 'defensive',
    format: 'integer',
    tooltip: 'Passes intercepted before reaching the opponent.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  clearances: {
    label: 'Clearances',
    section: 'defensive',
    format: 'integer',
    tooltip: 'Defensive clearances made.',
    relevantFamilies: [POSITION_FAMILIES.defender]
  },
  aerial_duels_won_pct: {
    label: 'Aerial Duels Won %',
    section: 'defensive',
    format: 'pct',
    tooltip: 'Share of aerial duels won.',
    relevantFamilies: [POSITION_FAMILIES.defender]
  },
  errors_made: {
    label: 'Errors Made',
    section: 'defensive',
    format: 'integer',
    invert: true,
    tooltip: 'Recorded defensive errors. Lower is better.',
    relevantFamilies: [POSITION_FAMILIES.midfielder, POSITION_FAMILIES.defender]
  },
  saves: {
    label: 'Saves',
    section: 'goalkeeping',
    format: 'integer',
    tooltip: 'Total saves made.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  },
  saves_pct: {
    label: 'Save %',
    section: 'goalkeeping',
    format: 'pct',
    tooltip: 'Share of shots on target saved.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  },
  clean_sheets: {
    label: 'Clean Sheets',
    section: 'goalkeeping',
    format: 'integer',
    tooltip: 'Matches finished without conceding.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  },
  goals_against: {
    label: 'Goals Against',
    section: 'goalkeeping',
    format: 'integer',
    invert: true,
    tooltip: 'Total goals conceded. Lower is better.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  },
  goals_against_p90: {
    label: 'Goals Against P90',
    section: 'goalkeeping',
    format: 'decimal',
    invert: true,
    tooltip: 'Goals conceded per 90 minutes. Lower is better.',
    relevantFamilies: [POSITION_FAMILIES.goalkeeper]
  }
};

const BASIC_SECTION_METRIC_KEYS = {
  attacking: ['goals', 'goals_p90', 'expected_goals', 'shots_p90', 'total_shots', 'shots_on_target_pct'],
  playmaking: ['assists', 'assists_p90', 'key_passes', 'progressive_passes', 'passes_into_final_third', 'passes_into_penalty_area'],
  possession: ['pass_completion_pct', 'passes_completed', 'progressive_carries', 'take_ons_attempted', 'successful_take_ons_pct'],
  defensive: ['tackles_won', 'tackles_attempted', 'interceptions', 'clearances', 'aerial_duels_won_pct', 'errors_made'],
  goalkeeping: ['saves', 'saves_pct', 'clean_sheets', 'goals_against', 'goals_against_p90']
};

const POSITION_PREVIEW_METRICS = {
  [POSITION_FAMILIES.forward]: [
    { key: 'goals_p90', type: 'basic', tone: 'accent-lime' },
    { key: 'xg_diff', type: 'advanced', tone: 'accent-cyan' }
  ],
  [POSITION_FAMILIES.midfielder]: [
    { key: 'key_pass_eff', type: 'advanced', tone: 'accent-cyan' },
    { key: 'progressive_pass_rate', type: 'advanced', tone: 'accent-teal' }
  ],
  [POSITION_FAMILIES.defender]: [
    { key: 'tackle_success', type: 'advanced', tone: 'accent-lime' },
    { key: 'interceptions', type: 'basic', tone: 'accent-cyan' }
  ],
  [POSITION_FAMILIES.goalkeeper]: [
    { key: 'save_eff', type: 'advanced', tone: 'accent-lime' },
    { key: 'clean_sheet_rate', type: 'advanced', tone: 'accent-cyan' }
  ]
};

function getMetricValue(player, metrics, metricKey) {
  if (metrics?.scoutingMetricMap?.[metricKey]) {
    return metrics.scoutingMetricMap[metricKey].value;
  }

  if (metrics && Object.prototype.hasOwnProperty.call(metrics, metricKey)) {
    return metrics[metricKey];
  }

  return player?.[metricKey];
}

function getCompactCount(sectionKey) {
  return sectionKey === 'goalkeeping' ? 3 : 4;
}

export function formatBasicMetricValue(metricOrKey, maybeValue, fallback = '-') {
  const metricKey = typeof metricOrKey === 'object' ? metricOrKey?.key : metricOrKey;
  const value = typeof metricOrKey === 'object' ? metricOrKey?.value : maybeValue;
  const definition = BASIC_METRIC_DEFINITIONS[metricKey];

  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (definition?.format === 'pct') {
    return `${formatStatValue(value, fallback)}%`;
  }

  if (definition?.format === 'integer') {
    return String(Math.round(toNumber(value)));
  }

  return formatStatValue(value, fallback);
}

function getRelevantMetricKeys(positionFamily, sectionKey) {
  return (BASIC_SECTION_METRIC_KEYS[sectionKey] || []).filter((metricKey) =>
    BASIC_METRIC_DEFINITIONS[metricKey]?.relevantFamilies?.includes(positionFamily)
  );
}

export function buildBasicReportSections(player, metrics) {
  const positionFamily = metrics?.positionFamily || POSITION_FAMILIES.midfielder;

  return SECTION_ORDER.map((sectionKey) => {
    if (sectionKey === 'goalkeeping' && positionFamily !== POSITION_FAMILIES.goalkeeper) {
      return null;
    }

    if (sectionKey !== 'goalkeeping' && positionFamily === POSITION_FAMILIES.goalkeeper) {
      return null;
    }

    const metricRows = getRelevantMetricKeys(positionFamily, sectionKey)
      .map((metricKey) => {
        const value = getMetricValue(player, metrics, metricKey);

        if (value === null || value === undefined || value === '') {
          return null;
        }

        return {
          key: metricKey,
          label: BASIC_METRIC_DEFINITIONS[metricKey].label,
          tooltip: BASIC_METRIC_DEFINITIONS[metricKey].tooltip,
          value,
          invert: Boolean(BASIC_METRIC_DEFINITIONS[metricKey].invert)
        };
      })
      .filter(Boolean);

    if (!metricRows.length) {
      return null;
    }

    return {
      ...SECTION_META[sectionKey],
      metrics: metricRows,
      compactCount: Math.min(getCompactCount(sectionKey), metricRows.length)
    };
  }).filter(Boolean);
}

function getAllowedMetricKeys(leftMetrics, rightMetrics) {
  const leftPositionFamily = leftMetrics?.positionFamily || POSITION_FAMILIES.midfielder;
  const rightPositionFamily = rightMetrics?.positionFamily || POSITION_FAMILIES.midfielder;
  const samePositionFamily = leftPositionFamily === rightPositionFamily;
  const leftKeys = new Set(
    SECTION_ORDER.flatMap((sectionKey) => getRelevantMetricKeys(leftPositionFamily, sectionKey))
  );
  const rightKeys = new Set(
    SECTION_ORDER.flatMap((sectionKey) => getRelevantMetricKeys(rightPositionFamily, sectionKey))
  );

  return {
    samePositionFamily,
    metricKeys: samePositionFamily ? [...leftKeys] : [...leftKeys].filter((metricKey) => rightKeys.has(metricKey))
  };
}

function getComparisonBarWidths(leftValue, rightValue, invert = false) {
  const left = toNumber(leftValue);
  const right = toNumber(rightValue);
  const maxValue = Math.max(left, right, 0);

  if (!maxValue) {
    return { leftWidth: '100%', rightWidth: '100%' };
  }

  if (invert) {
    const leftWidth = `${((maxValue - left) / maxValue) * 100}%`;
    const rightWidth = `${((maxValue - right) / maxValue) * 100}%`;
    return { leftWidth, rightWidth };
  }

  return {
    leftWidth: `${(left / maxValue) * 100}%`,
    rightWidth: `${(right / maxValue) * 100}%`
  };
}

export function buildBasicComparison(leftPlayer, leftMetrics, rightPlayer, rightMetrics) {
  const { samePositionFamily, metricKeys } = getAllowedMetricKeys(leftMetrics, rightMetrics);
  let leftWins = 0;
  let rightWins = 0;
  let tieCount = 0;

  const sections = SECTION_ORDER.map((sectionKey) => {
    const rows = (BASIC_SECTION_METRIC_KEYS[sectionKey] || [])
      .filter((metricKey) => metricKeys.includes(metricKey))
      .map((metricKey) => {
        const leftValue = getMetricValue(leftPlayer, leftMetrics, metricKey);
        const rightValue = getMetricValue(rightPlayer, rightMetrics, metricKey);

        if (
          leftValue === null ||
          leftValue === undefined ||
          leftValue === '' ||
          rightValue === null ||
          rightValue === undefined ||
          rightValue === ''
        ) {
          return null;
        }

        const invert = Boolean(BASIC_METRIC_DEFINITIONS[metricKey]?.invert);
        const leftNumber = toNumber(leftValue);
        const rightNumber = toNumber(rightValue);
        let winner = 'tie';

        if (leftNumber !== rightNumber) {
          if (invert) {
            winner = leftNumber < rightNumber ? 'left' : 'right';
          } else {
            winner = leftNumber > rightNumber ? 'left' : 'right';
          }
        }

        if (winner === 'left') {
          leftWins += 1;
        } else if (winner === 'right') {
          rightWins += 1;
        } else {
          tieCount += 1;
        }

        return {
          key: metricKey,
          label: BASIC_METRIC_DEFINITIONS[metricKey].label,
          tooltip: BASIC_METRIC_DEFINITIONS[metricKey].tooltip,
          winner,
          invert,
          leftValue,
          rightValue,
          ...getComparisonBarWidths(leftValue, rightValue, invert)
        };
      })
      .filter(Boolean);

    if (!rows.length) {
      return null;
    }

    return {
      ...SECTION_META[sectionKey],
      rows
    };
  }).filter(Boolean);

  return {
    samePositionFamily,
    leftWins,
    rightWins,
    tieCount,
    sections,
    defaultOpenSection: sections[0]?.key || null
  };
}

export function getDiscoveryPreviewMetrics(player, metrics) {
  const positionFamily = metrics?.positionFamily || POSITION_FAMILIES.midfielder;

  return (POSITION_PREVIEW_METRICS[positionFamily] || []).map((previewMetric) => {
    const scoutingMetric = metrics?.scoutingMetricMap?.[previewMetric.key];
    const value = scoutingMetric ? scoutingMetric.value : getMetricValue(player, metrics, previewMetric.key);
    const label =
      scoutingMetric?.label ||
      BASIC_METRIC_DEFINITIONS[previewMetric.key]?.label ||
      previewMetric.key
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

    return {
      key: previewMetric.key,
      label,
      tone: previewMetric.tone,
      value,
      formattedValue: scoutingMetric ? formatScoutingMetricValue(scoutingMetric) : formatBasicMetricValue(previewMetric.key, value)
    };
  });
}
