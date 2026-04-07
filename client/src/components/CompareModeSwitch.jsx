import SegmentedControl from './SegmentedControl';

export default function CompareModeSwitch({ activeMode, modes = [], onChange }) {
  return <SegmentedControl activeId={activeMode} ariaLabel="Comparison mode" className="compare-mode-switch" onChange={onChange} options={modes} stretch />;
}
