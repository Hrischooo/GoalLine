import { formatPercentileLabel, toNumber } from './playerMetrics';
import {
  CATEGORY_META,
  average,
  getComparablePool,
  getPriorityMetricEntries,
  percentileFromValues,
  titleCase
} from './scoutingInsightHelpers';

function getDirection(delta) {
  if (delta >= 5) {
    return 'up';
  }

  if (delta <= -5) {
    return 'down';
  }

  return 'flat';
}

function describeDelta(delta) {
  if (delta >= 14) {
    return 'well above average';
  }

  if (delta >= 7) {
    return 'above average';
  }

  if (delta <= -14) {
    return 'well below average';
  }

  if (delta <= -7) {
    return 'below average';
  }

  return 'around average';
}

function buildCategoryDeltas(metrics, poolContext) {
  return Object.fromEntries(
    CATEGORY_META.map((entry) => {
      const currentValue = toNumber(metrics[`${entry.key}Score`]);
      const values = poolContext.pool.map((candidateMetrics) => toNumber(candidateMetrics[`${entry.key}Score`]));
      const averageValue = average(values);
      const percentile = percentileFromValues(values, currentValue);
      const delta = Math.round(currentValue - averageValue);

      return [
        entry.key,
        {
          label: entry.label,
          value: delta,
          rawValue: currentValue,
          average: Math.round(averageValue),
          percentile,
          descriptor: describeDelta(delta),
          direction: getDirection(delta)
        }
      ];
    })
  );
}

function buildMetricContext(metrics, poolContext) {
  return getPriorityMetricEntries(metrics, 4).map((entry) => {
    const comparableValues = poolContext.pool
      .map((candidateMetrics) => (candidateMetrics.metricBreakdown || []).find((metricEntry) => metricEntry.key === entry.key))
      .filter(Boolean)
      .map((metricEntry) => toNumber(metricEntry.comparableValue ?? metricEntry.rawValue ?? metricEntry.derivedValue));
    const currentComparable = toNumber(entry.comparableValue ?? entry.rawValue ?? entry.derivedValue);
    const percentile = comparableValues.length ? percentileFromValues(comparableValues, currentComparable, entry.invert) : Math.round(entry.percentile || 50);

    return {
      key: entry.key,
      label: entry.label,
      percentile,
      status: percentile >= 70 ? 'positive' : percentile <= 32 ? 'negative' : 'neutral'
    };
  });
}

function buildInsights(metrics, categoryDeltas, metricContext, poolContext) {
  const categoryEntries = Object.entries(categoryDeltas).sort((left, right) => right[1].value - left[1].value);
  const strongest = categoryEntries[0];
  const weakest = [...categoryEntries].reverse()[0];
  const positiveMetric = metricContext.find((entry) => entry.status === 'positive');
  const negativeMetric = metricContext.find((entry) => entry.status === 'negative');
  const balanceSpread = Math.max(...Object.values(categoryDeltas).map((entry) => entry.rawValue)) - Math.min(...Object.values(categoryDeltas).map((entry) => entry.rawValue));
  const insights = [];

  if (strongest?.[1]?.value >= 7) {
    insights.push(`${strongest[1].descriptor.charAt(0).toUpperCase() + strongest[1].descriptor.slice(1)} ${strongest[1].label.toLowerCase()} for a ${metrics.exactPosition}.`);
  }

  if (strongest?.[1]?.value >= 7 && weakest?.[1]?.value <= -7) {
    insights.push(`Above-average ${strongest[1].label.toLowerCase()}, but ${weakest[1].label.toLowerCase()} sits below the same-position baseline.`);
  } else if (weakest?.[1]?.value <= -7) {
    insights.push(`${weakest[1].descriptor.charAt(0).toUpperCase() + weakest[1].descriptor.slice(1)} ${weakest[1].label.toLowerCase()} relative to ${poolContext.poolLabel}.`);
  }

  if (positiveMetric) {
    insights.push(`${positiveMetric.label} stands out at ${formatPercentileLabel(positiveMetric.percentile)} inside this comparison pool.`);
  }

  if (negativeMetric && insights.length < 4) {
    insights.push(`${negativeMetric.label} is one of the lighter points in the profile against ${poolContext.poolLabel}.`);
  }

  insights.push(
    balanceSpread <= 12
      ? 'Well-rounded category mix relative to positional peers.'
      : `More skewed than balanced, with the profile leaning toward ${strongest?.[1]?.label.toLowerCase() || 'its strongest category'}.`
  );

  return insights.slice(0, 4);
}

export function buildLeagueComparisonProfile(player, metrics, players = [], ratingIndex = {}) {
  const poolContext = getComparablePool(player, metrics, players, ratingIndex, { minLeagueExact: 6, minDatasetExact: 8, minLeagueModel: 8 });
  const categoryDeltas = buildCategoryDeltas(metrics, poolContext);
  const metricContext = buildMetricContext(metrics, poolContext);
  const insights = buildInsights(metrics, categoryDeltas, metricContext, poolContext);
  const balanceSpread = Math.max(...Object.values(categoryDeltas).map((entry) => entry.rawValue)) - Math.min(...Object.values(categoryDeltas).map((entry) => entry.rawValue));
  const balanceLabel = balanceSpread <= 12 ? 'Balanced' : balanceSpread >= 24 ? 'Skewed' : 'Mixed';

  return {
    poolLabel: poolContext.poolLabel,
    sampleSize: poolContext.sampleSize,
    usedFallback: poolContext.usedFallback,
    balanceLabel,
    summary: `Benchmarked against ${poolContext.poolLabel}${poolContext.usedFallback ? ' using the best available positional fallback' : ''}.`,
    categoryDeltas,
    metricContext,
    insights
  };
}
