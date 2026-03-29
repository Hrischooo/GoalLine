import '../styles/radar.css';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function polarToCartesian(centerX, centerY, radius, angle) {
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  };
}

function buildPolygonPoints(values, centerX, centerY, radius) {
  const total = values.length;

  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
      const point = polarToCartesian(centerX, centerY, radius * clamp(value / 100, 0, 1), angle);
      return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    })
    .join(' ');
}

function buildGridPoints(totalAxes, centerX, centerY, radius) {
  return Array.from({ length: totalAxes }, (_, index) => {
    const angle = -Math.PI / 2 + (index / totalAxes) * Math.PI * 2;
    const point = polarToCartesian(centerX, centerY, radius, angle);
    return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
  }).join(' ');
}

function getLabelPosition(totalAxes, index, centerX, centerY, radius) {
  const angle = -Math.PI / 2 + (index / totalAxes) * Math.PI * 2;
  return polarToCartesian(centerX, centerY, radius + 30, angle);
}

function getLabelLines(label = '') {
  if (!label.includes(' / ') && label.length <= 16) {
    return [label];
  }

  return label.split(' / ');
}

export default function PlayerRadarChart({
  profiles = [],
  size = 320,
  compact = false,
  className = '',
  legend = false
}) {
  const baseProfile = profiles[0];
  const axes = baseProfile?.axes || [];

  if (!axes.length) {
    return <div className={`player-radar player-radar--empty ${className}`.trim()}>Profile radar unavailable.</div>;
  }

  const center = size / 2;
  const radius = size * (compact ? 0.24 : 0.28);
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className={`player-radar${compact ? ' player-radar--compact' : ''} ${className}`.trim()}>
      <svg className="player-radar__svg" viewBox={`0 0 ${size} ${size}`} role="img">
        {rings.map((ring) => (
          <polygon
            className="player-radar__ring"
            key={ring}
            points={buildGridPoints(axes.length, center, center, radius * ring)}
          />
        ))}

        {axes.map((axis, index) => {
          const angle = -Math.PI / 2 + (index / axes.length) * Math.PI * 2;
          const linePoint = polarToCartesian(center, center, radius, angle);
          const labelPoint = getLabelPosition(axes.length, index, center, center, radius);

          return (
            <g key={axis.key}>
              <line className="player-radar__axis" x1={center} x2={linePoint.x} y1={center} y2={linePoint.y} />
              <text
                className="player-radar__label"
                textAnchor={labelPoint.x < center - 6 ? 'end' : labelPoint.x > center + 6 ? 'start' : 'middle'}
                x={labelPoint.x}
                y={labelPoint.y}
              >
                {getLabelLines(axis.label).map((line, lineIndex) => (
                  <tspan dy={lineIndex === 0 ? 0 : 12} key={`${axis.key}-${line}`} x={labelPoint.x}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {profiles.map((profile) => (
          <g key={profile.key}>
            <polygon
              className="player-radar__shape"
              fill={profile.fill}
              points={buildPolygonPoints(profile.axes.map((axis) => axis.value), center, center, radius)}
              stroke={profile.stroke}
            />

            {profile.axes.map((axis, index) => {
              const angle = -Math.PI / 2 + (index / profile.axes.length) * Math.PI * 2;
              const point = polarToCartesian(center, center, radius * clamp(axis.value / 100, 0, 1), angle);

              return <circle className="player-radar__point" cx={point.x} cy={point.y} fill={profile.stroke} key={`${profile.key}-${axis.key}`} r={3.5} />;
            })}
          </g>
        ))}
      </svg>

      {legend ? (
        <div className="player-radar__legend">
          {profiles.map((profile) => (
            <div className="player-radar__legend-item" key={profile.key}>
              <span className="player-radar__legend-swatch" style={{ background: profile.stroke }} />
              <strong>{profile.name}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
