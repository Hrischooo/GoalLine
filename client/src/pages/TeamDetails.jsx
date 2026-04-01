import { useEffect, useMemo, useState } from 'react';
import ClubBadge from '../components/ClubBadge';
import OvrInlineValue from '../components/OvrInlineValue';
import PlayerAvatar from '../components/PlayerAvatar';
import TacticalModeSelector from '../components/TacticalModeSelector';
import TeamBestXISection from '../components/TeamBestXISection';
import TeamDepthChart from '../components/TeamDepthChart';
import TeamFormationBoard from '../components/TeamFormationBoard';
import TeamFormStrip from '../components/TeamFormStrip';
import RecruitmentIntelligencePanel from '../components/RecruitmentIntelligencePanel';
import TeamRatingPanel from '../components/TeamRatingPanel';
import TeamStrengthsWeaknesses from '../components/TeamStrengthsWeaknesses';
import '../styles/team.css';
import { computeDisplayMetrics, formatStatValue, formatTextValue, toNumber } from '../utils/playerMetrics';
import { buildPlayerKey, getTeamByIdOrName, getTeamPlayers } from '../utils/dataset';

const INITIAL_FILTERS = {
  position: 'all',
  sortKey: 'ovr'
};

const SORT_OPTIONS = {
  ovr: {
    label: 'Highest Rating',
    getValue: (player) => toNumber(player.finalOVR)
  },
  goals: {
    label: 'Most Goals',
    getValue: (player) => toNumber(player.goals)
  },
  assists: {
    label: 'Most Assists',
    getValue: (player) => toNumber(player.assists)
  },
  age: {
    label: 'Youngest',
    getValue: (player) => -toNumber(player.age)
  },
  name: {
    label: 'Name',
    getValue: () => 0
  }
};

function sortPlayers(players, sortKey) {
  return [...players].sort((left, right) => {
    if (sortKey === 'name') {
      return String(left.player || '').localeCompare(String(right.player || ''));
    }

    const sortDiff = SORT_OPTIONS[sortKey].getValue(right) - SORT_OPTIONS[sortKey].getValue(left);

    if (sortDiff !== 0) {
      return sortDiff;
    }

    return String(left.player || '').localeCompare(String(right.player || ''));
  });
}

function getKeyStat(player) {
  if (player.positionFamily === 'goalkeeper') {
    return {
      label: 'Clean Sheets',
      value: player.clean_sheets
    };
  }

  if (player.positionFamily === 'defender') {
    return {
      label: 'Tackles Won',
      value: player.tackles_won
    };
  }

  if (player.positionFamily === 'midfielder') {
    return {
      label: 'Key Passes',
      value: player.key_passes
    };
  }

  return {
    label: 'Goals',
    value: player.goals
  };
}

