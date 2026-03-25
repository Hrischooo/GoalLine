import { useEffect, useState } from 'react';
import InfoTooltip from './InfoTooltip';
import { formatScoutingMetricValue } from '../utils/playerMetrics';

function MetricCard({ metric }) {
  return (
    <article className={`scouting-metric scouting-metric--${metric.status}`}>
      <div className="scouting-metric__header">
        <span>{metric.label}</span>
        <InfoTooltip description={metric.tooltip} label={metric.label} />
      </div>

      <div className="scouting-metric__value-row">
        <strong>{formatScoutingMetricValue(metric)}</strong>
        <small>{Math.round(metric.percentile)}th pct</small>
      </div>

      <div className="scouting-metric__track">
        <div className="scouting-metric__fill" style={{ width: `${Math.max(0, Math.min(metric.percentile, 100))}%` }} />
      </div>
    </article>
  );
}

export default function PlayerScoutingReport({ metrics, playerName }) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [openSections, setOpenSections] = useState([]);

  useEffect(() => {
    setShowFullAnalysis(false);
    setOpenSections(metrics?.defaultScoutingSection ? [metrics.defaultScoutingSection] : []);
  }, [metrics?.defaultScoutingSection, playerName]);

  const sections = metrics?.scoutingSections || [];

  if (!sections.length) {
    return null;
  }

  function toggleSection(sectionKey) {
    setOpenSections((current) => (current.includes(sectionKey) ? current.filter((key) => key !== sectionKey) : [...current, sectionKey]));
  }

  return (
    <section className="scouting-report">
      <div className="scouting-report__header">
        <div>
          <p className="analysis-kicker">Advanced Analysis</p>
          <h3>Scouting Snapshot</h3>
          <p className="scouting-report__subtitle">
            Position-aware metrics for the {metrics.positionFamilyLabel?.toLowerCase()} profile.
          </p>
        </div>

        <div className="scouting-report__meta">
          <div className="scouting-report__tag">
            <span>Archetype</span>
            <strong>{metrics.playerArchetype}</strong>
          </div>
          <button className="secondary-button scouting-report__toggle" onClick={() => setShowFullAnalysis((current) => !current)} type="button">
            {showFullAnalysis ? 'Show Compact View' : 'Show Full Analysis'}
          </button>
        </div>
      </div>

      <div className="scouting-report__sections">
        {sections.map((section) => {
          const visibleMetrics = showFullAnalysis ? section.metrics : section.metrics.slice(0, section.compactCount);
          const isOpen = openSections.includes(section.key);
          const hiddenCount = section.metrics.length - visibleMetrics.length;

          return (
            <article className={`scouting-section${isOpen ? ' scouting-section--open' : ''}`} key={section.key}>
              <button className="scouting-section__button" onClick={() => toggleSection(section.key)} type="button">
                <div>
                  <h4>{section.title}</h4>
                  <p>{section.description}</p>
                </div>
                <span>{isOpen ? 'Hide' : 'Open'}</span>
              </button>

              {isOpen ? (
                <div className="scouting-section__body">
                  <div className="scouting-section__grid">
                    {visibleMetrics.map((metric) => (
                      <MetricCard key={metric.key} metric={metric} />
                    ))}
                  </div>
                  {!showFullAnalysis && hiddenCount > 0 ? <p className="scouting-section__footnote">+{hiddenCount} more metrics in full analysis</p> : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
