function getMeta(option) {
  return option.meta || option.description || '';
}

export default function SegmentedControl({
  activeId,
  ariaLabel,
  className = '',
  compact = false,
  options = [],
  onChange,
  stretch = false
}) {
  const classes = [
    'gl-segmented',
    compact ? 'gl-segmented--compact' : '',
    stretch ? 'gl-segmented--stretch' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={ariaLabel} className={classes} role="tablist">
      {options.map((option) => {
        const isActive = activeId === option.id;
        const meta = getMeta(option);

        return (
          <button
            aria-selected={isActive}
            className={`gl-segmented__button${isActive ? ' gl-segmented__button--active' : ''}`}
            key={option.id}
            onClick={() => onChange?.(option.id)}
            role="tab"
            type="button"
          >
            <span className="gl-segmented__label">{option.shortLabel || option.label}</span>
            {meta ? <small className="gl-segmented__meta">{meta}</small> : null}
          </button>
        );
      })}
    </div>
  );
}