function TeamStatTile({ label, value }) {
  return (
    <div className="team-stat-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniPlayerList({ label, players = [], onNavigate }) {
  return (
    <div className="team-mini-list">
      <div className="team-mini-list__header">
        <span>{label}</span>
      </div>
      <div className="team-mini-list__items">
        {players.map((player) => (
          <button className="team-mini-list__item" key={player.player} onClick={() => onNavigate(`/player/${encodeURIComponent(buildPlayerKey(player))}`)} type="button">
            <PlayerAvatar name={player.player} size="small" />
            <div>
              <strong>{formatTextValue(player.player)}</strong>
              <span>
                {player.metrics?.finalOVR} OVR / {formatTextValue(player.metrics?.primaryTacticalRoleLabel)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TeamDetails({ header, players, ratingIndex, teamIdentifier, teams, onNavigate }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const team = useMemo(() => getTeamByIdOrName(teams.data || [], teamIdentifier), [teamIdentifier, teams.data]);
  const [activeMode, setActiveMode] = useState('preferred');

  const squadPlayers = useMemo(
    () =>
      team
        ? getTeamPlayers(players.data || [], team.name).map((player) => {
            const metrics = computeDisplayMetrics(player, ratingIndex);

            return {
              ...player,
              key: buildPlayerKey(player),
              metrics,
              finalOVR: metrics.finalOVR,
              exactPosition: metrics.exactPosition,
              positionFamily: metrics.positionFamily
            };
          })
        : [],
    [players.data, ratingIndex, team]
  );

  const positionOptions = useMemo(
    () => ['all', ...new Set(squadPlayers.map((player) => player.exactPosition).filter(Boolean))],
    [squadPlayers]
  );

  const filteredPlayers = useMemo(
    () => (filters.position === 'all' ? squadPlayers : squadPlayers.filter((player) => player.exactPosition === filters.position)),
    [filters.position, squadPlayers]
  );

  const sortedPlayers = useMemo(() => sortPlayers(filteredPlayers, filters.sortKey), [filteredPlayers, filters.sortKey]);
  const lineupModes = team?.lineupModes || {};
  const preferredLineup = lineupModes.preferred || team?.preferredBestXI || team?.bestXI || null;
  const autoLineup = lineupModes.auto || team?.bestXI || null;
  const availableModes = useMemo(
    () =>
      [
        preferredLineup
          ? {
              id: 'preferred',
              label: 'Preferred Tactical Shape',
              shortLabel: 'Preferred',
              meta: preferredLineup.formation
            }
          : null,
        autoLineup
          ? {
              id: 'auto',
              label: 'Auto Best Shape',
              shortLabel: 'Auto Best',
              meta: autoLineup.formation
            }
          : null
      ].filter(Boolean),
    [preferredLineup, autoLineup]
  );
  const resolvedMode = useMemo(
    () => (availableModes.some((mode) => mode.id === activeMode) ? activeMode : availableModes[0]?.id || 'auto'),
    [activeMode, availableModes]
  );
  const activeLineup = resolvedMode === 'preferred' ? preferredLineup : autoLineup;

  useEffect(() => {
    setFilters(INITIAL_FILTERS);
    setActiveMode(preferredLineup ? 'preferred' : 'auto');
  }, [teamIdentifier, preferredLineup]);

  if ((teams.loading || players.loading) && !team) {
    return (
      <main className="team-page">
        <div className="team-shell">
          {header}
          <section className="team-empty-state">
            <h1>Loading club profile</h1>
            <p>Building the team identity, tactical notes, and squad view.</p>
          </section>
        </div>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="team-page">
        <div className="team-shell">
          {header}
          <section className="team-empty-state">
            <h1>Team not found</h1>
            <p>The requested club profile is not available in the current scouting dataset.</p>
            <button className="secondary-button" onClick={() => onNavigate('/leagues')} type="button">
              Back to leagues
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="team-page">
      <div className="team-shell">
        {header}

        <header className="team-hero">
          <div className="team-hero__identity">
            <div className="team-hero__topline">
              <ClubBadge imageUrl={team.logo} name={team.displayName} size="large" />
              <div>
                <p className="home-kicker">Club Profile</p>
                <h1>{team.displayName}</h1>
                <p className="team-hero__subtitle">
                  {formatTextValue(team.league)} / {formatTextValue(team.country)} / {formatTextValue(team.manager, 'Unknown')}
                </p>
              </div>
            </div>

            <div className="team-hero__badges">
              <TeamStatTile label="Manager" value={formatTextValue(team.manager, 'Unknown')} />
              <TeamStatTile label="Preferred" value={formatTextValue(team.preferred_formation, 'N/A')} />
              <TeamStatTile label="Auto Best" value={formatTextValue(autoLineup?.formation || team.detectedFormation || team.preferred_formation, 'N/A')} />
              <TeamStatTile label="Team Rating" value={formatStatValue(activeLineup?.overallTeamRating || team.teamRating || team.avgRating, '-')} />
              <TeamStatTile label="Squad Size" value={team.squadSize} />
              <TeamStatTile label="Average Age" value={team.avgAge || '-'} />
            </div>
          </div>

          <div className="team-hero__panel">
            <div>
              <span className="team-hero__panel-label">Form</span>
              <TeamFormStrip form={team.formTokens} label={`${team.displayName} last five results`} />
            </div>
            <div className="team-hero__actions">
              <button className="secondary-button" onClick={() => onNavigate(`/league/${team.leagueId}`)} type="button">
                Open league
              </button>
              <button className="secondary-button" onClick={() => onNavigate('/leagues')} type="button">
                All leagues
              </button>
            </div>
          </div>
        </header>

        <section className="team-layout">
          <section className="team-block">
            <div className="team-block__header team-block__header--stacked">
              <div>
                <p className="home-kicker">Team Identity</p>
                <h2>Tactical Identity</h2>
              </div>
              <TacticalModeSelector activeMode={resolvedMode} modes={availableModes} onChange={setActiveMode} />
            </div>

            <div className="team-identity-grid">
              <div className="team-identity-copy">
                <h3>Shape Intelligence</h3>
                <p>{formatTextValue(activeLineup?.explanationSummary || team.tacticalIdentitySummary || team.play_style, 'N/A')}</p>

                <div className="team-identity-copy__meta">
                  <span>{activeLineup?.modeLabel || 'Active mode'}</span>
                  <strong>
                    Preferred {formatTextValue(team.preferred_formation, 'N/A')} / Auto {formatTextValue(autoLineup?.formation || team.detectedFormation, 'N/A')}
                  </strong>
                </div>

                <div className="team-identity-mode-grid">
                  <article className={`team-identity-mode-card${resolvedMode === 'preferred' ? ' team-identity-mode-card--active' : ''}`}>
                    <span>Preferred Shape</span>
                    <strong>{formatTextValue(preferredLineup?.formation || team.preferred_formation, 'N/A')}</strong>
                    <p>{formatTextValue(preferredLineup?.explanationSummary, 'Strongest XI inside the intended team structure.')}</p>
                  </article>
                  <article className={`team-identity-mode-card${resolvedMode === 'auto' ? ' team-identity-mode-card--active' : ''}`}>
                    <span>Auto Best Shape</span>
                    <strong>{formatTextValue(autoLineup?.formation || team.detectedFormation, 'N/A')}</strong>
                    <p>{formatTextValue(autoLineup?.explanationSummary, 'Best current tactical fit from the available squad.')}</p>
                  </article>
                </div>
              </div>

              <div className="team-identity-visual">
                <div className="team-identity-visual__header">
                  <div>
                    <span>{activeLineup?.modeLabel || 'Active Shape'}</span>
                    <strong>{formatTextValue(activeLineup?.formation || team.detectedFormation || team.preferred_formation, 'N/A')}</strong>
                  </div>
                  <small>{Math.round((activeLineup?.formationConfidence || team.formationConfidence || 0) * 100)}% confidence</small>
                </div>

                <div className="team-identity-visual__meta">
                  <div className="team-identity-visual__metric">
                    <span>Formation Score</span>
                    <strong>{formatStatValue(activeLineup?.totalFormationScore || activeLineup?.formationFitScore, '-')}</strong>
                  </div>
                  <div className="team-identity-visual__metric">
                    <span>Role Coherence</span>
                    <strong>{formatStatValue(activeLineup?.roleCoherenceScore, '-')}</strong>
                  </div>
                  <div className="team-identity-visual__metric">
                    <span>Position Coverage</span>
                    <strong>{formatStatValue(activeLineup?.positionCoverageScore, '-')}</strong>
                  </div>
                </div>

                <TeamFormationBoard
                  formation={activeLineup?.formation || team.detectedFormation || team.preferred_formation}
                  onOpenPlayer={(playerKey) => onNavigate(`/player/${encodeURIComponent(playerKey)}`)}
                  variant="mini"
                  xi={activeLineup?.xi || team.bestXI?.xi || []}
                />
              </div>
            </div>
          </section>

          <section className="team-block">
            <div className="team-block__header">
              <div>
                <p className="home-kicker">Squad Snapshot</p>
                <h2>Derived Analytics</h2>
              </div>
            </div>

            <div className="team-stats-grid">
              <TeamStatTile label="Total Goals" value={formatStatValue(team.goalsScored, '0')} />
              <TeamStatTile label="Total Assists" value={formatStatValue(team.totalAssists || team.avgAssists, '0')} />
              <TeamStatTile label="Strongest Line" value={formatTextValue(team.strongestLine, '-')} />
              <TeamStatTile label="Weakest Line" value={formatTextValue(team.weakestLine, '-')} />
              <TeamStatTile label="Formation Confidence" value={`${Math.round((activeLineup?.formationConfidence || team.formationConfidence || 0) * 100)}%`} />
              <TeamStatTile label="Squad Avg OVR" value={formatStatValue(team.squadAverageRating || team.avgRating, '0')} />
            </div>
          </section>
        </section>

        <TeamRatingPanel bestXI={activeLineup} tacticalIdentitySummary={team.tacticalIdentitySummary} team={team} />
        <TeamBestXISection
          activeLineup={activeLineup}
          activeMode={resolvedMode}
          modeOptions={availableModes}
          onModeChange={setActiveMode}
          onOpenPlayer={(playerKey) => onNavigate(`/player/${encodeURIComponent(playerKey)}`)}
        />

        <section className="team-layout">
          <TeamDepthChart depthChart={team.positionDepth || []} />
          <section className="team-block">
            <div className="team-block__header">
              <div>
                <p className="home-kicker">Key Figures</p>
                <h2>Leaders & Talents</h2>
              </div>
            </div>

            <div className="team-mini-lists">
              <MiniPlayerList label="Key Players" onNavigate={onNavigate} players={team.keyPlayers || []} />
              <MiniPlayerList label="Young Talents" onNavigate={onNavigate} players={team.youngTalents || []} />
            </div>
          </section>
        </section>

        <TeamStrengthsWeaknesses team={team} />

        <RecruitmentIntelligencePanel
          onOpenPlayer={(playerKey) => onNavigate(`/player/${encodeURIComponent(playerKey)}`)}
          players={players.data || []}
          ratingIndex={ratingIndex}
          team={team}
        />

        <section className="team-block">
          <div className="team-block__header team-block__header--stacked">
            <div>
              <p className="home-kicker">Squad</p>
              <h2>Player Profiles</h2>
            </div>
            <span className="team-block__meta">
              Showing {sortedPlayers.length} of {squadPlayers.length}
            </span>
          </div>

          <div className="team-squad-toolbar">
            <label className="team-squad-filter">
              <span>Position</span>
              <select onChange={(event) => setFilters((current) => ({ ...current, position: event.target.value }))} value={filters.position}>
                {positionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position === 'all' ? 'All Positions' : position}
                  </option>
                ))}
              </select>
            </label>

            <label className="team-squad-filter">
              <span>Sort</span>
              <select onChange={(event) => setFilters((current) => ({ ...current, sortKey: event.target.value }))} value={filters.sortKey}>
                {Object.entries(SORT_OPTIONS).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="team-squad-grid">
            {sortedPlayers.map((player) => {
              const keyStat = getKeyStat(player);

              return (
                <button className="team-player-card" key={player.key} onClick={() => onNavigate(`/player/${encodeURIComponent(player.key)}`)} type="button">
                  <div className="team-player-card__header">
                    <div className="team-player-card__identity">
                      <PlayerAvatar name={player.player} size="medium" />
                      <div>
                        <h3>{player.player}</h3>
                        <p>
                          {player.exactPosition} / {formatTextValue(player.nation)}
                        </p>
                      </div>
                    </div>
                    <OvrInlineValue className="team-player-card__ovr" metrics={player.metrics} value={formatStatValue(player.finalOVR, '0')} />
                  </div>

                  <div className="team-player-card__body">
                    <div className="team-player-card__metric">
                      <span>{keyStat.label}</span>
                      <strong>{formatStatValue(keyStat.value, '0')}</strong>
                    </div>
                    <div className="team-player-card__metric">
                      <span>Role</span>
                      <strong>{player.metrics.primaryTacticalRoleLabel}</strong>
                    </div>
                    <div className="team-player-card__metric">
                      <span>Age</span>
                      <strong>{formatTextValue(player.age)}</strong>
                    </div>
                    <div className="team-player-card__metric">
                      <span>Reliability</span>
                      <strong>{formatTextValue(player.metrics.reliabilityLabel, '-')}</strong>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
