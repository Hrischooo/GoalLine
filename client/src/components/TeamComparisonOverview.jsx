import SectionHeader from './SectionHeader';
import { getComparisonWinner } from '../utils/teamComparisonInsights';

const OVERVIEW_ROWS = [
  { key: 'teamRating', label: 'Team Rating' },
  { key: 'bestXIRating', label: 'Best XI Rating' },
  { key: 'attack', label: 'Attack Line', path: ['lineRatings', 'attack'] },
  { key: 'midfield', label: 'Midfield Line', path: ['lineRatings', 'midfield'] },
  { key: 'defense', label: 'Defense Line', path: ['lineRatings', 'defense'] },
  { key: 'goalkeeper', label: 'Goalkeeper', path: ['lineRatings', 'goalkeeper'] },
  { key: 'depthScore', label: 'Depth Score' },
  { key: 'benchStability', label: 'Bench Stability' }
];

const LEAGUE_CONTEXT_ROWS = [
  { key: 'teamRating', label: 'Team rating' },
  { key: 'attack', label: 'Attack' },
  { key: 'creativity', label: 'Creativity' },
  { key: 'depthScore', label: 'Depth' }
];

function getValue(profile, row) {
  if (row.path) {
    return row.path.reduce((current, key) => current?.[key], profile.strength);
  }

  return profile.strength[row.key];
}

function ComparisonRow({ highlight, label, leftValue, rightValue }) {
  const winner = getComparisonWinner(leftValue, rightValue, 1.5);

  return (
    <div className={`comparison-row${highlight ? ' comparison-row--spotlight' : ''}`}>
      <strong className={`comparison-row__value${winner === 'left' ? ' comparison-row__value--winner' : ''}`}>{leftValue}</strong>
      <div className="comparison-row__label">
        <span>{label}</span>
        <small className={`comparison-row__delta comparison-row__delta--${winner || 'neutral'}`}>
          {Math.abs(Number(leftValue) - Number(rightValue)) < 1.5 ? 'Level' : `${Math.abs(Number(leftValue) - Number(rightValue))} swing`}
        </small>
      </div>
      <strong className={`comparison-row__value comparison-row__value--right${winner === 'right' ? ' comparison-row__value--winner' : ''}`}>{rightValue}</strong>
    </div>
  );
}

function LeagueContextCard({ profile }) {
  const metrics = profile.leagueContext.metrics || {};

  return (
    <article className="compare-team-card">
      <div className="compare-team-card__header">
        <div>
          <p className="home-kicker">League Context</p>
          <h3>{profile.identity.name}</h3>
        </div>
        <span className="compare-team-pill">{profile.identity.league}</span>
      </div>

      <div className="compare-team-grid compare-team-grid--compact">
        {LEAGUE_CONTEXT_ROWS.map((row) => (
          <div className="compare-team-mini-stat" key={`${profile.id}-${row.key}`}>
            <span>{row.label}</span>
            <strong>{metrics[row.key] ? `#${metrics[row.key].rank}` : 'N/A'}</strong>
            <small>{metrics[row.key]?.label || 'Limited sample'}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function TeamComparisonOverview({ controls, insights = [], leftProfile, rightProfile }) {
  const visibleRows = OVERVIEW_ROWS
    .map((row) => {
      const leftValue = getValue(leftProfile, row);
      const rightValue = getValue(rightProfile, row);
      const delta = Math.abs(Number(leftValue) - Number(rightValue));
      const winner = getComparisonWinner(leftValue, rightValue, 1.5);

      return {
        ...row,
        leftValue,
        rightValue,
        delta,
        winner
      };
    })
    .filter((row) => !controls.showOnlyDifferences || row.winner);
  const biggestDelta = visibleRows.reduce((best, row) => Math.max(best, row.delta), 0);

  return (
    <section className="compare-section">
      <SectionHeader className="compare-section__header" kicker="Overview" title="Current Level & League Context" />

      <div className="comparison-card">
        <div className="comparison-card__rows">
          {visibleRows.length ? (
            visibleRows.map((row) => (
              <ComparisonRow
                highlight={controls.highlightBiggestAdvantage && row.delta === biggestDelta && biggestDelta > 0}
                key={row.key}
                label={row.label}
                leftValue={row.leftValue}
                rightValue={row.rightValue}
              />
            ))
          ) : (
            <p className="compare-message">The current threshold removes the overview differences here.</p>
          )}
        </div>
      </div>

      <div className="compare-team-summary-grid">
        <article className="compare-team-card">
          <div className="compare-team-card__header">
            <div>
              <p className="home-kicker">Shape Read</p>
              <h3>{leftProfile.identity.name}</h3>
            </div>
          </div>
          <div className="compare-team-grid">
            <div className="compare-team-mini-stat">
              <span>Preferred</span>
              <strong>{leftProfile.identity.preferredFormation}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Auto Best</span>
              <strong>{leftProfile.identity.detectedFormation}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Strongest Line</span>
              <strong>{leftProfile.identity.strongestLine}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Weakest Line</span>
              <strong>{leftProfile.identity.weakestLine}</strong>
            </div>
          </div>
          <p className="compare-team-note">{leftProfile.identity.tacticalIdentitySummary}</p>
        </article>

        <article className="compare-team-card">
          <div className="compare-team-card__header">
            <div>
              <p className="home-kicker">Shape Read</p>
              <h3>{rightProfile.identity.name}</h3>
            </div>
          </div>
          <div className="compare-team-grid">
            <div className="compare-team-mini-stat">
              <span>Preferred</span>
              <strong>{rightProfile.identity.preferredFormation}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Auto Best</span>
              <strong>{rightProfile.identity.detectedFormation}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Strongest Line</span>
              <strong>{rightProfile.identity.strongestLine}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Weakest Line</span>
              <strong>{rightProfile.identity.weakestLine}</strong>
            </div>
          </div>
          <p className="compare-team-note">{rightProfile.identity.tacticalIdentitySummary}</p>
        </article>
      </div>

      <div className="compare-team-summary-grid">
        <LeagueContextCard profile={leftProfile} />
        <LeagueContextCard profile={rightProfile} />
      </div>

      <article className="comparison-card">
        <div className="comparison-card__header">
          <h3>Scout Summary</h3>
        </div>
        <div className="compare-insight-list">
          {insights.slice(0, controls.showOnlyDifferences ? 2 : 3).map((insight) => (
            <p className="compare-insight-item" key={insight}>
              {insight}
            </p>
          ))}
        </div>
      </article>
    </section>
  );
}
