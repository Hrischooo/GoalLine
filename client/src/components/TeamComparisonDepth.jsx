import SectionHeader from './SectionHeader';
import { getComparisonWinner } from '../utils/teamComparisonInsights';

function DepthLineRow({ highlight, label, leftLine, rightLine }) {
  const winner = getComparisonWinner(leftLine.stabilityScore, rightLine.stabilityScore, 2);

  return (
    <div className={`comparison-row${highlight ? ' comparison-row--spotlight' : ''}`}>
      <div className={`comparison-row__value${winner === 'left' ? ' comparison-row__value--winner' : ''}`}>
        <strong>{leftLine.stabilityScore}</strong>
        <small>
          {leftLine.starterAverage} / {leftLine.backupAverage}
        </small>
      </div>
      <div className="comparison-row__label">
        <span>{label}</span>
        <small>{Math.abs(leftLine.dropoffAverage - rightLine.dropoffAverage).toFixed(1)} drop-off gap</small>
      </div>
      <div className={`comparison-row__value comparison-row__value--right${winner === 'right' ? ' comparison-row__value--winner' : ''}`}>
        <strong>{rightLine.stabilityScore}</strong>
        <small>
          {rightLine.starterAverage} / {rightLine.backupAverage}
        </small>
      </div>
    </div>
  );
}

function RiskCard({ profile }) {
  return (
    <article className="compare-team-card">
      <div className="compare-team-card__header">
        <div>
          <p className="home-kicker">Depth Risks</p>
          <h3>{profile.identity.name}</h3>
        </div>
      </div>

      <div className="compare-insight-list">
        {profile.squadHealth.fragilePositions.slice(0, 3).map((row) => (
          <p className="compare-insight-item" key={`${profile.id}-${row.position}`}>
            <strong>{row.position}</strong>: {row.starter} over {row.backup}. Drop-off {row.dropoff}.
          </p>
        ))}
      </div>

      <div className="compare-chip-row">
        {profile.squadHealth.overreliance.map((item) => (
          <span className={`compare-team-pill compare-team-pill--${item.severity.toLowerCase() === 'high' ? 'risk' : 'warn'}`} key={`${profile.id}-${item.title}`}>
            {item.severity} {item.title}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function TeamComparisonDepth({ controls, insights = [], leftProfile, rightProfile }) {
  const lines = ['attack', 'midfield', 'defense', 'goalkeeper'];
  const lineRows = lines
    .map((line) => {
      const leftLine = leftProfile.squadHealth.lineDepth.find((entry) => entry.line === line);
      const rightLine = rightProfile.squadHealth.lineDepth.find((entry) => entry.line === line);
      const winner = getComparisonWinner(leftLine.stabilityScore, rightLine.stabilityScore, 2);

      return {
        line,
        label: line === 'goalkeeper' ? 'Goalkeeper' : line.charAt(0).toUpperCase() + line.slice(1),
        leftLine,
        rightLine,
        winner,
        delta: Math.abs((leftLine?.stabilityScore || 0) - (rightLine?.stabilityScore || 0))
      };
    })
    .filter((row) => !controls.showOnlyDifferences || row.winner);
  const biggestDelta = lineRows.reduce((best, row) => Math.max(best, row.delta), 0);

  return (
    <section className="compare-section">
      <SectionHeader className="compare-section__header" kicker="Squad & Depth" title="Starter Level, Cover, And Fragility" />

      <article className="comparison-card">
        <div className="comparison-card__rows">
          {lineRows.length ? (
            lineRows.map((row) => (
              <DepthLineRow
                highlight={controls.highlightBiggestAdvantage && row.delta === biggestDelta && biggestDelta > 0}
                key={row.line}
                label={row.label}
                leftLine={row.leftLine}
                rightLine={row.rightLine}
              />
            ))
          ) : (
            <p className="compare-message">The current threshold removes the depth differences here.</p>
          )}
        </div>
      </article>

      <div className="compare-team-summary-grid">
        <article className="compare-team-card">
          <div className="compare-team-card__header">
            <div>
              <p className="home-kicker">XI vs Bench</p>
              <h3>{leftProfile.identity.name}</h3>
            </div>
          </div>
          <div className="compare-team-grid">
            <div className="compare-team-mini-stat">
              <span>Starter Avg</span>
              <strong>{leftProfile.squadHealth.bestXIStarterAverage.toFixed(1)}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Bench Avg</span>
              <strong>{leftProfile.squadHealth.benchStrength.averageBenchRating.toFixed(1)}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Top 7 Bench</span>
              <strong>{leftProfile.squadHealth.benchStrength.topSevenAverage.toFixed(1)}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Avg Drop-off</span>
              <strong>{leftProfile.squadHealth.averageDropoff.toFixed(1)}</strong>
            </div>
          </div>
        </article>

        <article className="compare-team-card">
          <div className="compare-team-card__header">
            <div>
              <p className="home-kicker">XI vs Bench</p>
              <h3>{rightProfile.identity.name}</h3>
            </div>
          </div>
          <div className="compare-team-grid">
            <div className="compare-team-mini-stat">
              <span>Starter Avg</span>
              <strong>{rightProfile.squadHealth.bestXIStarterAverage.toFixed(1)}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Bench Avg</span>
              <strong>{rightProfile.squadHealth.benchStrength.averageBenchRating.toFixed(1)}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Top 7 Bench</span>
              <strong>{rightProfile.squadHealth.benchStrength.topSevenAverage.toFixed(1)}</strong>
            </div>
            <div className="compare-team-mini-stat">
              <span>Avg Drop-off</span>
              <strong>{rightProfile.squadHealth.averageDropoff.toFixed(1)}</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="compare-team-summary-grid">
        <RiskCard profile={leftProfile} />
        <RiskCard profile={rightProfile} />
      </div>

      <article className="comparison-card">
        <div className="comparison-card__header">
          <h3>Depth Read</h3>
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
