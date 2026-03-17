import ClubBadge from './ClubBadge';
import PlayerAvatar from './PlayerAvatar';
import { formatTextValue } from '../utils/playerMetrics';
import { getLeagueName } from '../utils/dataset';

function PlayerSummary({ player, metrics, side, onOpenPlayer }) {
  return (
    <article className={`compare-hero-player compare-hero-player--${side}`}>
      <div className="compare-hero-player__top">
        <PlayerAvatar name={player.player} size="large" />
        <div>
          <p className="home-kicker">{side === 'left' ? 'Player A' : 'Player B'}</p>
          <h2>{formatTextValue(player.player, 'Unknown Player')}</h2>
          <p className="compare-hero-player__subtitle">
            <ClubBadge name={player.squad} size="small" /> {formatTextValue(player.squad)} / {formatTextValue(getLeagueName(player))}
          </p>
        </div>
      </div>

      <div className="compare-hero-player__meta">
        <div>
          <span>OVR</span>
          <strong>{metrics.finalOVR}</strong>
        </div>
        <div>
          <span>Position</span>
          <strong>{metrics.exactPosition}</strong>
        </div>
        <div>
          <span>Primary Role</span>
          <strong>{metrics.primaryTacticalRoleLabel}</strong>
        </div>
      </div>

      <button className="secondary-button compare-hero-player__button" onClick={onOpenPlayer} type="button">
        Open player page
      </button>
    </article>
  );
}

export default function CompareHeader({ leftMetrics, leftPlayer, onOpenLeft, onOpenRight, onSwap, rightMetrics, rightPlayer }) {
  return (
    <section className="compare-hero-card">
      <PlayerSummary metrics={leftMetrics} onOpenPlayer={onOpenLeft} player={leftPlayer} side="left" />

      <div className="compare-hero-card__center">
        <p className="home-kicker">Direct Comparison</p>
        <h1>Compare tactical identity, role fit, and production.</h1>
        <button className="primary-button compare-hero-card__swap" onClick={onSwap} type="button">
          Swap sides
        </button>
      </div>

      <PlayerSummary metrics={rightMetrics} onOpenPlayer={onOpenRight} player={rightPlayer} side="right" />
    </section>
  );
}
