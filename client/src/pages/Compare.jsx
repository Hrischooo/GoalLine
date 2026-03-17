import { useEffect, useMemo, useState } from 'react';
import CompareHeader from '../components/CompareHeader';
import ComparePlayerSelector from '../components/ComparePlayerSelector';
import CompareRoleFitSection from '../components/CompareRoleFitSection';
import CompareStatsSection from '../components/CompareStatsSection';
import CompareTacticalProfileSection from '../components/CompareTacticalProfileSection';
import '../styles/compare.css';
import { computeDisplayMetrics, formatStatValue } from '../utils/playerMetrics';
import { buildPlayerKey, getCompareCandidates, getLeagueName, getPlayerByIdOrUniqueKey, LEAGUE_FILTERS } from '../utils/dataset';

const BASE_COMPARISON_GROUPS = [
  {
    title: 'Attack',
    stats: [
      ['Goals', 'goals'],
      ['Assists', 'assists'],
      ['Expected Goals', 'expected_goals'],
      ['Total Shots', 'total_shots'],
      ['Shots P90', 'shots_p90']
    ]
  },
  {
    title: 'Creativity',
    stats: [
      ['Key Passes', 'key_passes'],
      ['Progressive Passes', 'progressive_passes'],
      ['Progressive Carries', 'progressive_carries'],
      ['SCA P90', 'shot_creating_actions_p90'],
      ['GCA P90', 'goal_creating_actions_p90']
    ]
  },
  {
    title: 'Possession',
    stats: [
      ['Pass Completion %', 'pass_completion_pct'],
      ['Passes Completed', 'passes_completed'],
      ['Passes Attempted', 'passes_attempted']
    ]
  },
  {
    title: 'Defending',
    stats: [
      ['Tackles Won', 'tackles_won'],
      ['Interceptions', 'interceptions'],
      ['Aerial Duels Won %', 'aerial_duels_won_pct']
    ]
  },
  {
    title: 'Goalkeeping',
    stats: [
      ['Goals Against', 'goals_against'],
      ['Goals Against P90', 'goals_against_p90'],
      ['Saves', 'saves'],
      ['Save %', 'saves_pct'],
      ['Clean Sheets', 'clean_sheets']
    ]
  }
];

const OVERVIEW_SCORE_ROWS = [
  ['Overall', 'finalOVR'],
  ['Attack', 'attackScore'],
  ['Creativity', 'creativityScore'],
  ['Possession', 'possessionScore'],
  ['Defending', 'defendingScore']
];

function buildCompareUrl(player1, player2) {
  const params = new URLSearchParams();

  if (player1) {
    params.set('player1', player1);
  }

  if (player2) {
    params.set('player2', player2);
  }

  const queryString = params.toString();
  return queryString ? `/compare?${queryString}` : '/compare';
}

function hasRenderableValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function getScoreBarWidth(value) {
  return `${Math.max(0, Math.min(Number(value) || 0, 100))}%`;
}

