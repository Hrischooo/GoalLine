import PlayerIdentityPanel from './PlayerIdentityPanel';
import PlayerRatingPanel from './PlayerRatingPanel';

export default function PlayerHeroCard({ player, leagueName, metrics, onOpenTeam }) {
  return (
    <section className="player-hero-card">
      <PlayerIdentityPanel leagueName={leagueName} metrics={metrics} onOpenTeam={onOpenTeam} player={player} />
      <PlayerRatingPanel metrics={metrics} />
    </section>
  );
}
