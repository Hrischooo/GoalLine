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
  if (!report?.cards?.length) {
    return (
      <PlayerReportsLayout description={report?.description} meta={report?.meta || []} title={report?.title || 'Player Analytics Report'}>
        <p className="details-message">Not enough comparable data was available to build the analytics report.</p>
      </PlayerReportsLayout>
    );
  }

  return (
    <PlayerReportsLayout description={report.description} meta={report.meta} title={report.title}>
      <div className="analytics-report-grid">
        {report.cards.map((card) => (
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
    </PlayerReportsLayout>
  );
}
