import { useMemo, useState } from 'react';
import SegmentedControl from './SegmentedControl';
import StatLeaderCard from './StatLeaderCard';
import { buildScoutSignalCards, SCOUT_SIGNAL_CATEGORY_OPTIONS } from '../utils/statLeaders';

export default function ScoutSignalsSection({ scoutingRecords = [] }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const signalCards = useMemo(() => buildScoutSignalCards(scoutingRecords), [scoutingRecords]);
  const visibleCards = useMemo(
    () => signalCards.filter((card) => activeCategory === 'all' || card.category === activeCategory),
    [activeCategory, signalCards]
  );

  return (
    <section className="home-panel home-scout-signals">
      <div className="home-panel__header home-panel__header--spread home-panel__header--signals">
        <div>
          <p className="home-kicker">Scout Signals</p>
          <h2>Qualified Leaders</h2>
          <p className="home-scout-signals__subtitle">Trusted scouting indicators with sample-based eligibility and role-aware context.</p>
          <p className="home-scout-signals__note">Leaders are filtered by minimum minutes, position relevance, and stronger-sample tie handling.</p>
        </div>

        <SegmentedControl
          activeId={activeCategory}
          ariaLabel="Scout signal categories"
          className="home-scout-signals__toggle"
          compact
          onChange={setActiveCategory}
          options={SCOUT_SIGNAL_CATEGORY_OPTIONS}
        />
      </div>

      <div className="home-leader-grid">
        {visibleCards.map((card) => (
          <StatLeaderCard card={card} key={card.id} />
        ))}
      </div>
    </section>
  );
}
