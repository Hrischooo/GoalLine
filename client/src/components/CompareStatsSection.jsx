import { useEffect, useMemo, useState } from 'react';
import InfoTooltip from './InfoTooltip';
import SectionHeader from './SectionHeader';
import { buildScoutingComparison, formatScoutingMetricValue } from '../utils/playerMetrics';
import { buildBasicComparison, formatBasicMetricValue } from '../utils/playerViews';
import { getRoleFocusSections } from '../utils/compareFiltersConfig';

const STORAGE_KEY = 'goalline-compare-metric-mode';

function MetricRow({ row }) {
  const leftWidth = `${Math.max(0, Math.min(row.leftMetric.percentile, 100))}%`;
  const rightWidth = `${Math.max(0, Math.min(row.rightMetric.percentile, 100))}%`;

  return (
    <div className={`compare-scout-row${row.isBiggestEdge ? ' compare-scout-row--spotlight' : ''}`} key={row.key}>
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
    <div className={`compare-scout-row${row.isBiggestEdge ? ' compare-scout-row--spotlight' : ''}`} key={row.key}>
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

function getBasicRowDelta(row) {
  const left = Number(row.leftValue) || 0;
  const right = Number(row.rightValue) || 0;
  return Math.abs(left - right) / Math.max(Math.abs(left), Math.abs(right), 1);
}

function getAdvancedRowDelta(row, samePositionFamily) {
  const leftValue = samePositionFamily ? Number(row.leftMetric?.value) || 0 : Number(row.leftMetric?.percentile) || 0;
  const rightValue = samePositionFamily ? Number(row.rightMetric?.value) || 0 : Number(row.rightMetric?.percentile) || 0;

  return Math.abs(leftValue - rightValue) / Math.max(Math.abs(leftValue), Math.abs(rightValue), samePositionFamily ? 1 : 100);
}

function getSectionPriorityKeys(comparison, controls, leftMetrics, rightMetrics) {
  if (controls.comparisonLens === 'role') {
    return getRoleFocusSections(leftMetrics?.primaryTacticalRoleLabel || rightMetrics?.primaryTacticalRoleLabel, leftMetrics?.positionModel || rightMetrics?.positionModel);
  }

  if (controls.comparisonLens === 'position') {
    return getRoleFocusSections('', leftMetrics?.positionModel || rightMetrics?.positionModel);
  }

  if (controls.showOnlyKeyCategories) {
    return [leftMetrics?.defaultScoutingSection, rightMetrics?.defaultScoutingSection].filter(Boolean);
  }

  return [];
}

export default function CompareStatsSection({ controls, leftMetrics, rightMetrics, leftPlayer, rightPlayer }) {
  const [metricMode, setMetricMode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'advanced';
    }

    return window.localStorage.getItem(STORAGE_KEY) || 'advanced';
  });
  const advancedComparison = useMemo(() => buildScoutingComparison(leftMetrics, rightMetrics), [leftMetrics, rightMetrics]);
  const basicComparison = useMemo(() => buildBasicComparison(leftPlayer, leftMetrics, rightPlayer, rightMetrics), [leftMetrics, leftPlayer, rightMetrics, rightPlayer]);
  const rawComparison = metricMode === 'advanced' ? advancedComparison : basicComparison;
  const comparison = useMemo(() => {
    const focusKeys = new Set(getSectionPriorityKeys(rawComparison, controls, leftMetrics, rightMetrics));
    const filteredSections = rawComparison.sections
      .map((section) => {
        const rows = section.rows
          .map((row) => ({
            ...row,
            rowDelta:
              metricMode === 'advanced'
                ? getAdvancedRowDelta(row, rawComparison.samePositionFamily)
                : getBasicRowDelta(row)
          }))
          .filter((row) => !controls.showOnlyDifferences || (row.winner !== 'tie' && row.rowDelta >= 0.06));

        return rows.length ? { ...section, rows } : null;
      })
      .filter(Boolean);
    const prioritizedSections =
      controls.showOnlyKeyCategories && focusKeys.size
        ? filteredSections.filter((section) => focusKeys.has(section.key))
        : controls.showOnlyKeyCategories
          ? filteredSections.slice(0, 2)
          : filteredSections;
    const maxDelta = prioritizedSections.reduce(
      (best, section) => Math.max(best, ...section.rows.map((row) => row.rowDelta || 0)),
      0
    );

    return {
      ...rawComparison,
      sections: prioritizedSections.map((section) => ({
        ...section,
        rows: section.rows.map((row) => ({
          ...row,
          isBiggestEdge: controls.highlightBiggestAdvantage && maxDelta > 0 && row.rowDelta >= maxDelta - 0.01
        }))
      })),
      defaultOpenSection:
        prioritizedSections.find((section) => section.key === rawComparison.defaultOpenSection)?.key || prioritizedSections[0]?.key || null
    };
  }, [controls, leftMetrics, metricMode, rawComparison, rightMetrics]);
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
        <p className="compare-message">
          {controls.showOnlyDifferences || controls.showOnlyKeyCategories
            ? 'The active compare controls trimmed this view to zero rows. Relax one of the controls to see the full matchup again.'
            : 'These players do not share enough position-safe advanced metrics for a direct scouting comparison.'}
        </p>
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
      {controls.showOnlyDifferences || controls.showOnlyKeyCategories || controls.comparisonLens !== 'auto' ? (
        <p className="compare-scout-note">
          {controls.showOnlyDifferences ? 'Only clear edges shown.' : 'Full row set shown.'}{' '}
          {controls.showOnlyKeyCategories ? 'Key categories only.' : ''}
          {controls.comparisonLens === 'position' ? ' Normalized toward the exact-position lane.' : ''}
          {controls.comparisonLens === 'role' ? ' Focused on role-relevant categories.' : ''}
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
