import { formatStatValue, toNumber } from '../utils/playerMetrics';

function getStatWinner(leftValue, rightValue) {
  const left = toNumber(leftValue);
  const right = toNumber(rightValue);

  if (left === right) {
    return 'tie';
  }

  return left > right ? 'left' : 'right';
}

function getDiffLabel(leftValue, rightValue) {
  const left = toNumber(leftValue);
  const right = toNumber(rightValue);
  const diff = Math.abs(left - right);

  if (!diff) {
    return '';
  }

  return `+${formatStatValue(diff)}`;
}

export default function CompareStatsSection({ groups, leftPlayer, rightPlayer }) {
  return (
    <section className="compare-section">
      <div className="compare-section__header">
        <div>
          <p className="home-kicker">Statistical Comparison</p>
          <h2>Production And Style</h2>
        </div>
      </div>

      <div className="comparison-groups">
        {groups.map((group) => (
          <article className="comparison-card" key={group.title}>
            <div className="comparison-card__header">
              <h3>{group.title}</h3>
            </div>

            <div className="comparison-card__rows">
              {group.stats.map(([label, key]) => {
                const winner = getStatWinner(leftPlayer[key], rightPlayer[key]);
                const diffLabel = getDiffLabel(leftPlayer[key], rightPlayer[key]);

                return (
                  <div className="comparison-row" key={key}>
                    <div className={`comparison-row__value${winner === 'left' ? ' comparison-row__value--winner' : ''}`}>
                      {formatStatValue(leftPlayer[key], 'N/A')}
                    </div>
                    <div className="comparison-row__label">
                      <span>{label}</span>
                      {winner !== 'tie' && diffLabel ? (
                        <small className={winner === 'left' ? 'comparison-row__delta comparison-row__delta--left' : 'comparison-row__delta comparison-row__delta--right'}>
                          {diffLabel}
                        </small>
                      ) : null}
                    </div>
                    <div className={`comparison-row__value comparison-row__value--right${winner === 'right' ? ' comparison-row__value--winner' : ''}`}>
                      {formatStatValue(rightPlayer[key], 'N/A')}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
