import { useState } from 'react';
import PlayerReportsLayout from './PlayerReportsLayout';
import RadarChart from './RadarChart';

function AnalyticsMetricRow({ metric }) {
  return (
    <div className={`analytics-report-card__metric analytics-report-card__metric--${metric.status}`}>
      <div>
        <strong>{metric.label}</strong>
        <span>{metric.percentile}th percentile</span>
      </div>
      <div className="analytics-report-card__metric-values">
        <span>{metric.playerDisplay}</span>
        <small>Avg {metric.averageDisplay}</small>
        <em>{metric.deltaLabel}</em>
      </div>
    </div>
  );
}

export default function PlayerAnalyticsReport({ averageLabel, playerLabel, report }) {
  const [showAllCards, setShowAllCards] = useState(false);
  const visibleCards = showAllCards ? report?.cards || [] : (report?.cards || []).slice(0, 2);

  if (!report?.overview && !report?.cards?.length) {
    return (
      <PlayerReportsLayout description={report?.description} meta={report?.meta || []} title={report?.title || 'Player Analytics Report'}>
        <p className="details-message">Not enough comparable data was available to build the analytics report.</p>
      </PlayerReportsLayout>
    );
  }

  return (
    <PlayerReportsLayout description={report.description} meta={report.meta} title={report.title}>
      {report.overview ? (
        <section className="analytics-report-overview">
          <article className="analytics-summary-card analytics-summary-card--radar">
            <header className="analytics-summary-card__header">
              <div>
                <h3>{report.overview.radarTitle || 'Profile Snapshot'}</h3>
                {report.overview.radarSubtitle ? <p className="analytics-summary-card__eyebrow">{report.overview.radarSubtitle}</p> : null}
                <p>{report.overview.peerSnippet}</p>
              </div>
            </header>

            <div className="analytics-summary-card__body">
              <RadarChart
                averageAxes={report.overview.averageAxes}
                averageLabel={averageLabel}
                playerAxes={report.overview.radarAxes}
                playerLabel={playerLabel}
              />
            </div>
          </article>

          <article className="analytics-summary-card analytics-summary-card--bars">
            <header className="analytics-summary-card__header">
              <div>
                <h3>Percentile Bars</h3>
                <p>High-signal category read against the current peer group.</p>
              </div>
            </header>

            <div className="analytics-summary-card__bars">
              {report.overview.percentileBars.map((bar) => (
                <div className="analytics-summary-bar" key={bar.key}>
                  <div className="analytics-summary-bar__top">
                    <strong>{bar.label}</strong>
                    <span>{bar.percentile}th pct</span>
                  </div>
                  <div className="analytics-summary-bar__track">
                    <div className={`analytics-summary-bar__fill analytics-summary-bar__fill--${bar.tone}`} style={{ width: `${bar.percentile}%` }} />
                  </div>
                  <small>
                    {bar.playerDisplay} vs avg {bar.averageDisplay}
                  </small>
                </div>
              ))}
            </div>

            <div className="analytics-summary-card__lists">
              <div>
                <span>Key strengths</span>
                {report.overview.strengths.map((item) => (
                  <strong key={item}>{item}</strong>
                ))}
              </div>
              <div>
                <span>Watch areas</span>
                {report.overview.weaknesses.map((item) => (
                  <strong key={item}>{item}</strong>
                ))}
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {report.cards?.length ? (
        <section className="analytics-report-deep-dive">
          <div className="analytics-report-deep-dive__header">
            <div>
              <h3>Detailed Metric Packs</h3>
              <p>Expanded role-specific radar cards with supporting peer comparisons.</p>
            </div>
            {report.cards.length > 2 ? (
              <button className="secondary-button analytics-report-deep-dive__toggle" onClick={() => setShowAllCards((current) => !current)} type="button">
                {showAllCards ? 'Show Summary View' : `Show All ${report.cards.length} Cards`}
              </button>
            ) : null}
          </div>

          <div className="analytics-report-grid">
            {visibleCards.map((card) => (
              <article className="analytics-report-card" key={card.key}>
                <header className="analytics-report-card__header">
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.insight}</p>
                  </div>
                  <span className={`analytics-report-card__tone analytics-report-card__tone--${card.tone.tone}`}>{card.tone.label}</span>
                </header>

                <div className="analytics-report-card__body">
                  <RadarChart averageAxes={card.averageAxes} averageLabel={averageLabel} playerAxes={card.radarAxes} playerLabel={playerLabel} />
                  <div className="analytics-report-card__metrics">
                    {card.metrics.map((metric) => (
                      <AnalyticsMetricRow key={metric.key} metric={metric} />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </PlayerReportsLayout>
  );
}
