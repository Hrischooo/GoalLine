import ClubBadge from './ClubBadge';
import PlayerAvatar from './PlayerAvatar';
import PlayerMetaBlock from './PlayerMetaBlock';
import { formatTextValue } from '../utils/playerMetrics';

export default function PlayerIdentityPanel({ player, leagueName, metrics }) {
  const metaItems = [
    { label: 'Position', value: metrics?.exactPosition },
    { label: 'Nation', value: player?.nation },
    { label: 'Season', value: player?.season }
  ];

  return (
    <div className="player-hero-card__identity">
      <div className="player-identity-panel__top">
        <PlayerAvatar name={player?.player} size="large" />
        <span className="player-identity-panel__position">{formatTextValue(metrics?.exactPosition)}</span>
      </div>

      <div className="player-identity-panel__main">
        <h1>{formatTextValue(player?.player, 'Unknown Player')}</h1>
        <p className="player-identity-panel__club">
          <span className="profile-club-row">
            <ClubBadge name={player?.squad} size="small" />
            <span>{formatTextValue(player?.squad)}</span>
          </span>
        </p>
        <p className="player-identity-panel__league">{formatTextValue(leagueName, 'Unknown League')}</p>
      </div>

      <PlayerMetaBlock items={metaItems} />
    </div>
  );
}
