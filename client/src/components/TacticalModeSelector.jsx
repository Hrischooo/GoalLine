export default function TacticalModeSelector({ activeMode, modes = [], onChange }) {
  return (
    <div className="tactical-mode-selector" role="tablist" aria-label="Tactical mode">
      {modes.map((mode) => (
        <button
          aria-selected={activeMode === mode.id}
          className={`tactical-mode-selector__button${activeMode === mode.id ? ' tactical-mode-selector__button--active' : ''}`}
          key={mode.id}
          onClick={() => onChange?.(mode.id)}
          role="tab"
          type="button"
        >
          <span>{mode.shortLabel || mode.label}</span>
          {mode.meta ? <small>{mode.meta}</small> : null}
        </button>
      ))}
    </div>
  );
}
