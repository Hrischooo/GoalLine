import SectionHeader from './SectionHeader';
import TeamFormationBoard from './TeamFormationBoard';
import TacticalModeSelector from './TacticalModeSelector';
import { formatStatValue, formatTextValue } from '../utils/playerMetrics';

export default function TeamBestXISection({ activeLineup, activeMode, modeOptions = [], onModeChange, onOpenPlayer }) {
  const hasBestXI = Boolean(activeLineup?.xi?.length);

  return (
    <section className="team-block team-best-xi-section">
      <SectionHeader
        actions={
          <div className="team-best-xi-section__controls">
            <span className="team-block__meta">{formatTextValue(activeLineup?.formation, 'N/A')}</span>
            <TacticalModeSelector activeMode={activeMode} modes={modeOptions} onChange={onModeChange} />
          </div>
        }
        className="team-block__header team-block__header--stacked"
        kicker="Auto Selected"
        title="Best XI"
      />

      {hasBestXI ? (
        <div className="team-best-xi-board">
          <div className="team-best-xi-board__topbar">
            <div className="team-best-xi-board__copy">
              <strong>{activeLineup?.modeLabel || 'Lineup mode'}</strong>
              <p>{activeLineup?.explanationSummary || 'The tactical board reflects the strongest current lineup for the active shape.'}</p>
            </div>

            <div className="team-best-xi-board__meta">
              <div className="team-best-xi-board__meta-tile">
                <span>Formation</span>
                <strong>{formatTextValue(activeLineup?.formation, 'N/A')}</strong>
              </div>
              <div className="team-best-xi-board__meta-tile">
                <span>XI Rating</span>
                <strong>{formatStatValue(activeLineup?.overallTeamRating, '-')}</strong>
              </div>
              <div className="team-best-xi-board__meta-tile">
                <span>Slot Fit</span>
                <strong>{formatStatValue(activeLineup?.slotFitAverage, '-')}</strong>
              </div>
              <div className="team-best-xi-board__meta-tile">
                <span>Confidence</span>
                <strong>{Math.round((activeLineup?.formationConfidence || 0) * 100)}%</strong>
              </div>
            </div>
          </div>

          <TeamFormationBoard formation={activeLineup?.formation} onOpenPlayer={onOpenPlayer} variant="full" xi={activeLineup?.xi || []} />
        </div>
      ) : (
        <div className="team-best-xi team-best-xi--empty">
          <p>No Best XI data is available yet.</p>
        </div>
      )}
    </section>
  );
}
