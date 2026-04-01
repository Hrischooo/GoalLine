import { useEffect, useMemo, useState } from 'react';
import { buildPlayerKey, findTeamBySquadName } from '../utils/dataset';
import { buildFormationFitProfile } from '../utils/formationFit';
import { buildPlayerFitProfile } from '../utils/playerFitScore';
import { buildReplacementFinderProfile } from '../utils/replacementFinder';
import { REPLACEMENT_MODES } from '../utils/recruitmentShared';

const PANEL_TABS = [
  { id: 'fit', label: 'Fit Analysis' },
  { id: 'replacements', label: 'Replacement Paths' }
];

const PLAYER_REPLACEMENT_MODES = [
  REPLACEMENT_MODES.direct.id,
  REPLACEMENT_MODES.younger.id,
  REPLACEMENT_MODES.safer.id,
  REPLACEMENT_MODES.higherUpside.id
];

function FormationCard({ item }) {
  return (
    <article className="fit-formation-card">
      <div className="fit-formation-card__top">
        <strong>{item.formation}</strong>
        <span>{item.fitScore}</span>
      </div>
      <p>{item.expectedRole}</p>
      <small>{item.explanation}</small>
    </article>
  );
}

function ReplacementCard({ candidate, onOpenPlayer }) {
  return (
    <article className="fit-replacement-card">
      <div className="fit-replacement-card__top">
        <div>
          <strong>{candidate.player.player}</strong>
          <p>
            {candidate.metrics.exactPosition} / {candidate.metrics.primaryTacticalRoleLabel}
          </p>
        </div>
        <div className="fit-replacement-card__score">
          <span>{candidate.replacementType}</span>
          <strong>{candidate.replacementScore}</strong>
        </div>
      </div>

      <div className="fit-replacement-card__meta">
        <span>{candidate.fitTier} fit</span>
        <span>{candidate.matchType}</span>
        <span>{candidate.expectedRoleInTargetTeam || candidate.expectedRole}</span>
      </div>

      <p>{candidate.whyItFits || candidate.whyFits}</p>
      <small>{candidate.howItDiffers || candidate.difference}</small>
      <small>{candidate.upgradeOrDowngradeContext}</small>

      <button className="secondary-button" onClick={() => onOpenPlayer?.(buildPlayerKey(candidate.player))} type="button">
        Open player
      </button>
    </article>
  );
}

