import TeamCard from './TeamCard';
import SectionHeader from './SectionHeader';

export default function LeagueTeamsSection({ onOpenTeam, teams }) {
  if (!teams.length) {
    return null;
  }

  return (
    <section className="league-block">
      <SectionHeader
        className="league-block__header"
        kicker="Tactical Units"
        meta={<span className="league-block__meta">{teams.length} club profiles</span>}
        title="Teams"
      />

      <div className="league-teams-grid">
        {teams.map((team) => (
          <TeamCard key={team.id} onOpen={onOpenTeam} team={team} />
        ))}
      </div>
    </section>
  );
}
