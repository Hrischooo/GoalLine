import { useEffect, useMemo, useState } from 'react';
import InfoTooltip from './InfoTooltip';
import SectionHeader from './SectionHeader';
import { buildScoutingComparison, formatScoutingMetricValue } from '../utils/playerMetrics';
import { buildBasicComparison, formatBasicMetricValue } from '../utils/playerViews';

const STORAGE_KEY = 'goalline-compare-metric-mode';

function MetricRow({ row }) {
  const leftWidth = `${Math.max(0, Math.min(row.leftMetric.percentile, 100))}%`;
  const rightWidth = `${Math.max(0, Math.min(row.rightMetric.percentile, 100))}%`;

  return (
    <div className="compare-scout-row" key={row.key}>
      <div
        className={`compare-scout-row__value compare-scout-row__value--left${
          row.winner === 'left' ? ' compare-scout-row__value--winner' : row.winner === 'right' ? ' compare-scout-row__value--loser' : ''
        }`}
      >
        <strong>{formatScoutingMetricValue(row.leftMetric)}</strong>
        <small>{Math.round(row.leftMetric.percentile)}th pct</small>
      </div>

      <div className="compare-scout-row__center">
        <div className="compare-scout-row__label">
          <span>{row.label}</span>
          <InfoTooltip description={row.tooltip} label={row.label} />
        </div>

        <div className="compare-scout-row__bars">
          <div className="compare-scout-row__track compare-scout-row__track--left">
            <div className="compare-scout-row__fill compare-scout-row__fill--left" style={{ width: leftWidth }} />
          </div>
          <div className="compare-scout-row__track compare-scout-row__track--right">
            <div className="compare-scout-row__fill compare-scout-row__fill--right" style={{ width: rightWidth }} />
          </div>
        </div>
      </div>

      <div
        className={`compare-scout-row__value compare-scout-row__value--right${
          row.winner === 'right' ? ' compare-scout-row__value--winner' : row.winner === 'left' ? ' compare-scout-row__value--loser' : ''
        }`}
      >
        <strong>{formatScoutingMetricValue(row.rightMetric)}</strong>
        <small>{Math.round(row.rightMetric.percentile)}th pct</small>
      </div>
    </div>
  );
}

function BasicMetricRow({ row }) {
  return (
    <div className="compare-scout-row" key={row.key}>
      <div
        className={`compare-scout-row__value compare-scout-row__value--left${
          row.winner === 'left' ? ' compare-scout-row__value--winner' : row.winner === 'right' ? ' compare-scout-row__value--loser' : ''
        }`}
      >
        <strong>{formatBasicMetricValue(row.key, row.leftValue)}</strong>
      </div>

      <div className="compare-scout-row__center">
        <div className="compare-scout-row__label">
          <span>{row.label}</span>
          <InfoTooltip description={row.tooltip} label={row.label} />
        </div>

        <div className="compare-scout-row__bars">
          <div className="compare-scout-row__track compare-scout-row__track--left">
            <div className="compare-scout-row__fill compare-scout-row__fill--left" style={{ width: row.leftWidth }} />
          </div>
          <div className="compare-scout-row__track compare-scout-row__track--right">
            <div className="compare-scout-row__fill compare-scout-row__fill--right" style={{ width: row.rightWidth }} />
          </div>
        </div>
      </div>

      <div
        className={`compare-scout-row__value compare-scout-row__value--right${
          row.winner === 'right' ? ' compare-scout-row__value--winner' : row.winner === 'left' ? ' compare-scout-row__value--loser' : ''
        }`}
      >
        <strong>{formatBasicMetricValue(row.key, row.rightValue)}</strong>
      </div>
    </div>
  );
}

export default function CompareStatsSection({ leftMetrics, rightMetrics, leftPlayer, rightPlayer }) {
  const [metricMode, setMetricMode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'advanced';
    }

    return window.localStorage.getItem(STORAGE_KEY) || 'advanced';
  });
  const advancedComparison = useMemo(() => buildScoutingComparison(leftMetrics, rightMetrics), [leftMetrics, rightMetrics]);
  const basicComparison = useMemo(() => buildBasicComparison(leftPlayer, leftMetrics, rightPlayer, rightMetrics), [leftMetrics, leftPlayer, rightMetrics, rightPlayer]);
  const comparison = metricMode === 'advanced' ? advancedComparison : basicComparison;
  const [openSections, setOpenSections] = useState([]);

  useEffect(() => {
    setOpenSections(comparison.defaultOpenSection ? [comparison.defaultOpenSection] : []);
  }, [comparison.defaultOpenSection, leftPlayer?.player, metricMode, rightPlayer?.player]);

  function handleMetricModeChange(nextMode) {
    setMetricMode(nextMode);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    }
  }

  if (!comparison.sections.length) {
    return (
      <section className="compare-section">
        <SectionHeader className="compare-section__header" kicker="Scouting Comparison" title="Advanced Metric Matchup" />
        <p className="compare-message">These players do not share enough position-safe advanced metrics for a direct scouting comparison.</p>
      </section>
    );
  }

  function toggleSection(sectionKey) {
    setOpenSections((current) => (current.includes(sectionKey) ? current.filter((key) => key !== sectionKey) : [...current, sectionKey]));
  }

  return (
    <section className="compare-section">
      <SectionHeader
        actions={
          <div className="compare-stats-toolbar">
            <div className="metric-mode-tabs metric-mode-tabs--compare">
              <button
                className={`metric-mode-tabs__button${metricMode === 'basic' ? ' metric-mode-tabs__button--active' : ''}`}
                onClick={() => handleMetricModeChange('basic')}
                type="button"
              >
                Basic Stats
              </button>
              <button
                className={`metric-mode-tabs__button${metricMode === 'advanced' ? ' metric-mode-tabs__button--active' : ''}`}
                onClick={() => handleMetricModeChange('advanced')}
                type="button"
              >
                Advanced Metrics
              </button>
            </div>

            <div className="compare-scout-summary">
              <span>Player A wins: {comparison.leftWins}</span>
              <span>Player B wins: {comparison.rightWins}</span>
            </div>
          </div>
        }
        className="compare-section__header"
        kicker="Scouting Comparison"
        title={metricMode === 'advanced' ? 'Advanced Metric Matchup' : 'Basic Stat Matchup'}
      />

      {!comparison.samePositionFamily ? (
        <p className="compare-scout-note">
          {metricMode === 'advanced'
            ? 'Mixed positions detected. Bar lengths use role-relative percentiles to keep the comparison honest.'
            : 'Mixed positions detected. Only shared position-safe basic stats are shown.'}
        </p>
      ) : null}

      <div className="comparison-groups">
        {comparison.sections.map((section) => {
          const isOpen = openSections.includes(section.key);

          return (
            <article className={`comparison-card comparison-card--scouting${isOpen ? ' comparison-card--open' : ''}`} key={section.key}>
              <button className="comparison-card__toggle" onClick={() => toggleSection(section.key)} type="button">
                <div>
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </div>
                <span>{isOpen ? 'Hide' : 'Open'}</span>
              </button>

              {isOpen ? (
                <div className="comparison-card__rows comparison-card__rows--scouting">
                  {section.rows.map((row) => (
                    metricMode === 'advanced' ? <MetricRow key={row.key} row={row} /> : <BasicMetricRow key={row.key} row={row} />
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
