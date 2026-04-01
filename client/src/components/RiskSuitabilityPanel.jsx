function RiskReasonList({ reasons = [] }) {
  return (
    <div className="insight-mini-list">
      {reasons.map((reason) => (
        <article className="insight-mini-row insight-mini-row--risk" key={reason.key}>
          <strong>{reason.title}</strong>
          <p>{reason.detail}</p>
        </article>
      ))}
    </div>
  );
}

export default function RiskSuitabilityPanel({ riskProfile, systemSuitability }) {
  return (
    <div className="risk-suitability-grid">
      <article className="insight-subcard insight-subcard--risk">
        <div className="insight-subcard__header">
          <div>
            <span className="insight-subcard__eyebrow">Data Risk</span>
            <h4>Risk Profile</h4>
          </div>
          <span className={`insight-badge insight-badge--${String(riskProfile?.level || 'medium').toLowerCase()}`}>{riskProfile?.level || 'Medium'}</span>
        </div>
        <p className="insight-subcard__summary">{riskProfile?.summary}</p>
        <div className="insight-subcard__meta">
          <span>Confidence</span>
          <strong>{riskProfile?.confidence || 'Moderate confidence'}</strong>
        </div>
        <RiskReasonList reasons={riskProfile?.reasons || []} />
      </article>

      <article className="insight-subcard insight-subcard--suitability">
        <div className="insight-subcard__header">
          <div>
            <span className="insight-subcard__eyebrow">Tactical Fit</span>
            <h4>System Suitability</h4>
          </div>
          <span className="insight-badge insight-badge--development">{systemSuitability?.confidence || 'Solid confidence'}</span>
        </div>
        <p className="insight-subcard__summary">{systemSuitability?.summary}</p>

        <div className="insight-mini-list">
          <article className="insight-mini-row">
            <strong>Best environments</strong>
            <div className="similar-player-card__tags">
              {(systemSuitability?.bestFits || []).map((fit) => (
                <span key={fit.key}>{fit.label}</span>
              ))}
            </div>
          </article>

          <article className="insight-mini-row">
            <strong>Formation examples</strong>
            <div className="similar-player-card__tags">
              {(systemSuitability?.formations || []).map((formation) => (
                <span key={formation}>{formation}</span>
              ))}
            </div>
          </article>

          {(systemSuitability?.lessIdeal || []).length ? (
            <article className="insight-mini-row insight-mini-row--caution">
              <strong>Less ideal</strong>
              {(systemSuitability?.lessIdeal || []).map((note) => (
                <p key={note.key}>{note.text}</p>
              ))}
            </article>
          ) : null}
        </div>
      </article>
    </div>
  );
}
