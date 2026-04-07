import { useEffect, useMemo, useState } from 'react';
import CompareHeader from '../components/CompareHeader';
import CompareModeSwitch from '../components/CompareModeSwitch';
import ComparePlayerSelector from '../components/ComparePlayerSelector';
import CompareRadarSection from '../components/CompareRadarSection';
import CompareRoleFitSection from '../components/CompareRoleFitSection';
import CompareStatsSection from '../components/CompareStatsSection';
import CompareTacticalProfileSection from '../components/CompareTacticalProfileSection';
import CompareTeamSelector from '../components/CompareTeamSelector';
import SectionHeader from '../components/SectionHeader';
import TeamComparisonDashboard from '../components/TeamComparisonDashboard';
import '../styles/compare.css';
import { buildPlayerKey, getLeagueFilterValue, getLeagueName, getPlayerByIdOrUniqueKey } from '../utils/dataset';
import { computeDisplayMetrics, formatStatValue, toNumber } from '../utils/playerMetrics';
import { normalizeString } from '../utils/search';

const OVERVIEW_SCORE_ROWS = [
  ['Overall', 'finalOVR'],
  ['Attack', 'attackScore'],
  ['Creativity', 'creativityScore'],
  ['Possession', 'possessionScore'],
  ['Defending', 'defendingScore']
];

const MODE_OPTIONS = [
  { id: 'players', label: 'Players', description: 'Role fit, output, and profile' },
  { id: 'teams', label: 'Teams', description: 'XI strength, depth, and recruitment' }
];

function buildCompareUrl(mode, selectors) {
  const params = new URLSearchParams();

  if (mode === 'teams') {
    params.set('mode', 'teams');

    if (selectors.team1) {
      params.set('team1', selectors.team1);
    }

    if (selectors.team2) {
      params.set('team2', selectors.team2);
    }
  } else {
    if (selectors.player1) {
      params.set('player1', selectors.player1);
    }

    if (selectors.player2) {
      params.set('player2', selectors.player2);
    }
  }

  const queryString = params.toString();
  return queryString ? `/compare?${queryString}` : '/compare';
}

function getScoreBarWidth(value) {
  return `${Math.max(0, Math.min(Number(value) || 0, 100))}%`;
}

function buildTeamOptions(teams = []) {
  return teams.map((team) => {
    const displayName = team.displayName || team.name;
    const formation = team.preferred_formation || team.detectedFormation || 'N/A';

    return {
      id: team.id,
      name: displayName,
      displayName,
      league: team.league || 'Unknown League',
      country: team.country || '',
      manager: team.manager || '',
      formation,
      rating: Math.round(team.teamRating || team.avgRating || 0),
      popularity: team.popularity || 0,
      nameNormalized: normalizeString(displayName),
      nameTokens: normalizeString(displayName).split(' ').filter(Boolean),
      metadataFieldsNormalized: [team.league, team.country, team.manager, formation].map((value) => normalizeString(value)).filter(Boolean),
      searchTextNormalized: normalizeString([displayName, team.league, team.country, team.manager, formation].filter(Boolean).join(' '))
    };
  });
}

