import PlayerRadarChart from './PlayerRadarChart';
import { getPlayerRadarProfile } from '../utils/playerRadar';

function ProfileSummaryList({ items = [], label }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="radar-summary-block">
      <span>{label}</span>
      <div className="radar-summary-block__chips">
        {items.map((item) => (
          <div className="radar-summary-chip" key={item.key}>
            <strong>{item.label}</strong>
            <small>{item.value}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlayerRadarPanel({ metrics }) {
  const profile = getPlayerRadarProfile(metrics);

  return (
    <article className="tactical-card tactical-card--radar">
      <div className="tactical-card__header tactical-card__header--radar">
        <div>
          <h3>Position Radar</h3>
          <p className="tactical-card__subtitle">
            {profile.title} / {profile.radarProfileName}
          </p>
        </div>
      </div>

      <div className="player-radar-panel">
        <PlayerRadarChart
          profiles={[
            {
              key: 'player',
              name: metrics?.playerArchetype || metrics?.primaryTacticalRoleLabel || 'Player',
              axes: profile.radarAxes,
              stroke: '#49e6ff',
              fill: 'rgba(73, 230, 255, 0.22)'
            }
          ]}
        />

        <div className="player-radar-panel__summary">
          <p className="player-radar-panel__note">{profile.explanation}</p>
          <ProfileSummaryList items={profile.strengths} label="Primary strengths" />
          <ProfileSummaryList items={profile.weaknesses} label="Watch area" />
        </div>
      </div>
    </article>
  );
}
