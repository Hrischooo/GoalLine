import { SIMILARITY_MODES } from '../utils/similarPlayers';

const FILTER_OPTIONS = [
  ['sameLeagueOnly', 'Same league only'],
  ['similarAgeOnly', 'Similar age only'],
  ['samePrimaryRoleOnly', 'Same primary role only']
];

export default function SimilarPlayersControls({ mode, filters, onModeChange, onFilterChange }) {
  return (
    <div className="similar-controls">
      <label className="similar-controls__field">
        <span>Mode</span>
        <select value={mode} onChange={(event) => onModeChange(event.target.value)}>
          {Object.values(SIMILARITY_MODES).map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="similar-controls__toggles">
        {FILTER_OPTIONS.map(([key, label]) => (
          <label className="similar-controls__toggle" key={key}>
            <input
              checked={Boolean(filters[key])}
              onChange={(event) => onFilterChange(key, event.target.checked)}
              type="checkbox"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
