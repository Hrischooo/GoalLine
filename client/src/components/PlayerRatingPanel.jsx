import TacticalProfileMiniBlock from './TacticalProfileMiniBlock';
import OvrBreakdownTooltip from './OvrBreakdownTooltip';

export default function PlayerRatingPanel({ metrics }) {
  return (
    <div className="player-hero-card__rating">
      <div className="profile-score profile-score--hero">
        <div className="profile-score__ring">
          <div className="profile-score__content">
            <span className="profile-score__label-row">
              GoalLine
              <OvrBreakdownTooltip metrics={metrics} />
            </span>
            <strong>{metrics?.summaryScore}</strong>
          </div>
        </div>
      </div>

      <TacticalProfileMiniBlock metrics={metrics} />
    </div>
  );
}
