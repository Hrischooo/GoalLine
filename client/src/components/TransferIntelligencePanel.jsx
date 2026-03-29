export default function TransferIntelligencePanel({ profile }) {
  return (
    <article className="group-card insight-card insight-card--transfer">
      <div className="group-card__header">
        <p className="analysis-kicker">Transfer Intelligence</p>
        <h3>Best Team Fits</h3>
        <p className="insight-card__summary">{profile?.systemFitSummary}</p>
      </div>

      <div className="insight-card__topline">
        <div className="overview-card">
          <span>Fit Confidence</span>
          <strong>{profile?.fitConfidence || 'Moderate confidence'}</strong>
        </div>
        <div className="overview-card">
          <span>Best Structure</span>
          <strong>{(profile?.bestFormationFits || [])[0] || 'N/A'}</strong>
        </div>
      </div>

      {profile?.profileSummary ? (
        <article className="insight-chip insight-chip--neutral">
          <strong>Role Translation</strong>
          <p>{profile.profileSummary}</p>
        </article>
      ) : null}

      {profile?.lessIdealContext ? (
        <article className="insight-chip insight-chip--negative">
          <strong>Less Ideal Context</strong>
          <p>{profile.lessIdealContext}</p>
        </article>
      ) : null}

      <div className="transfer-fit-strip">
        {(profile?.bestFormationFits || []).slice(0, 3).map((formation) => (
          <div className="highlight-card" key={formation}>
            <span>Formation fit</span>
            <strong>{formation}</strong>
          </div>
        ))}
      </div>

      <div className="transfer-team-list">
        {(profile?.bestTeams || []).length ? (
          (profile?.bestTeams || []).map((team) => (
            <article className="transfer-team-card" key={team.teamName}>
              <div className="transfer-team-card__top">
                <div>
                  <strong>{team.teamName}</strong>
                  <p>{team.projectedRole}</p>
                </div>
                <div className="transfer-team-card__score">
                  <span>Fit</span>
                  <strong>{team.fitScore}</strong>
                </div>
              </div>
              <div className="transfer-team-card__meta">
                <span>{team.fitConfidence}</span>
                <span>{team.roleFit}</span>
                <span>{team.lineNeed} need</span>
              </div>
              <p>{team.tacticalMatchSummary}</p>
              {(team.whyItFits || []).length ? (
                <div className="transfer-team-card__reasons">
                  {(team.whyItFits || []).map((reason) => (
                    <span className="transfer-team-card__reason" key={`${team.teamName}-${reason}`}>
                      {reason}
                    </span>
                  ))}
                </div>
              ) : null}
              {team.caution ? (
                <div className="transfer-team-card__caution">
                  <strong>Watch-out</strong>
                  <p>{team.caution}</p>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <article className="insight-chip insight-chip--neutral">
            <p>Team-fit recommendations are unavailable until enough club profile data is loaded.</p>
          </article>
        )}
      </div>
    </article>
  );
}
