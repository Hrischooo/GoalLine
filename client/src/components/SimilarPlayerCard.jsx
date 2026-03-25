import { buildPlayerKey } from '../utils/dataset';
import PlayerHoverPreview from './PlayerHoverPreview';
import PlayerTextBlock from './PlayerTextBlock';
import { formatTextValue } from '../utils/playerMetrics';

export default function SimilarPlayerCard({ result, onOpenPlayer }) {
  const player = result?.player;
  const rating = result?.rating;

  return (
    <article className="similar-player-card">
      <div className="similar-player-card__header">
        <PlayerHoverPreview metrics={rating} player={player}>
          <PlayerTextBlock
            club={player?.squad}
            league={player?.comp || player?.league}
            name={player?.player}
            position={rating?.exactPosition}
            role={rating?.primaryTacticalRoleLabel}
          />
        </PlayerHoverPreview>

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