export default function Compare({ header, initialPlayer1, initialPlayer2, onNavigate, players, ratingIndex }) {
  const [selectors, setSelectors] = useState({
    player1: initialPlayer1 || '',
    player2: initialPlayer2 || ''
  });

  useEffect(() => {
    setSelectors({
      player1: initialPlayer1 || '',
      player2: initialPlayer2 || ''
    });
  }, [initialPlayer1, initialPlayer2]);

  useEffect(() => {
    window.history.replaceState({}, '', buildCompareUrl(selectors.player1, selectors.player2));
  }, [selectors.player1, selectors.player2]);

  const playerOptions = useMemo(
    () =>
      getCompareCandidates(players.data || [], LEAGUE_FILTERS.all.id).map((player) => {
        const metrics = computeDisplayMetrics(player, ratingIndex);

        return {
          id: buildPlayerKey(player),
          player,
          label: `${player.player} / ${player.squad} / ${getLeagueName(player)}`,
          searchText: [
            player.player,
            player.squad,
            getLeagueName(player),
            player.pos,
            metrics.primaryTacticalRoleLabel,
            metrics.secondaryTacticalRoleLabel
          ]
            .filter(Boolean)
            .join(' ')
        };
      }),
    [players.data, ratingIndex]
  );

  const compareState = useMemo(() => {
    if (players.error) {
      return {
        loading: false,
        error: players.error,
        notFound: '',
        player1: null,
        player2: null
      };
    }

    if (!selectors.player1 || !selectors.player2) {
      return {
        loading: false,
        error: '',
        notFound: '',
        player1: null,
        player2: null
      };
    }

    if (players.loading) {
      return {
        loading: true,
        error: '',
        notFound: '',
        player1: null,
        player2: null
      };
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

    return {
      loading: false,
      error: '',
      notFound: '',
      player1: left,
      player2: right
    };
  }, [players.data, players.error, players.loading, selectors.player1, selectors.player2]);

  const leftMetrics = compareState.player1 ? computeDisplayMetrics(compareState.player1, ratingIndex) : null;
  const rightMetrics = compareState.player2 ? computeDisplayMetrics(compareState.player2, ratingIndex) : null;

  const comparisonGroups = useMemo(() => {
    if (!compareState.player1 || !compareState.player2) {
      return BASE_COMPARISON_GROUPS;
    }

    return BASE_COMPARISON_GROUPS.filter((group) =>
      group.stats.some(([_, key]) => hasRenderableValue(compareState.player1[key]) || hasRenderableValue(compareState.player2[key]))
    );
  }, [compareState.player1, compareState.player2]);

  useEffect(() => {
    console.debug('[compare]', {
      totalCandidates: playerOptions.length,
      leaguesAvailable: [...new Set((players.data || []).map((player) => getLeagueName(player)))],
      selectedPlayers: [compareState.player1?.player || null, compareState.player2?.player || null],
      tacticalProfilesVisible: Boolean(leftMetrics && rightMetrics)
    });
  }, [compareState.player1, compareState.player2, leftMetrics, playerOptions.length, players.data, rightMetrics]);

  return (
    <main className="compare-page">
      <div className="compare-shell">
        {header}

        <section className="compare-intro">
          <div>
            <p className="home-kicker">Cross-League Compare</p>
            <h1>Scan role identity and output in one view.</h1>
            <p className="compare-subtitle">
              Search any player in the unified database, compare them side by side, and see tactical profile, overall rating,
              and core production without leaving the page.
            </p>
          </div>
        </section>

        <section className="compare-selector-grid">
          <ComparePlayerSelector
            label="Player A"
            onSelect={(value) => setSelectors((current) => ({ ...current, player1: value }))}
            options={playerOptions}
            selectedPlayer={compareState.player1}
            selectedValue={selectors.player1}
          />

          <div className="compare-selector-grid__actions">
            <button
              className="primary-button"
              onClick={() => setSelectors((current) => ({ player1: current.player2, player2: current.player1 }))}
              type="button"
            >
              Swap players
            </button>
          </div>

          <ComparePlayerSelector
            label="Player B"
            onSelect={(value) => setSelectors((current) => ({ ...current, player2: value }))}
            options={playerOptions}
            selectedPlayer={compareState.player2}
            selectedValue={selectors.player2}
          />
        </section>

        {!selectors.player1 || !selectors.player2 ? <p className="compare-message">Select two players to open the tactical comparison view.</p> : null}
        {compareState.loading ? <p className="compare-message">Loading comparison...</p> : null}
        {compareState.error ? <p className="compare-message compare-message--error">Unable to load comparison: {compareState.error}</p> : null}
        {compareState.notFound ? <p className="compare-message">Player not found: {compareState.notFound}</p> : null}

        {!compareState.loading && !compareState.error && compareState.player1 && compareState.player2 && leftMetrics && rightMetrics ? (
          <>
            <CompareHeader
              leftMetrics={leftMetrics}
              leftPlayer={compareState.player1}
              onOpenLeft={() => onNavigate(`/player/${encodeURIComponent(buildPlayerKey(compareState.player1))}`)}
              onOpenRight={() => onNavigate(`/player/${encodeURIComponent(buildPlayerKey(compareState.player2))}`)}
              onSwap={() => setSelectors((current) => ({ player1: current.player2, player2: current.player1 }))}
              rightMetrics={rightMetrics}
              rightPlayer={compareState.player2}
            />

            <section className="compare-section">
              <div className="compare-section__header">
                <div>
                  <p className="home-kicker">Overview</p>
                  <h2>High-Level Comparison</h2>
                </div>
              </div>

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

            <CompareTacticalProfileSection leftMetrics={leftMetrics} rightMetrics={rightMetrics} />
            <CompareRoleFitSection leftMetrics={leftMetrics} rightMetrics={rightMetrics} />
            <CompareStatsSection groups={comparisonGroups} leftPlayer={compareState.player1} rightPlayer={compareState.player2} />
          </>
        ) : null}
      </div>
    </main>
  );
}
