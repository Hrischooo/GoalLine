import PlayerRadarChart from './PlayerRadarChart';

export default function RadarChart({ averageAxes = [], playerAxes = [], averageLabel = 'Average', playerLabel = 'Player' }) {
  return (
    <PlayerRadarChart
      className="report-radar"
      compact
      legend
      profiles={[
        {
          key: 'average',
          name: averageLabel,
          axes: averageAxes,
          stroke: 'rgba(155, 168, 214, 0.9)',
          fill: 'rgba(155, 168, 214, 0.08)'
        },
        {
          key: 'player',
          name: playerLabel,
          axes: playerAxes,
          stroke: '#49e6ff',
          fill: 'rgba(73, 230, 255, 0.2)'
        }
      ]}
      size={260}
    />
  );
}
