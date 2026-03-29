function InsightList({ items = [], title, tone }) {
  return (
    <div className="insight-section">
      <div className="insight-section__header">
        <span>{title}</span>
      </div>

      <div className="insight-list">
        {items.map((item) => (
          <article className={`insight-chip insight-chip--${tone}`} key={item.key}>
            <div className="insight-chip__top">
              <strong>{item.title}</strong>
              <span className={`insight-badge insight-badge--${item.severity || tone}`}>{item.severity || tone}</span>
            </div>
            <p>{item.explanation}</p>
            <div className="insight-chip__meta">
              <span>{item.confidence}</span>
              {(item.tags || []).slice(0, 3).map((tag) => (
                <span className="insight-chip__tag" key={`${item.key}-${tag}`}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function StrengthsWeaknessesPanel({ profile }) {
  return (
    <article className="group-card insight-card">
      <div className="group-card__header">
        <p className="analysis-kicker">Scouting Summary</p>
        <h3>Strengths & Weaknesses</h3>
        <p className="insight-card__summary">{profile?.summary}</p>
      </div>

      <div className="insight-card__topline">
        <div className="overview-card">
          <span>Profile Shape</span>
          <strong>{profile?.profileShape || 'Balanced'}</strong>
        </div>
        <div className="overview-card">
          <span>Confidence</span>
          <strong>{profile?.confidence || 'Moderate confidence'}</strong>
        </div>
      </div>

      <div className="insight-card__grid">
        <InsightList items={profile?.strengths || []} title="Strengths" tone="positive" />
        <InsightList items={profile?.weaknesses || []} title="Watch Areas" tone="negative" />
      </div>

      {(profile?.developmentAreas || []).length ? (
        <div className="insight-list insight-list--stacked">
          <article className="insight-section">
            <div className="insight-section__header">
              <span>Development Areas</span>
            </div>
            <div className="insight-list">
              {(profile?.developmentAreas || []).map((item) => (
                <article className="insight-chip insight-chip--neutral" key={item.key}>
                  <div className="insight-chip__top">
                    <strong>{item.title}</strong>
                    <span className="insight-badge insight-badge--development">{item.severity}</span>
                  </div>
                  <p>{item.explanation}</p>
                  <div className="insight-chip__meta">
                    <span>{item.confidence}</span>
                    {(item.tags || []).slice(0, 2).map((tag) => (
                      <span className="insight-chip__tag" key={`${item.key}-${tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </article>
  );
}
