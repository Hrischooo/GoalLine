import { formatTextValue } from '../utils/playerMetrics';

function formatConfidence(value) {
  const normalized = formatTextValue(value, '-');
  return normalized === '-' ? normalized : normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

const TACTICAL_ROWS = [
  ['Primary Role', 'primaryTacticalRoleLabel'],
  ['Secondary Role', 'secondaryTacticalRoleLabel'],
  ['Confidence', 'tacticalRoleConfidence']
];

export default function TacticalProfileMiniBlock({ metrics }) {
  return (
    <div className="tactical-mini-block">
      <div className="tactical-mini-block__header">
        <h3>Tactical Profile</h3>
      </div>

      <div className="tactical-mini-block__rows">
        {TACTICAL_ROWS.map(([label, key]) => (
          <div className="tactical-mini-block__row" key={key}>
            <span>{label}</span>
            <strong>{key === 'tacticalRoleConfidence' ? formatConfidence(metrics?.[key]) : formatTextValue(metrics?.[key], '-')}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
