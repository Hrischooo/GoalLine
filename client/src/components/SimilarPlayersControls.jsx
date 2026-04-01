import { PRIMARY_VISIBLE_SIMILARITY_MODES, SIMILARITY_MODES } from '../utils/similarPlayers';

const FILTER_OPTIONS = [
  ['sameLeagueOnly', 'Same league only'],
  ['similarAgeOnly', 'Similar age only'],
  ['samePrimaryRoleOnly', 'Same primary role only']
];

export default function SimilarPlayersControls({ mode, filters, onModeChange, onFilterChange }) {
  const visibleModes = PRIMARY_VISIBLE_SIMILARITY_MODES.map((modeId) => SIMILARITY_MODES[modeId]);

  return (
    <div className="similar-controls">
      <div className="similar-controls__modes">
        <div className="similar-controls__segmented" role="tablist" aria-label="Similarity mode">
          {visibleModes.map((option) => (
            <button
              className={`similar-controls__mode-button${mode === option.id ? ' similar-controls__mode-button--active' : ''}`}
              key={option.id}
              onClick={() => onModeChange(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="similar-controls__field similar-controls__field--compact">
          <span>More modes</span>
          <select value={mode} onChange={(event) => onModeChange(event.target.value)}>
            {Object.values(SIMILARITY_MODES).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

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
