function getWinner(leftValue, rightValue) {
  if (leftValue === rightValue) {
    return 'tie';
  }

  return leftValue > rightValue ? 'left' : 'right';
}

const PROFILE_ROWS = [
  { label: 'Overall Rating', key: 'finalOVR' },
  { label: 'Exact Position', key: 'exactPosition' },
  { label: 'Primary Role', key: 'primaryTacticalRoleLabel' },
  { label: 'Secondary Role', key: 'secondaryTacticalRoleLabel' },
  { label: 'Role Confidence', key: 'tacticalRoleConfidence' }
];

function formatValue(key, value) {
  if (key === 'tacticalRoleConfidence') {
    return value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : '-';
  }

  return value ?? '-';
}

export default function CompareTacticalProfileSection({ leftMetrics, rightMetrics }) {
  return (
    <section className="compare-section">
      <div className="compare-section__header">
        <div>
          <p className="home-kicker">Tactical Profile</p>
          <h2>Side-By-Side Role Identity</h2>
        </div>
      </div>

      <div className="compare-profile-table">
        {PROFILE_ROWS.map((row) => {
          const leftValue = formatValue(row.key, leftMetrics[row.key]);
          const rightValue = formatValue(row.key, rightMetrics[row.key]);
          const winner = typeof leftValue === 'number' && typeof rightValue === 'number' ? getWinner(leftValue, rightValue) : 'tie';

          return (
            <div className="compare-profile-table__row" key={row.key}>
              <strong className={`compare-profile-table__value${winner === 'left' ? ' compare-profile-table__value--winner' : ''}`}>{leftValue}</strong>
              <span>{row.label}</span>
              <strong className={`compare-profile-table__value compare-profile-table__value--right${winner === 'right' ? ' compare-profile-table__value--winner' : ''}`}>
                {rightValue}
              </strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
