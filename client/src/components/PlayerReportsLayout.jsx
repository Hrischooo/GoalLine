export default function PlayerReportsLayout({ title, description, meta = [], children }) {
  return (
    <section className="player-report-shell">
      <header className="player-report-shell__header">
        <div>
          <p className="analysis-kicker">Reports</p>
          <h2>{title}</h2>
          <p className="player-report-shell__description">{description}</p>
        </div>

        <div className="player-report-shell__meta">
          {meta.map((item) => (
            <div className="player-report-shell__meta-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </header>

      <div className="player-report-shell__body">{children}</div>
    </section>
  );
}
