import { buildPlayerKey } from '../utils/dataset';
import PlayerHoverPreview from './PlayerHoverPreview';
import PlayerTextBlock from './PlayerTextBlock';
import OvrInlineValue from './OvrInlineValue';
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
          <span>{result?.modeTag || 'Similarity'}</span>
          <strong>{Math.round(result?.finalSimilarity || 0)}%</strong>
        </div>
      </div>

      <div className="similar-player-card__meta">
        <span>{formatTextValue(rating?.exactPosition)}</span>
        <div className="similar-player-card__meta-pill similar-player-card__meta-pill--ovr">
          <OvrInlineValue metrics={rating} value={formatTextValue(rating?.finalOVR)} />
        </div>
        <span>{formatTextValue(rating?.primaryTacticalRoleLabel)}</span>
        <span>{formatTextValue(result?.similarityModeLabel)}</span>
      </div>

      <div className="similar-player-card__headline">
        <strong>{formatTextValue(result?.recommendationHeadline)}</strong>
        <p className="similar-player-card__explanation">{formatTextValue(result?.whyMatch || result?.explanation)}</p>
      </div>
      <p className="similar-player-card__style">{formatTextValue(result?.styleMatchSummary)}</p>

      <div className="similar-player-card__breakdown">
        <div>
          <span>Style</span>
          <strong>{Math.round(result?.compactBreakdown?.style || result?.finalSimilarity || 0)}</strong>
        </div>
        <div>
          <span>Role Match</span>
          <strong>{Math.round(result?.compactBreakdown?.role || result?.roleMatchScore || 0)}</strong>
        </div>
        <div>
          <span>Level</span>
          <strong>{Math.round(result?.compactBreakdown?.level || 0)}</strong>
        </div>
      </div>

      <div className="similar-player-card__traits">
        <div className="similar-player-card__trait-group">
          <span>Shared strengths</span>
          <div className="similar-player-card__tags">
            {(result?.sharedStrengths || result?.topSharedTraits || []).slice(0, 3).map((trait) => (
              <span key={trait}>{trait}</span>
            ))}
          </div>
        </div>
        <div className="similar-player-card__trait-group">
          <span>Key difference</span>
          <div className="similar-player-card__tags">
            {(result?.keyDifferences || []).slice(0, 1).map((difference) => (
              <span key={difference}>{difference}</span>
            ))}
          </div>
        </div>
      </div>

      <button className="similar-player-card__action" onClick={() => onOpenPlayer?.(buildPlayerKey(player))} type="button">
        Open Profile
      </button>
    </article>
  );
}
