import SegmentedControl from './SegmentedControl';

const VIEW_OPTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'similar', label: 'Similar Players' }
];

export default function ReportsNavigation({ activeView, onCompare, onSelectView }) {
  return (
    <nav aria-label="Player sections" className="player-section-nav">
      <SegmentedControl
        activeId={activeView}
        ariaLabel="Player sections"
        className="player-section-nav__tabs"
        compact
        onChange={onSelectView}
        options={VIEW_OPTIONS}
      />

      <button className="player-section-nav__compare" onClick={onCompare} type="button">
        Compare
      </button>
    </nav>
  );
}
