import SectionHeader from './SectionHeader';

function PriorityCard({ profile }) {
  return (
    <article className="compare-team-card">
      <div className="compare-team-card__header">
        <div>
          <p className="home-kicker">Recruitment Priorities</p>
          <h3>{profile.identity.name}</h3>
        </div>
      </div>

      <div className="compare-priority-list">
        {profile.recruitment.priorities.map((item) => (
          <div className="compare-priority-card" key={`${profile.id}-${item.key}`}>
            <div className="compare-priority-card__top">
              <span className={`compare-team-pill compare-team-pill--${item.priority.toLowerCase() === 'high' ? 'risk' : item.priority.toLowerCase() === 'medium' ? 'warn' : 'good'}`}>
                {item.priority}
              </span>
              <strong>{item.title}</strong>
            </div>
            <p>{item.explanation}</p>
            {item.supportingEvidence.map((evidence) => (
              <small key={`${item.key}-${evidence}`}>{evidence}</small>
            ))}
          </div>
        ))}
      </div>

      <div className="compare-chip-row">
        {profile.recruitment.roleNeeds.map((item) => (
          <span className={`compare-team-pill compare-team-pill--${item.severity.toLowerCase() === 'high' ? 'risk' : 'warn'}`} key={`${profile.id}-${item.label}`}>
            {item.label}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function TeamComparisonRecruitment({ insights = [], leftProfile, rightProfile }) {
  return (
    <section className="compare-section">
      <SectionHeader className="compare-section__header" kicker="Recruitment View" title="Squad Building Pressure Points" />

      <div className="compare-team-summary-grid">
        <PriorityCard profile={leftProfile} />
        <PriorityCard profile={rightProfile} />
      </div>

      <article className="comparison-card">
        <div className="comparison-card__header">
          <h3>Structural Comparison</h3>
        </div>
        <div className="compare-insight-list">
          {insights.map((insight) => (
            <p className="compare-insight-item" key={insight}>
              {insight}
            </p>
          ))}
        </div>
      </article>
    </section>
  );
}
