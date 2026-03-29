import { formatTextValue } from '../utils/playerMetrics';

export default function TeamDepthChart({ depthChart = [] }) {
  return (
    <section className="team-block">
      <div className="team-block__header">
        <div>
          <p className="home-kicker">Squad Structure</p>
          <h2>Position Depth</h2>
        </div>
      </div>

      <div className="team-depth-chart">
        {depthChart.map((row) => (
          <div className="team-depth-chart__row" key={row.position}>
            <div className="team-depth-chart__position">
              <span>{row.position}</span>
              <strong>{row.count} players</strong>
            </div>

            <div className="team-depth-chart__players">
              {row.players.map((entry) => (
                <div className="team-depth-chart__player" key={`${row.position}-${entry.player.player}`}>
                  <strong>{formatTextValue(entry.player.player)}</strong>
                  <span>
                    {entry.rating} OVR / {formatTextValue(entry.role)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
