import { formatTextValue } from '../utils/playerMetrics';

function joinWithBullet(parts) {
  return parts.filter(Boolean).join(' \u2022 ');
}

function joinWithSlash(parts) {
  return parts.filter(Boolean).join(' / ');
}

export default function PlayerTextBlock({ club, league, name, nameNode, position, role }) {
  const roleLine = joinWithBullet([formatTextValue(position, ''), formatTextValue(role, '')]);
  const contextLine = joinWithSlash([formatTextValue(club, ''), formatTextValue(league, '')]);

  return (
    <div className="player-text-block">
      <strong className="player-text-block__name">{nameNode || formatTextValue(name, 'Unknown Player')}</strong>
      {roleLine ? <span className="player-text-block__role">{roleLine}</span> : null}
      {contextLine ? <span className="player-text-block__context">{contextLine}</span> : null}
    </div>
  );
}
