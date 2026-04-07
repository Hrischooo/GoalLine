function buildRingStyle(percentile) {
  return {
    '--stat-donut-progress': `${percentile}%`
  };
}

export default function StatDonut({ label, percentile, support = [], tone = 'cyan', value }) {
  return (
    <article className={`stat-donut stat-donut--${tone}`} style={buildRingStyle(percentile)}>
      <div className="stat-donut__visual">
        <div className="stat-donut__ring">
          <div className="stat-donut__center">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        </div>
      </div>

      <p className="stat-donut__percentile">{percentile}th percentile vs peers</p>
      <div className="stat-donut__support">
        {support.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </article>
  );
}
