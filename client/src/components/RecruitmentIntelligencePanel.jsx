import { useEffect, useMemo, useState } from 'react';
import { buildPlayerKey } from '../utils/dataset';
import { buildReplacementFinderProfile } from '../utils/replacementFinder';
import { buildSquadGapFinderProfile } from '../utils/squadGapFinder';
import { REPLACEMENT_MODES } from '../utils/recruitmentShared';

const TEAM_REPLACEMENT_MODES = [
  REPLACEMENT_MODES.direct.id,
  REPLACEMENT_MODES.younger.id,
  REPLACEMENT_MODES.safer.id,
  REPLACEMENT_MODES.squadDepth.id
];

function NeedButton({ active, need, onSelect }) {
  return (
    <button className={`team-need-card${active ? ' team-need-card--active' : ''}`} onClick={onSelect} type="button">
      <div className="team-need-card__top">
        <span className={`team-need-card__severity team-need-card__severity--${String(need.priority || '').toLowerCase()}`}>{need.priority}</span>
        <strong>{need.affectedRole || need.affectedPosition || need.gapType}</strong>
      </div>
      <p>{need.title}</p>
      <small>{need.explanation}</small>
    </button>
  );
}

function CandidateCard({ candidate, onOpenPlayer }) {
  return (
    <article className="team-target-card">
      <div className="team-target-card__top">
        <div>
          <strong>{candidate.player.player}</strong>
          <p>
            {candidate.metrics.exactPosition} / {candidate.metrics.primaryTacticalRoleLabel}
          </p>
        </div>
        <div className="team-target-card__score">
          <span>Score</span>
          <strong>{candidate.replacementScore}</strong>
        </div>
      </div>

      <div className="team-target-card__meta">
        <span>{candidate.replacementType}</span>
        <span>{candidate.fitTier} fit</span>
        <span>{candidate.expectedRoleInTargetTeam || candidate.expectedRole}</span>
      </div>

      <p>{candidate.whyItFits || candidate.whyFits}</p>
      <div className="team-target-card__caution">
        <strong>Difference</strong>
        <p>{candidate.howItDiffers || candidate.difference}</p>
        <small>{candidate.upgradeOrDowngradeContext}</small>
      </div>

      <button className="secondary-button" onClick={() => onOpenPlayer?.(buildPlayerKey(candidate.player))} type="button">
        Open player
      </button>
    </article>
  );
}

export default function RecruitmentIntelligencePanel({ onOpenPlayer, players, ratingIndex, team }) {
  const [selectedNeedKey, setSelectedNeedKey] = useState('');
  const [mode, setMode] = useState(REPLACEMENT_MODES.direct.id);
  const [showNeedDetails, setShowNeedDetails] = useState(false);
  const gapProfile = useMemo(() => buildSquadGapFinderProfile(team), [team]);
  const visibleNeeds = useMemo(() => (gapProfile.needs || []).slice(0, 3), [gapProfile.needs]);
  const selectedNeed = useMemo(
    () => visibleNeeds.find((need) => need.key === selectedNeedKey) || visibleNeeds[0] || null,
    [visibleNeeds, selectedNeedKey]
  );
  const replacementProfile = useMemo(
    () =>
      buildReplacementFinderProfile({
        team,
        need: selectedNeed,
        players,
        ratingIndex,
        mode
      }),
    [team, selectedNeed, players, ratingIndex, mode]
  );

  useEffect(() => {
    setSelectedNeedKey(visibleNeeds[0]?.key || '');
    setMode(REPLACEMENT_MODES.direct.id);
    setShowNeedDetails(false);
  }, [team?.id, visibleNeeds]);

  return (
    <section className="team-block team-recruitment-panel">
      <div className="team-block__header">
        <div>
          <p className="home-kicker">Recruitment Intelligence</p>
          <h2>Squad Gaps & Target Profiles</h2>
        </div>
      </div>

      <div className="team-recruitment-panel__summary">
        <div className="team-stat-tile">
          <span>Main Need</span>
          <strong>{visibleNeeds[0]?.title || 'No major gap flagged'}</strong>
        </div>
        <div className="team-stat-tile">
          <span>Open Needs</span>
          <strong>{gapProfile.needs.length}</strong>
        </div>
        <div className="team-stat-tile">
          <span>Detected Shape</span>
          <strong>{gapProfile.formation || team?.detectedFormation || '4-3-3'}</strong>
        </div>
      </div>

      <p className="team-recruitment-panel__summary-copy">{gapProfile.summary}</p>

      <div className="team-recruitment-panel__layout">
        <div className="team-need-list">
          {visibleNeeds.map((need) => (
            <NeedButton active={selectedNeed?.key === need.key} key={need.key} need={need} onSelect={() => setSelectedNeedKey(need.key)} />
          ))}
        </div>

        <div className="team-recruitment-panel__detail">
          {selectedNeed ? (
            <>
              <div className="team-recruitment-panel__detail-header">
                <div>
                  <span className={`team-need-card__severity team-need-card__severity--${String(selectedNeed.priority || '').toLowerCase()}`}>
                    {selectedNeed.priority} priority
                  </span>
                  <h3>{selectedNeed.title}</h3>
                  <p>{selectedNeed.explanation}</p>
                </div>

                <label className="team-squad-filter">
                  <span>Replacement view</span>
                  <select onChange={(event) => setMode(event.target.value)} value={mode}>
                    {TEAM_REPLACEMENT_MODES.map((modeKey) => (
                      <option key={modeKey} value={modeKey}>
                        {REPLACEMENT_MODES[modeKey].label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="team-recruitment-panel__actions">
                <button className="secondary-button" onClick={() => setShowNeedDetails((current) => !current)} type="button">
                  {showNeedDetails ? 'Hide detail' : 'Show detail'}
                </button>
              </div>

              {showNeedDetails && (selectedNeed.supportingEvidence || []).length ? (
                <div className="team-need-reasons">
                  {(selectedNeed.supportingEvidence || []).map((reason) => (
                    <span key={reason}>{reason}</span>
                  ))}
                </div>
              ) : null}

              <div className="team-target-list">
                {(replacementProfile.candidates || []).length ? (
                  replacementProfile.candidates.map((candidate) => (
                    <CandidateCard candidate={candidate} key={`${selectedNeed.key}-${candidate.player.player}-${mode}`} onOpenPlayer={onOpenPlayer} />
                  ))
                ) : (
                  <article className="team-target-card team-target-card--empty">
                    <strong>No target list available</strong>
                    <p>The current dataset does not have enough strong matches for this need and replacement view.</p>
                  </article>
                )}
              </div>
            </>
          ) : (
            <article className="team-target-card team-target-card--empty">
              <strong>No major squad need flagged</strong>
              <p>The current team model does not show a clear recruitment hole from the available data.</p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
