import { formatTextValue } from '../utils/playerMetrics';

const PROFILE_ROWS = [
  ['Exact Position', 'exactPosition'],
  ['Primary Role', 'primaryTacticalRoleLabel'],
  ['Secondary Role', 'secondaryTacticalRoleLabel'],
  ['Role Confidence', 'tacticalRoleConfidence']
];

function formatProfileValue(key, value) {
  if (key === 'tacticalRoleConfidence' && value) {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }

  return formatTextValue(value, '-');
}

export default function TacticalProfileCard({ metrics }) {
  return (
    <article className="tactical-card">
      <div className="tactical-card__header">
        <h3>Tactical Profile</h3>
      </div>

      <div className="tactical-profile-rows">
        {PROFILE_ROWS.map(([label, key]) => (
          <div className="tactical-profile-row" key={key}>
            <span>{label}</span>
            <strong>{formatProfileValue(key, metrics?.[key])}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
