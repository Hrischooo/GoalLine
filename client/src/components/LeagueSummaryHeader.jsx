import LeagueBadge from './LeagueBadge';

function SummaryMetric({ label, value }) {
  return (
    <div className="league-summary-header__metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function LeagueSummaryHeader({ league, onBack, onCompare }) {
  return (
    <section className="league-summary-header">
      <div className="league-summary-header__copy">
        <div className="league-header-row">
          <LeagueBadge name={league.name} size="large" />
          <div>
            <p className="home-kicker">League Detail</p>
            <h1>{league.name}</h1>
            <p className="league-summary-header__subtitle">
              {league.country} / {league.season} / {league.division}
            </p>
          </div>
        </div>

        <div className="league-summary-header__actions">
          <button className="secondary-button" type="button" onClick={onBack}>
            All leagues
          </button>
          <button className="primary-button" type="button" onClick={onCompare}>
            Open compare
          </button>
        </div>
      </div>

      <div className="league-summary-header__panel">
        <SummaryMetric label="Players" value={league.playersCount} />
        <SummaryMetric label="Clubs" value={league.clubs} />
        <SummaryMetric label="Average OVR" value={league.averageOVR} />
        <SummaryMetric label="Top Rated" value={`${league.topRatedPlayer} (${league.topRatedValue})`} />
      </div>
    </section>
  );
}
