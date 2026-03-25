import { useEffect, useState } from 'react';
import InfoTooltip from './InfoTooltip';
import { formatBasicMetricValue } from '../utils/playerViews';

function BasicMetricCard({ metric }) {
  return (
    <article className="basic-metric-card">
      <div className="basic-metric-card__header">
        <span>{metric.label}</span>
        <InfoTooltip description={metric.tooltip} label={metric.label} />
      </div>
      <strong>{formatBasicMetricValue(metric)}</strong>
    </article>
  );
}

export default function PlayerBasicStatsReport({ playerName, sections }) {
  const [showFull, setShowFull] = useState(false);
  const [openSections, setOpenSections] = useState([]);

  useEffect(() => {
    setShowFull(false);
    setOpenSections(sections[0]?.key ? [sections[0].key] : []);
  }, [playerName, sections]);

  if (!sections.length) {
    return null;
  }

  return (
    <section className="scouting-report scouting-report--basic">
      <div className="scouting-report__header">
        <div>
          <p className="analysis-kicker">Basic Stats</p>
          <h3>Match Output Snapshot</h3>
          <p className="scouting-report__subtitle">Raw production and on-ball volume in the same positional structure as the advanced report.</p>
        </div>

        <button className="secondary-button scouting-report__toggle" onClick={() => setShowFull((current) => !current)} type="button">
          {showFull ? 'Show Compact View' : 'Show Full Stats'}
        </button>
      </div>

      <div className="scouting-report__sections">
        {sections.map((section) => {
          const isOpen = openSections.includes(section.key);
          const visibleMetrics = showFull ? section.metrics : section.metrics.slice(0, section.compactCount);

          return (
            <article className={`scouting-section${isOpen ? ' scouting-section--open' : ''}`} key={section.key}>
              <button
                className="scouting-section__button"
                onClick={() =>
                  setOpenSections((current) => (current.includes(section.key) ? current.filter((key) => key !== section.key) : [...current, section.key]))
                }
                type="button"
              >
                <div>
                  <h4>{section.title}</h4>
                  <p>{section.description}</p>
                </div>
                <span>{isOpen ? 'Hide' : 'Open'}</span>
              </button>

              {isOpen ? (
                <div className="scouting-section__body">
                  <div className="basic-report-grid">
                    {visibleMetrics.map((metric) => (
                      <BasicMetricCard key={metric.key} metric={metric} />
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
