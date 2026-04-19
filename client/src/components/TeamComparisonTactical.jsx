import SectionHeader from './SectionHeader';
import { buildStyleComparisonRows } from '../utils/teamComparisonInsights';

function TacticalBarRow({ highlight, label, leftValue, rightValue, winner }) {
  return (
    <div className={`compare-scout-row${highlight ? ' compare-scout-row--spotlight' : ''}`}>
      <div className={`compare-scout-row__value compare-scout-row__value--left${winner === 'left' ? ' compare-scout-row__value--winner' : ''}`}>
        <strong>{leftValue}</strong>
      </div>
      <div className="compare-scout-row__center">
        <div className="compare-scout-row__label">
          <span>{label}</span>
        </div>
        <div className="compare-scout-row__bars">
          <div className="compare-scout-row__track compare-scout-row__track--left">
            <div className="compare-scout-row__fill compare-scout-row__fill--left" style={{ width: `${leftValue}%` }} />
          </div>
          <div className="compare-scout-row__track">
            <div className="compare-scout-row__fill compare-scout-row__fill--right" style={{ width: `${rightValue}%` }} />
          </div>
        </div>
      </div>
      <div className={`compare-scout-row__value compare-scout-row__value--right${winner === 'right' ? ' compare-scout-row__value--winner' : ''}`}>
        <strong>{rightValue}</strong>
      </div>
    </div>
  );
}

function RoleCoverageCard({ profile }) {
  return (
    <article className="compare-team-card">
      <div className="compare-team-card__header">
        <div>
          <p className="home-kicker">Role Coverage</p>
          <h3>{profile.identity.name}</h3>
        </div>
      </div>

      <div className="compare-chip-row">
        {profile.roleCoverage.strong.slice(0, 3).map((group) => (
          <span className="compare-team-pill compare-team-pill--good" key={`${profile.id}-${group.key}`}>
            {group.label}
          </span>
        ))}
      </div>

      <div className="compare-chip-row">
        {profile.roleCoverage.missing.slice(0, 2).map((group) => (
          <span className="compare-team-pill compare-team-pill--risk" key={`${profile.id}-${group.key}`}>
            Missing {group.label}
          </span>
        ))}
        {profile.roleCoverage.thin.slice(0, 2).map((group) => (
          <span className="compare-team-pill compare-team-pill--warn" key={`${profile.id}-${group.key}`}>
            Thin {group.label}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function TeamComparisonTactical({ controls, insights = [], leftProfile, rightProfile }) {
  const styleRows = buildStyleComparisonRows(leftProfile, rightProfile)
    .map((row) => ({
      ...row,
      delta: Math.abs(Number(row.leftValue) - Number(row.rightValue))
    }))
    .filter((row) => !controls.showOnlyDifferences || row.winner);
  const biggestDelta = styleRows.reduce((best, row) => Math.max(best, row.delta), 0);

  return (
    <section className="compare-section">
      <SectionHeader className="compare-section__header" kicker="Tactical Profile" title="How The Structures Differ" />

      <article className="comparison-card">
        <div className="comparison-card__rows comparison-card__rows--scouting">
          {styleRows.length ? (
            styleRows.map((row) => (
              <TacticalBarRow
                highlight={controls.highlightBiggestAdvantage && row.delta === biggestDelta && biggestDelta > 0}
                key={row.key}
                label={row.label}
                leftValue={row.leftValue}
                rightValue={row.rightValue}
                winner={row.winner}
              />
            ))
          ) : (
            <p className="compare-message">The current threshold removes the tactical differences here.</p>
          )}
        </div>
      </article>

      <div className="compare-team-summary-grid">
        <article className="compare-team-card">
          <div className="compare-team-card__header">
            <div>
              <p className="home-kicker">Shape Fit</p>
              <h3>{leftProfile.identity.name}</h3>
            </div>
          </div>
          <div className="compare-team-grid">
            <div className="compare-team-mini-stat">
              <span>Formation Score</span>
              <strong>{leftProfile.strength.formationFitScore}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Role Coherence</span>
              <strong>{leftProfile.strength.roleCoherence}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Position Coverage</span>
              <strong>{leftProfile.strength.positionCoverage}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Style Tag</span>
              <strong>{leftProfile.identity.styleTag}</strong>
            </div>
          </div>
        </article>

        <article className="compare-team-card">
          <div className="compare-team-card__header">
            <div>
              <p className="home-kicker">Shape Fit</p>
              <h3>{rightProfile.identity.name}</h3>
            </div>
          </div>
          <div className="compare-team-grid">
            <div className="compare-team-mini-stat">
              <span>Formation Score</span>
              <strong>{rightProfile.strength.formationFitScore}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Role Coherence</span>
              <strong>{rightProfile.strength.roleCoherence}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Position Coverage</span>
              <strong>{rightProfile.strength.positionCoverage}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Style Tag</span>
              <strong>{rightProfile.identity.styleTag}</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="compare-team-summary-grid">
        <RoleCoverageCard profile={leftProfile} />
        <RoleCoverageCard profile={rightProfile} />
      </div>

      <article className="comparison-card">
        <div className="comparison-card__header">
          <h3>Tactical Read</h3>
        </div>
        <div className="compare-insight-list">
          {insights.slice(0, controls.showOnlyDifferences ? 2 : 4).map((insight) => (
            <p className="compare-insight-item" key={insight}>
              {insight}
            </p>
          ))}
        </div>
      </article>
    </section>
  );
}
