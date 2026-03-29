import InfoTooltip from './InfoTooltip';
import { formatStatValue } from '../utils/playerMetrics';

function formatReliability(metrics) {
  const label = metrics?.reliabilityLabel || 'Medium';
  const minutes = Math.round(metrics?.minutesPlayed || 0);
  return `${label} (${minutes} mins)`;
}

function categoryEntries(metrics) {
  return (metrics?.positionCategoryScores || []).map((entry) => ({
    key: entry.key,
    label: entry.label,
    value: entry.score
  }));
}

function formatContribution(value) {
  const numericValue = Number(value) || 0;
  return `${numericValue >= 0 ? '+' : ''}${numericValue.toFixed(1)}`;
}

export default function OvrBreakdownTooltip({ metrics }) {
  const topPositives = (metrics?.topPositiveContributors || []).slice(0, 3);
  const topNegatives = (metrics?.topNegativeContributors || []).slice(0, 2);
  const hasBreakdown = Boolean(metrics?.metricBreakdown?.length || topPositives.length || topNegatives.length);

  return (
    <InfoTooltip
      className="floating-tooltip--ovr"
      description={metrics?.explanationSummary || metrics?.ovrExplanationNote}
      label={`OVR ${metrics?.finalOVR || '-'}`}
      content={
        <div className="ovr-tooltip">
          <div className="ovr-tooltip__summary">
            <div>
              <span>Position</span>
              <strong>{metrics?.positionModel || metrics?.exactPosition || '-'}</strong>
            </div>
            <div>
              <span>Archetype</span>
              <strong>{metrics?.playerArchetype || metrics?.archetype || '-'}</strong>
            </div>
            <div>
              <span>Consistency</span>
              <strong>{formatReliability(metrics)}</strong>
            </div>
          </div>

          <div className="ovr-tooltip__section">
            <span className="ovr-tooltip__eyebrow">Breakdown</span>
            <div className="ovr-tooltip__categories">
              <div>
                <span>Position Score</span>
                <strong>{formatStatValue(metrics?.positionScore, '-')}</strong>
              </div>
              <div>
                <span>Base Output</span>
                <strong>{formatStatValue(metrics?.baseOutputScore, '-')}</strong>
              </div>
              <div>
                <span>Consistency</span>
                <strong>{formatStatValue(metrics?.consistencyScore, '-')}</strong>
              </div>
            </div>
          </div>

          {topPositives.length ? (
            <div className="ovr-tooltip__section">
              <span className="ovr-tooltip__eyebrow">Top positives</span>
              <ul className="ovr-tooltip__list">
                {topPositives.map((metric) => (
                  <li key={metric.key}>
                    <strong>{metric.label}</strong>
                    <span>{formatContribution(metric.contributionDelta ?? metric.contribution)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {topNegatives.length ? (
            <div className="ovr-tooltip__section">
              <span className="ovr-tooltip__eyebrow">Top negatives</span>
              <ul className="ovr-tooltip__list">
                {topNegatives.map((metric) => (
                  <li key={metric.key}>
                    <strong>{metric.label}</strong>
                    <span>{formatContribution(metric.contributionDelta ?? metric.contribution)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="ovr-tooltip__section">
            <span className="ovr-tooltip__eyebrow">Category breakdown</span>
            <div className="ovr-tooltip__categories">
              {categoryEntries(metrics).map((entry) => (
                <div key={entry.key}>
                  <span>{entry.label}</span>
                  <strong>{entry.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {hasBreakdown ? <p className="ovr-tooltip__note">{metrics?.explanationSummary || metrics?.ovrExplanationNote}</p> : null}
        </div>
      }
    />
  );
}
