import TeamCard from './TeamCard';

export default function LeagueTeamsSection({ onOpenTeam, teams }) {
  if (!teams.length) {
    return null;
  }

  return (
    <section className="league-block">
      <div className="league-block__header">
        <div>
          <p className="home-kicker">Tactical Units</p>
          <h2>Teams</h2>
        </div>
        <span className="league-block__meta">{teams.length} club profiles</span>
      </div>

      <div className="league-teams-grid">
        {teams.map((team) => (
          <TeamCard key={team.id} onOpen={onOpenTeam} team={team} />
        ))}
      </div>
    </section>
  );
}
