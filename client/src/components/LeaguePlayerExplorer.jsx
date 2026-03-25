import ClubBadge from './ClubBadge';
import PlayerHoverPreview from './PlayerHoverPreview';
import PlayerTextBlock from './PlayerTextBlock';
import { formatStatValue, formatTextValue } from '../utils/playerMetrics';
import { getLeagueName } from '../utils/dataset';

function PlayerStatPair({ label, value }) {
  return (
    <div className="league-explorer-player__stat">
      <span>{label}</span>
      <strong>{formatStatValue(value, 'N/A')}</strong>
    </div>
  );
}

export default function LeaguePlayerExplorer({ canLoadMore, onLoadMore, onOpenPlayer, players, statColumns, totalPlayers }) {
  return (
    <section className="league-block">
      <div className="league-block__header">
        <div>
          <p className="home-kicker">League Explorer</p>
          <h2>Players</h2>
        </div>
        <span className="league-block__meta">
          Showing {players.length} of {totalPlayers}
        </span>
      </div>

      <div className="league-explorer-list">
        {players.map((player) => (
          <button className="league-explorer-player" key={player.key} onClick={() => onOpenPlayer(player.key)} type="button">
            <PlayerHoverPreview metrics={player.metrics} player={player}>
              <div className="league-explorer-player__identity">
                <ClubBadge name={player.squad} size="medium" />
                <PlayerTextBlock
                  club={player.squad}
                  league={getLeagueName(player)}
                  name={player.player}
                  position={player.exactPosition}
                  role={player.primaryRole}
                />
              </div>
            </PlayerHoverPreview>

            <div className="league-explorer-player__overview">
              <div className="league-explorer-player__ovr">
                <span>OVR</span>
                <strong>{formatStatValue(player.finalOVR, 'N/A')}</strong>
              </div>
              <div className="league-explorer-player__confidence">
                <span>Confidence</span>
                <strong>{formatTextValue(player.roleConfidence, '-')}</strong>
              </div>
            </div>

            <div className="league-explorer-player__stats">
              {statColumns.map((column) => (
                <PlayerStatPair key={`${player.key}-${column.key}`} label={column.label} value={column.getValue(player)} />
              ))}
            </div>
          </button>
        ))}
      </div>

      {canLoadMore ? (
        <div className="league-player-explorer__footer">
          <button className="secondary-button" onClick={onLoadMore} type="button">
            Load more players
          </button>
        </div>
      ) : null}
    </section>
  );
}
