import { buildPlayerKey } from '../utils/dataset';
import { formatTextValue } from '../utils/playerMetrics';

export default function SimilarPlayerCard({ result, onOpenPlayer }) {
  const player = result?.player;
  const rating = result?.rating;

  return (
    <article className="similar-player-card">
      <div className="similar-player-card__header">
        <div>
          <h3>{formatTextValue(player?.player, 'Unknown Player')}</h3>
          <p className="similar-player-card__club">
            {formatTextValue(player?.squad)} / {formatTextValue(player?.comp || player?.league, 'Unknown League')}
          </p>
        </div>

        <div className="similar-player-card__score">
          <span>Similarity</span>
          <strong>{Math.round(result?.finalSimilarity || 0)}%</strong>
        </div>
      </div>

      <div className="similar-player-card__meta">
        <span>{formatTextValue(rating?.exactPosition)}</span>
        <span>OVR {formatTextValue(rating?.finalOVR)}</span>
        <span>{formatTextValue(rating?.primaryTacticalRoleLabel)}</span>
      </div>

      <p className="similar-player-card__explanation">{formatTextValue(result?.explanation)}</p>

      <button className="similar-player-card__action" onClick={() => onOpenPlayer?.(buildPlayerKey(player))} type="button">
        Open Profile
      </button>
    </article>
  );
}
