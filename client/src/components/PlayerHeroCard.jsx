import PlayerIdentityPanel from './PlayerIdentityPanel';
import PlayerRatingPanel from './PlayerRatingPanel';

export default function PlayerHeroCard({ player, leagueName, metrics }) {
  return (
    <section className="player-hero-card">
      <PlayerIdentityPanel leagueName={leagueName} metrics={metrics} player={player} />
      <PlayerRatingPanel metrics={metrics} />
    </section>
  );
}