export default function Compare({
  header,
  initialMode,
  initialPlayer1,
  initialPlayer2,
  initialTeam1,
  initialTeam2,
  onNavigate,
  players,
  ratingIndex,
  teams = []
}) {
  const [compareMode, setCompareMode] = useState(initialMode === 'teams' ? 'teams' : 'players');
  const [selectors, setSelectors] = useState({
    player1: initialPlayer1 || '',
    player2: initialPlayer2 || '',
    team1: initialTeam1 || '',
    team2: initialTeam2 || ''
  });

  useEffect(() => {
    setCompareMode(initialMode === 'teams' ? 'teams' : 'players');
  }, [initialMode]);

  useEffect(() => {
    setSelectors({
      player1: initialPlayer1 || '',
      player2: initialPlayer2 || '',
      team1: initialTeam1 || '',
      team2: initialTeam2 || ''
    });
  }, [initialPlayer1, initialPlayer2, initialTeam1, initialTeam2]);

  useEffect(() => {
    window.history.replaceState({}, '', buildCompareUrl(compareMode, selectors));
  }, [compareMode, selectors]);

  const playerOptions = useMemo(
    () =>
      (players.data || []).map((player) => {
        const metrics = computeDisplayMetrics(player, ratingIndex);

        return {
          id: buildPlayerKey(player),
          metrics,
          player,
          label: `${player.player} / ${player.squad} / ${getLeagueName(player)}`,
          leagueId: getLeagueFilterValue(player),
          leagueName: getLeagueName(player),
          popularity:
            toNumber(player.goals) * 10 +
            toNumber(player.assists) * 8 +
            toNumber(player.expected_goals) * 4 +
            (toNumber(player.matches_played) * toNumber(player.avg_mins_per_match)) / 90,
          positionFamily: metrics.positionFamily,
          searchText: [
            player.player,
            player.squad,
            getLeagueName(player),
            player.pos,
            metrics.primaryTacticalRoleLabel,
            metrics.secondaryTacticalRoleLabel
          ]
            .filter(Boolean)
            .join(' '),
          name: player.player,
          team: player.squad,
          position: player.pos,
          nationality: player.nation,
          league: getLeagueName(player)
        };
      }),
    [players.data, ratingIndex]
  );

  const teamOptions = useMemo(() => buildTeamOptions(teams), [teams]);

  const playerCompareState = useMemo(() => {
    if (players.error) {
      return { loading: false, error: players.error, notFound: '', player1: null, player2: null };
    }

    if (!selectors.player1 || !selectors.player2) {
      return { loading: false, error: '', notFound: '', player1: null, player2: null };
    }

    if (players.loading) {
      return { loading: true, error: '', notFound: '', player1: null, player2: null };
    }

    const left = getPlayerByIdOrUniqueKey(players.data, selectors.player1);
    const right = getPlayerByIdOrUniqueKey(players.data, selectors.player2);

    if (!left || !right) {
      return {
        loading: false,
        error: '',
        notFound: !left ? selectors.player1 : selectors.player2,
        player1: left,
        player2: right
      };
    }

    return { loading: false, error: '', notFound: '', player1: left, player2: right };
  }, [players.data, players.error, players.loading, selectors.player1, selectors.player2]);

  const leftMetrics = playerCompareState.player1 ? computeDisplayMetrics(playerCompareState.player1, ratingIndex) : null;
  const rightMetrics = playerCompareState.player2 ? computeDisplayMetrics(playerCompareState.player2, ratingIndex) : null;
  const leftTeam = useMemo(() => teams.find((team) => team.id === selectors.team1) || null, [selectors.team1, teams]);
  const rightTeam = useMemo(() => teams.find((team) => team.id === selectors.team2) || null, [selectors.team2, teams]);

  const intro =
    compareMode === 'teams'
      ? {
          kicker: 'Team Comparison',
          title: 'Compare team structure, depth, and recruitment pressure.',
          subtitle:
            'Mirror two squads side by side and scan the stronger XI, the cleaner tactical profile, the safer depth map, and the clearer recruitment priorities.'
        }
      : {
          kicker: 'Cross-League Compare',
          title: 'Scan role identity and output in one view.',
          subtitle:
            'Search any player in the unified database, compare them side by side, and see tactical profile, overall rating, and core production without leaving the page.'
        };

  return (
    <main className="compare-page">
      <div className="compare-shell">
        {header}

        <section className="compare-intro">
          <div className="compare-intro__top">
            <div>
              <p className="home-kicker">{intro.kicker}</p>
              <h1>{intro.title}</h1>
              <p className="compare-subtitle">{intro.subtitle}</p>
            </div>
            <CompareModeSwitch activeMode={compareMode} modes={MODE_OPTIONS} onChange={setCompareMode} />
          </div>
        </section>

        {compareMode === 'players' ? (
          <>
            <section className="compare-selector-grid">
              <ComparePlayerSelector
                label="Player A"
                onSelect={(value) => setSelectors((current) => ({ ...current, player1: value }))}
                options={playerOptions}
                selectedPlayer={playerCompareState.player1}
                selectedValue={selectors.player1}
              />

              <div className="compare-selector-grid__actions">
                <button
                  className="primary-button"
                  onClick={() => setSelectors((current) => ({ ...current, player1: current.player2, player2: current.player1 }))}
                  type="button"
                >
                  Swap players
                </button>
              </div>

              <ComparePlayerSelector
                label="Player B"
                onSelect={(value) => setSelectors((current) => ({ ...current, player2: value }))}
                options={playerOptions}
                selectedPlayer={playerCompareState.player2}
                selectedValue={selectors.player2}
              />
            </section>

            {!selectors.player1 || !selectors.player2 ? <p className="compare-message">Select two players to open the tactical comparison view.</p> : null}
            {playerCompareState.loading ? <p className="compare-message">Loading comparison...</p> : null}
            {playerCompareState.error ? <p className="compare-message compare-message--error">Unable to load comparison: {playerCompareState.error}</p> : null}
            {playerCompareState.notFound ? <p className="compare-message">Player not found: {playerCompareState.notFound}</p> : null}

            {!playerCompareState.loading && !playerCompareState.error && playerCompareState.player1 && playerCompareState.player2 && leftMetrics && rightMetrics ? (
              <>
                <CompareHeader
                  leftMetrics={leftMetrics}
                  leftPlayer={playerCompareState.player1}
                  onOpenLeft={() => onNavigate(`/player/${encodeURIComponent(buildPlayerKey(playerCompareState.player1))}`)}
                  onOpenRight={() => onNavigate(`/player/${encodeURIComponent(buildPlayerKey(playerCompareState.player2))}`)}
                  onSwap={() => setSelectors((current) => ({ ...current, player1: current.player2, player2: current.player1 }))}
                  rightMetrics={rightMetrics}
                  rightPlayer={playerCompareState.player2}
                />

                <section className="compare-section">
                  <SectionHeader className="compare-section__header" kicker="Overview" title="High-Level Comparison" />

                  <div className="compare-overview-board">
                    {OVERVIEW_SCORE_ROWS.map(([label, key]) => (
                      <div className="compare-overview-row" key={key}>
                        <strong>{formatStatValue(leftMetrics[key])}</strong>
                        <div className="compare-overview-row__track">
                          <span>{label}</span>
                          <div className="compare-overview-row__bars">
                            <div className="compare-overview-row__bar compare-overview-row__bar--left" style={{ width: getScoreBarWidth(leftMetrics[key]) }} />
                            <div className="compare-overview-row__bar compare-overview-row__bar--right" style={{ width: getScoreBarWidth(rightMetrics[key]) }} />
                          </div>
                        </div>
                        <strong>{formatStatValue(rightMetrics[key])}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <CompareRadarSection leftMetrics={leftMetrics} leftPlayer={playerCompareState.player1} rightMetrics={rightMetrics} rightPlayer={playerCompareState.player2} />
                <CompareStatsSection leftMetrics={leftMetrics} leftPlayer={playerCompareState.player1} rightMetrics={rightMetrics} rightPlayer={playerCompareState.player2} />
                <CompareTacticalProfileSection leftMetrics={leftMetrics} rightMetrics={rightMetrics} />
                <CompareRoleFitSection leftMetrics={leftMetrics} rightMetrics={rightMetrics} />
              </>
            ) : null}
          </>
        ) : (
          <>
            <section className="compare-selector-grid compare-selector-grid--teams">
              <CompareTeamSelector
                label="Team A"
                onSelect={(value) => setSelectors((current) => ({ ...current, team1: value }))}
                options={teamOptions}
                selectedTeam={leftTeam}
                selectedValue={selectors.team1}
              />

              <div className="compare-selector-grid__actions">
                <button
                  className="primary-button"
                  onClick={() => setSelectors((current) => ({ ...current, team1: current.team2, team2: current.team1 }))}
                  type="button"
                >
                  Swap teams
                </button>
              </div>

              <CompareTeamSelector
                label="Team B"
                onSelect={(value) => setSelectors((current) => ({ ...current, team2: value }))}
                options={teamOptions}
                selectedTeam={rightTeam}
                selectedValue={selectors.team2}
              />
            </section>

            {!selectors.team1 || !selectors.team2 ? (
              <p className="compare-message">Select two teams to open the scouting, tactical, depth, and recruitment comparison views.</p>
            ) : null}

            {leftTeam && rightTeam ? <TeamComparisonDashboard leftTeam={leftTeam} onNavigate={onNavigate} rightTeam={rightTeam} teams={teams} /> : null}
          </>
        )}
      </div>
    </main>
  );
}
