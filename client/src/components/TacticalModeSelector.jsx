import SegmentedControl from './SegmentedControl';

export default function TacticalModeSelector({ activeMode, modes = [], onChange }) {
  return <SegmentedControl activeId={activeMode} ariaLabel="Tactical mode" className="tactical-mode-selector" compact onChange={onChange} options={modes} stretch />;
}
