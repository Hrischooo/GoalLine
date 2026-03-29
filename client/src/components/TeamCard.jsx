import ClubBadge from './ClubBadge';
import TeamFormStrip from './TeamFormStrip';
import { formatTextValue } from '../utils/playerMetrics';

export default function TeamCard({ onOpen, team }) {
  return (
    <button className="team-card" onClick={() => onOpen(team.id)} type="button">
      <div className="team-card__header">
        <div className="team-card__identity">
          <ClubBadge imageUrl={team.logo} name={team.displayName} size="large" />
          <div>
            <p className="home-kicker">Club Profile</p>
            <h3>{team.displayName}</h3>
            <p className="team-card__subtitle">
              {formatTextValue(team.league)} / {formatTextValue(team.country)}
            </p>
          </div>
        </div>
        <div className="team-card__ovr">
          <span>Team Rating</span>
          <strong>{team.teamRating || team.avgRating || 0}</strong>
        </div>
      </div>

      <div className="team-card__meta-grid">
        <div className="team-card__meta-tile">
          <span>Manager</span>
          <strong>{formatTextValue(team.manager, 'Unknown')}</strong>
        </div>
        <div className="team-card__meta-tile">
          <span>Formation</span>
          <strong>{formatTextValue(team.detectedFormation || team.preferred_formation, 'N/A')}</strong>
        </div>
        <div className="team-card__meta-tile">
          <span>Strongest Line</span>
          <strong>{formatTextValue(team.strongestLine, '-')}</strong>
        </div>
        <div className="team-card__meta-tile">
          <span>Formation Fit</span>
          <strong>{Math.round((team.formationConfidence || 0) * 100)}%</strong>
        </div>
      </div>

      <p className="team-card__style">{formatTextValue(team.tacticalIdentitySummary || team.play_style, 'N/A')}</p>

      <div className="team-card__footer">
        <div>
          <span>Last 5</span>
          <TeamFormStrip form={team.formTokens} label={`${team.displayName} last five`} />
        </div>
        <span className="team-card__cta">Open club profile</span>
      </div>
    </button>
  );
}
