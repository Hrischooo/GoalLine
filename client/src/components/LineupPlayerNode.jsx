import OvrInlineValue from './OvrInlineValue';
import { buildPlayerKey } from '../utils/dataset';
import { formatTextValue, toNumber } from '../utils/playerMetrics';
import { getInitials, getPlaceholderGradient } from '../utils/placeholders';

function getPitchName(name = '', variant = 'full') {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return variant === 'mini' ? 'Open' : 'Unassigned';
  }

  const surname = parts[parts.length - 1];

  if (variant === 'mini') {
    return surname.slice(0, 3).toUpperCase();
  }

  if (surname.length <= 11) {
    return surname;
  }

  return `${parts[0][0]}. ${surname.slice(0, 10)}`;
}

function getStrengthTags(metrics = {}) {
  return (metrics.topPositiveContributors || [])
    .slice(0, 2)
    .map((entry) => entry.label)
    .filter(Boolean);
}

function getPopoverTitle(slot = {}, player = {}) {
  return slot.slotLabel && player.metrics?.exactPosition && slot.slotLabel !== player.metrics.exactPosition
    ? `${slot.slotLabel} slot · ${player.metrics.exactPosition}`
    : slot.slotLabel || player.metrics?.exactPosition || 'Lineup slot';
}

export default function LineupPlayerNode({ onOpenPlayer, slot, variant = 'full' }) {
  const player = slot.assignedPlayer || null;
  const metrics = player?.metrics || {};
  const fitValue = Math.round(toNumber(slot.fitScore));
  const name = formatTextValue(player?.player, 'Unassigned');
  const displayName = getPitchName(name, variant);
  const initials = getInitials(name, slot.slotLabel || 'XI');
  const isMini = variant === 'mini';
  const strengthTags = getStrengthTags(metrics);

  return (
    <div
      className={`lineup-node lineup-node--${variant}${player ? '' : ' lineup-node--empty'}`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      <button
        className="lineup-node__trigger"
        onClick={() => (player ? onOpenPlayer?.(buildPlayerKey(player)) : null)}
        type="button"
      >
        <span className="lineup-node__marker" style={{ backgroundImage: getPlaceholderGradient(name) }}>
          <span>{isMini ? slot.slotLabel : initials}</span>
        </span>

        <span className="lineup-node__plate">
          <strong className="lineup-node__name">{displayName}</strong>
          <span className="lineup-node__meta">
            {slot.slotLabel}
            {isMini ? '' : ` · ${formatTextValue(metrics.primaryTacticalRoleLabel || metrics.exactPosition, 'Role')}`}
          </span>
        </span>

        {!isMini && player ? (
          <span className="lineup-node__chips">
            <span className="lineup-node__chip">{metrics.finalOVR || '-'}</span>
            <span className="lineup-node__chip lineup-node__chip--fit">{Number.isFinite(fitValue) ? `${fitValue}%` : '-'}</span>
          </span>
        ) : null}
      </button>

      {!isMini && player ? (
        <div className="lineup-node__popover">
          <div className="lineup-node__popover-header">
            <div>
              <strong>{name}</strong>
              <p>{getPopoverTitle(slot, player)}</p>
            </div>
            <span className="lineup-node__popover-fit">Fit {fitValue}%</span>
          </div>

          <div className="lineup-node__popover-grid">
            <OvrInlineValue className="lineup-node__popover-ovr" metrics={metrics} value={metrics.finalOVR} />
            <div className="lineup-node__popover-stat">
              <span>Role</span>
              <strong>{formatTextValue(metrics.primaryTacticalRoleLabel, '-')}</strong>
            </div>
            <div className="lineup-node__popover-stat">
              <span>Archetype</span>
              <strong>{formatTextValue(metrics.playerArchetype, '-')}</strong>
            </div>
            <div className="lineup-node__popover-stat">
              <span>Position</span>
              <strong>{formatTextValue(metrics.exactPosition, '-')}</strong>
            </div>
          </div>

          <p className="lineup-node__popover-reason">{formatTextValue(slot.selectionReason, 'Best fit in the active tactical shape.')}</p>

          {strengthTags.length ? (
            <div className="lineup-node__popover-tags">
              {strengthTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
