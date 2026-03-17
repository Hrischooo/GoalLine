import LeagueBadge from './LeagueBadge';

function Stat({ label, value }) {
  return (
    <div className="league-card__stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function LeagueCard({ league, onOpen }) {
  return (
    <button className="league-card" type="button" onClick={() => onOpen(league.id)}>
      <div className="league-card__header">
        <div className="league-card__identity">
          <LeagueBadge name={league.name} size="large" />
          <div>
            <p className="home-kicker">League Overview</p>
            <h2>{league.name}</h2>
            <p className="league-card__subtitle">
              {league.country} / {league.season} / {league.division}
            </p>
          </div>
        </div>
        <div className="league-card__rating">
          <span>Avg OVR</span>
          <strong>{league.averageOVR}</strong>
        </div>
      </div>

      <div className="league-card__grid">
        <Stat label="Players" value={league.playersCount} />
        <Stat label="Clubs" value={league.clubs} />
        <Stat label="Top Scorer" value={`${league.topScorer} (${league.topScorerGoals})`} />
        <Stat label="Top Assister" value={`${league.topAssister} (${league.topAssisterValue})`} />
      </div>

      <div className="league-card__footer">
        <div>
          <span>Top Rated</span>
          <strong>{league.topRatedPlayer}</strong>
        </div>
        <span className="league-card__cta">Open league</span>
      </div>
    </button>
  );
}
