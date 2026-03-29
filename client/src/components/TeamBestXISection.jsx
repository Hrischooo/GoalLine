import OvrInlineValue from './OvrInlineValue';
import PlayerAvatar from './PlayerAvatar';
import { buildPlayerKey } from '../utils/dataset';
import { formatTextValue } from '../utils/playerMetrics';

function groupSlotsByLine(xi = []) {
  return [
    ['attack', xi.filter((slot) => slot.line === 'attack')],
    ['midfield', xi.filter((slot) => slot.line === 'midfield')],
    ['defense', xi.filter((slot) => slot.line === 'defense')],
    ['goalkeeper', xi.filter((slot) => slot.line === 'goalkeeper')]
  ].filter(([, slots]) => slots.length);
}

export default function TeamBestXISection({ bestXI, onOpenPlayer }) {
  const groupedLines = groupSlotsByLine(bestXI?.xi || []);

  return (
    <section className="team-block">
      <div className="team-block__header">
        <div>
          <p className="home-kicker">Auto Selected</p>
          <h2>Best XI</h2>
        </div>
        <span className="team-block__meta">{formatTextValue(bestXI?.formation, 'N/A')}</span>
      </div>

      <div className="team-best-xi">
        {groupedLines.map(([lineKey, slots]) => (
          <div className={`team-best-xi__line team-best-xi__line--${lineKey}`} key={lineKey}>
            {slots.map((slot) => (
              <button
                className="team-best-xi__card"
                key={slot.slotId}
                onClick={() => onOpenPlayer?.(buildPlayerKey(slot.assignedPlayer))}
                type="button"
              >
                <div className="team-best-xi__identity">
                  <PlayerAvatar name={slot.assignedPlayer?.player} size="small" />
                  <div>
                    <span>{slot.slotLabel}</span>
                    <strong>{formatTextValue(slot.assignedPlayer?.player)}</strong>
                    <small>{formatTextValue(slot.assignedPlayer?.metrics?.primaryTacticalRoleLabel)}</small>
                  </div>
                </div>

                <div className="team-best-xi__meta">
                  <OvrInlineValue className="team-best-xi__ovr" metrics={slot.assignedPlayer?.metrics} value={slot.assignedPlayer?.metrics?.finalOVR} />
                  <div className="team-best-xi__fit">
                    <span>Fit</span>
                    <strong>{Math.round(slot.fitScore)}%</strong>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