export default function TeamFitPanel({ metrics, onOpenPlayer, player, playerIdentifier, players = [], ratingIndex = {}, teams = [] }) {
  const teamOptions = useMemo(
    () =>
      [...(teams || [])]
        .map((team) => ({
          id: team.id,
          label: `${team.displayName || team.name} (${team.league})`,
          team
        }))
        .sort((left, right) => left.label.localeCompare(right.label)),
    [teams]
  );
  const defaultTeam = useMemo(() => findTeamBySquadName(teams, player?.squad || '') || teams[0] || null, [teams, player?.squad]);
  const [selectedTeamId, setSelectedTeamId] = useState(defaultTeam?.id || '');
  const [activeTab, setActiveTab] = useState('fit');
  const [replacementMode, setReplacementMode] = useState(REPLACEMENT_MODES.direct.id);
  const [showDetails, setShowDetails] = useState(false);
  const selectedTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId) || defaultTeam || null, [teams, selectedTeamId, defaultTeam]);
  const formationProfile = useMemo(() => buildFormationFitProfile(player, ratingIndex, { limit: 4 }), [player, ratingIndex]);
  const fitProfile = useMemo(
    () => (selectedTeam ? buildPlayerFitProfile(player, selectedTeam, ratingIndex, { metrics, formationProfile }) : null),
    [selectedTeam, player, ratingIndex, metrics, formationProfile]
  );
  const replacementProfile = useMemo(
    () =>
      buildReplacementFinderProfile({
        team: selectedTeam,
        sourcePlayer: player,
        players,
        ratingIndex,
        mode: replacementMode
      }),
    [selectedTeam, player, players, ratingIndex, replacementMode]
  );

  useEffect(() => {
    setSelectedTeamId(defaultTeam?.id || '');
    setActiveTab('fit');
    setReplacementMode(REPLACEMENT_MODES.direct.id);
    setShowDetails(false);
  }, [defaultTeam?.id, playerIdentifier]);

  return (
    <section className="group-card insight-card team-fit-panel">
      <div className="group-card__header">
        <div>
          <p className="analysis-kicker">Recruitment Intelligence</p>
          <h3>Team Fit</h3>
          <p className="insight-card__summary">Evaluate how the player fits a specific team, what role he would fill, and which alternative profiles also solve that job.</p>
        </div>

        <label className="team-fit-panel__selector">
          <span>Evaluate for team</span>
          <select onChange={(event) => setSelectedTeamId(event.target.value)} value={selectedTeamId}>
            {teamOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="scouting-insights__tabs">
        {PANEL_TABS.map((tab) => (
          <button
            className={`scouting-insights__tab${activeTab === tab.id ? ' scouting-insights__tab--active' : ''}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'fit' ? (
        selectedTeam && fitProfile ? (
          <div className="team-fit-panel__body">
            <div className="team-fit-panel__hero">
              <div className="team-fit-panel__score">
                <span>Fit Score</span>
                <strong>{fitProfile.overallFitScore}</strong>
                <small>{fitProfile.fitTier} fit</small>
              </div>

              <div className="team-fit-panel__summary">
                <div className="overview-card">
                  <span>Best Role</span>
                  <strong>{fitProfile.bestTargetRole}</strong>
                </div>
                <div className="overview-card">
                  <span>Target Slot</span>
                  <strong>{fitProfile.bestTargetSlot}</strong>
                </div>
                <div className="overview-card">
                  <span>Squad Impact</span>
                  <strong>{fitProfile.upgradeLevel === 'depth-only' ? 'Depth option' : `${fitProfile.upgradeLevel} XI upgrade`}</strong>
                </div>
              </div>
            </div>

            <div className="team-fit-panel__summary-strip">
              <article className="insight-mini-row insight-mini-row--positive">
                <strong>Fit Summary</strong>
                <p>{fitProfile.formationFitSummary}</p>
                <p>{fitProfile.systemFitSummary}</p>
              </article>

              <article className="insight-mini-row insight-mini-row--neutral">
                <strong>Best Need Solved</strong>
                <p>{fitProfile.bestNeed?.title || 'General squad value rather than one major flagged gap.'}</p>
              </article>
            </div>

            <div className="team-fit-panel__actions">
              <button className="secondary-button" onClick={() => setShowDetails((current) => !current)} type="button">
                {showDetails ? 'Hide fit detail' : 'Show fit detail'}
              </button>
            </div>

            {showDetails ? (
              <div className="scouting-insights__grid">
                <div className="insight-mini-list">
                  <article className="insight-mini-row insight-mini-row--positive">
                    <strong>Why it fits</strong>
                    {(fitProfile.topFitReasons || []).map((reason) => (
                      <p key={reason}>{reason}</p>
                    ))}
                  </article>
                </div>

                <div className="insight-mini-list">
                  <article className="insight-mini-row insight-mini-row--caution">
                    <strong>Watch-outs</strong>
                    {(fitProfile.topConcerns || []).map((reason) => (
                      <p key={reason}>{reason}</p>
                    ))}
                  </article>
                </div>
              </div>
            ) : null}

            <div className="team-fit-panel__formations">
              {(fitProfile.formationFits || []).slice(0, 4).map((item) => (
                <FormationCard item={item} key={`${selectedTeam.id}-${item.formation}`} />
              ))}
            </div>

            {showDetails && (formationProfile.lessIdealNotes || []).length ? (
              <div className="team-fit-panel__less-ideal">
                {(formationProfile.lessIdealNotes || []).map((item) => (
                  <article className="insight-mini-row insight-mini-row--neutral" key={`${selectedTeam.id}-${item.formation}-note`}>
                    <strong>{item.formation}</strong>
                    <p>{item.note}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <article className="insight-mini-row insight-mini-row--neutral">
            <strong>Team fit unavailable</strong>
            <p>Select a team to evaluate the fit profile.</p>
          </article>
        )
      ) : selectedTeam ? (
        <div className="team-fit-panel__body">
          <div className="team-fit-panel__replacement-header">
            <p className="insight-card__summary">{replacementProfile.summary}</p>
            <label className="team-fit-panel__selector team-fit-panel__selector--compact">
              <span>Replacement view</span>
              <select onChange={(event) => setReplacementMode(event.target.value)} value={replacementMode}>
                {PLAYER_REPLACEMENT_MODES.map((modeKey) => (
                  <option key={modeKey} value={modeKey}>
                    {REPLACEMENT_MODES[modeKey].label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="team-fit-panel__replacement-list">
            {(replacementProfile.candidates || []).length ? (
              replacementProfile.candidates.map((candidate) => (
                <ReplacementCard candidate={candidate} key={`${candidate.player.player}-${replacementMode}-${selectedTeam.id}`} onOpenPlayer={onOpenPlayer} />
              ))
            ) : (
              <article className="insight-mini-row insight-mini-row--neutral">
                <strong>No alternatives returned</strong>
                <p>The current dataset does not have enough strong alternatives for this team and replacement view.</p>
              </article>
            )}
          </div>
        </div>
      ) : (
        <article className="insight-mini-row insight-mini-row--neutral">
          <strong>Replacement paths unavailable</strong>
          <p>Select a team to compare alternatives around this role.</p>
        </article>
      )}
    </section>
  );
}
