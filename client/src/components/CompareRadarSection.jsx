import PlayerRadarChart from './PlayerRadarChart';
import SectionHeader from './SectionHeader';
import { canOverlayRadarProfiles, getPlayerRadarProfile } from '../utils/playerRadar';

function buildChartProfile(profile, name, stroke, fill) {
  return {
    key: name,
    name,
    axes: profile.radarAxes,
    stroke,
    fill
  };
}

function RadarCard({ metrics, profile, stroke, fill, title }) {
  return (
    <article className="comparison-card compare-radar-card">
      <div className="comparison-card__header">
        <h3>{title}</h3>
        <p>{profile.radarProfileName}</p>
      </div>

      <PlayerRadarChart
        compact
        profiles={[buildChartProfile(profile, metrics?.primaryTacticalRoleLabel || metrics?.exactPosition || 'Player', stroke, fill)]}
      />
    </article>
  );
}

export default function CompareRadarSection({ leftMetrics, leftPlayer, rightMetrics, rightPlayer }) {
  const leftProfile = getPlayerRadarProfile(leftMetrics);
  const rightProfile = getPlayerRadarProfile(rightMetrics);
  const canOverlay = canOverlayRadarProfiles(leftProfile, rightProfile);

  return (
    <section className="compare-section">
      <SectionHeader
        className="compare-section__header"
        kicker="Position Radar"
        title={canOverlay ? 'Overlay profile comparison' : 'Position-aware profile shapes'}
      />

      {!canOverlay ? (
        <p className="compare-scout-note">Position-aware radar charts switch axes by role model, so different positions are shown side by side instead of forced onto one shared shape.</p>
      ) : null}

      {canOverlay ? (
        <div className="compare-radar compare-radar--overlay">
          <div className="compare-radar__chart">
            <PlayerRadarChart
              legend
              profiles={[
                buildChartProfile(leftProfile, leftPlayer?.player || 'Player A', '#18d2bb', 'rgba(24, 210, 187, 0.22)'),
                buildChartProfile(rightProfile, rightPlayer?.player || 'Player B', '#49e6ff', 'rgba(73, 230, 255, 0.18)')
              ]}
            />
          </div>

          <div className="compare-radar__meta">
            <div className="compare-radar__pill">
              <span>Shared axes</span>
              <strong>{leftProfile.title}</strong>
            </div>
            <div className="compare-radar__pill">
              <span>Player A</span>
              <strong>{leftProfile.radarProfileName}</strong>
            </div>
            <div className="compare-radar__pill">
              <span>Player B</span>
              <strong>{rightProfile.radarProfileName}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="compare-radar compare-radar--split">
          <RadarCard fill="rgba(24, 210, 187, 0.22)" metrics={leftMetrics} profile={leftProfile} stroke="#18d2bb" title={leftPlayer?.player || 'Player A'} />
          <RadarCard fill="rgba(73, 230, 255, 0.18)" metrics={rightMetrics} profile={rightProfile} stroke="#49e6ff" title={rightPlayer?.player || 'Player B'} />
        </div>
      )}
    </section>
  );
}
