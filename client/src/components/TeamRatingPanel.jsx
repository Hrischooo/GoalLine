import SectionHeader from './SectionHeader';
import { formatStatValue, formatTextValue } from '../utils/playerMetrics';

function RatingTile({ label, value }) {
  return (
    <div className="team-rating-panel__tile">
      <span>{label}</span>
      <strong>{formatStatValue(value, '-')}</strong>
    </div>
  );
}

export default function TeamRatingPanel({ bestXI, tacticalIdentitySummary, team }) {
  const lineRatings = bestXI?.lineRatings || team?.lineRatings || {};

  return (
    <section className="team-block">
      <SectionHeader className="team-block__header" kicker="Best XI Rating" title="Team Level" />

      <div className="team-rating-panel">
        <div className="team-rating-panel__hero">
          <span>{bestXI?.modeLabel || 'Team Rating'}</span>
          <strong>{formatStatValue(bestXI?.overallTeamRating || team?.teamRating, '-')}</strong>
          <p>
            {formatTextValue(team?.displayName)} projects in a {formatTextValue(bestXI?.formation || team?.detectedFormation, 'N/A')} with{' '}
            {Math.round((bestXI?.formationConfidence || team?.formationConfidence || 0) * 100)}% confidence. {formatTextValue(bestXI?.explanationSummary, '')}
          </p>
        </div>

        <div className="team-rating-panel__grid">
          <RatingTile label="Attack" value={lineRatings.attack} />
          <RatingTile label="Midfield" value={lineRatings.midfield} />
          <RatingTile label="Defense" value={lineRatings.defense} />
          <RatingTile label="Goalkeeper" value={lineRatings.goalkeeper} />
          <RatingTile label="Formation Score" value={bestXI?.formationFitScore || team?.formationFitScore} />
          <RatingTile label="Confidence" value={`${Math.round((bestXI?.formationConfidence || team?.formationConfidence || 0) * 100)}%`} />
        </div>
      </div>

      <p className="team-rating-panel__summary">{formatTextValue(tacticalIdentitySummary, 'No tactical identity summary available yet.')}</p>
    </section>
  );
}
