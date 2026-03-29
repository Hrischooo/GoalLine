function formatDelta(value) {
  const numeric = Number(value) || 0;
  return `${numeric >= 0 ? '+' : ''}${Math.round(numeric)}`;
}

function getDirectionArrow(direction) {
  if (direction === 'up') {
    return '↑';
  }

  if (direction === 'down') {
    return '↓';
  }

  return '•';
}

export default function LeagueComparisonPanel({ comparison }) {
  const categoryEntries = Object.entries(comparison?.categoryDeltas || {});

  return (
    <article className="group-card insight-card">
      <div className="group-card__header">
        <p className="analysis-kicker">Positional Context</p>
        <h3>Season vs League</h3>
        <p className="insight-card__summary">
          Compared against {comparison?.poolLabel || 'similar players'}{comparison?.sampleSize ? ` (${comparison.sampleSize} players)` : ''}.
        </p>
      </div>

      <div className="insight-card__topline">
        <div className="overview-card">
          <span>Profile Shape</span>
          <strong>{comparison?.balanceLabel || 'Mixed'}</strong>
        </div>
        <div className="overview-card">
          <span>Rarity</span>
          <strong>{comparison?.rarityLabel || 'Standard profile'}</strong>
        </div>
      </div>

      <div className="context-strip">
        {categoryEntries.map(([key, entry]) => (
          <div className={`overview-card overview-card--${entry.direction || 'flat'}`} key={key}>
            <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <strong>{formatDelta(entry.value)}</strong>
            <small>
              {getDirectionArrow(entry.direction)} {entry.descriptor} • {entry.percentile}th pct
            </small>
          </div>
        ))}
      </div>

      <div className="insight-list insight-list--stacked">
        <article className="insight-chip insight-chip--neutral">
          <strong>Context summary</strong>
          <p>{comparison?.summary}</p>
        </article>
        {(comparison?.insights || []).map((insight) => (
          <article className="insight-chip insight-chip--neutral" key={insight}>
            <p>{insight}</p>
          </article>
        ))}
      </div>
    </article>
  );
}
