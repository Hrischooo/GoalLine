import { formatTextValue } from '../utils/playerMetrics';

export default function PlayerMetaBlock({ items = [] }) {
  return (
    <div className="player-meta-block">
      {items.map((item) => (
        <div className="player-meta-block__item" key={item.label}>
          <span>{item.label}</span>
          <strong>{formatTextValue(item.value, '-')}</strong>
        </div>
      ))}
    </div>
  );
}
