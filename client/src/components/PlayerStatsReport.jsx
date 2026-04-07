import CompetitionTable from './CompetitionTable';
import PlayerReportsLayout from './PlayerReportsLayout';
import StatDonut from './StatDonut';

export default function PlayerStatsReport({ report }) {
  if (!report?.table?.rows?.length) {
    return (
      <PlayerReportsLayout description={report?.description} meta={report?.meta || []} title={report?.title || 'Player Stats Report'}>
        <p className="details-message">Not enough competition data was available to build the stats report.</p>
      </PlayerReportsLayout>
    );
  }

  return (
    <PlayerReportsLayout description={report.description} meta={report.meta} title={report.title}>
      <section className="stats-report-section">
        <div className="stats-report-section__header">
          <h3>Competition Table</h3>
          <p>Scannable output by competition with a compact, role-aware stat set.</p>
        </div>
        <CompetitionTable columns={report.table.columns} rows={report.table.rows} />
      </section>

      <section className="stats-report-section">
        <div className="stats-report-section__header">
          <h3>Summary</h3>
          <p>Aggregated season output so the table does not have to carry every total.</p>
        </div>
        <div className="stats-summary-grid">
          {report.summaryItems.map((item) => (
            <article className="stats-summary-card" key={item.key}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-report-section">
        <div className="stats-report-section__header">
          <h3>Visual Stat Blocks</h3>
          <p>Quick-read circular blocks with one main output and the nearest supporting context below.</p>
        </div>
        <div className="stats-donut-grid">
          {report.statBlocks.map((block) => (
            <StatDonut key={block.key} label={block.label} percentile={block.percentile} support={block.support} tone={block.tone} value={block.value} />
          ))}
        </div>
      </section>
    </PlayerReportsLayout>
  );
}
