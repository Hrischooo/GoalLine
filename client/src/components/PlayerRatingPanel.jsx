import TacticalProfileMiniBlock from './TacticalProfileMiniBlock';

export default function PlayerRatingPanel({ metrics }) {
  return (
    <div className="player-hero-card__rating">
      <div className="profile-score profile-score--hero">
        <div className="profile-score__ring">
          <div className="profile-score__content">
            <span>GoalLine</span>
            <strong>{metrics?.summaryScore}</strong>
          </div>
        </div>
      </div>

      <TacticalProfileMiniBlock metrics={metrics} />
    </div>
  );
}
