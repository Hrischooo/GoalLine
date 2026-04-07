import { useEffect, useMemo, useState } from 'react';
import ClubBadge from './ClubBadge';
import LeagueBadge from './LeagueBadge';
import OvrInlineValue from './OvrInlineValue';
import PlayerHoverPreview from './PlayerHoverPreview';
import PlayerTextBlock from './PlayerTextBlock';
import { computeDisplayMetrics, formatStatValue, formatTextValue, toNumber } from '../utils/playerMetrics';
import { buildPlayerKey, getLeagueFilterValue, getLeagueName } from '../utils/dataset';
import { getDiscoveryPreviewMetrics } from '../utils/playerViews';

const INITIAL_VISIBLE_PLAYERS = 24;
const LOAD_MORE_PLAYERS = 24;

const POSITION_OPTIONS = [
  { value: 'goalkeeper', label: 'GK' },
  { value: 'defender', label: 'DF' },
  { value: 'midfielder', label: 'MF' },
  { value: 'forward', label: 'FW' }
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'goals', label: 'Goals' },
  { value: 'assists', label: 'Assists' },
  { value: 'xg_diff', label: 'xG Diff' },
  { value: 'key_pass_eff', label: 'Key Pass Eff.' },
  { value: 'tackle_success', label: 'Tackle Success' }
];

function clampRange(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getMetricExtents(records, metricKey, source = 'advanced') {
  const values = records
    .map((record) => (source === 'advanced' ? toNumber(record.metrics.scoutingMetricMap?.[metricKey]?.value) : toNumber(record.player?.[metricKey])))
    .filter((value) => Number.isFinite(value));

  if (!values.length) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

function getSortValue(record, sortBy) {
  switch (sortBy) {
    case 'goals':
      return toNumber(record.player.goals);
    case 'assists':
      return toNumber(record.player.assists);
    case 'xg_diff':
      return toNumber(record.metrics.scoutingMetricMap?.xg_diff?.value);
    case 'key_pass_eff':
      return toNumber(record.metrics.scoutingMetricMap?.key_pass_eff?.value);
    case 'tackle_success':
      return toNumber(record.metrics.scoutingMetricMap?.tackle_success?.value);
    case 'rating':
    default:
      return toNumber(record.metrics.finalOVR);
  }
}

function getDiscoveryMetricPercent(metrics, metricKey, fallbackValue) {
  const percentile = toNumber(metrics?.scoutingMetricMap?.[metricKey]?.percentile);

  if (percentile > 0) {
    return Math.max(16, Math.min(100, Math.round(percentile)));
  }

  const value = toNumber(fallbackValue);

  switch (metricKey) {
    case 'goals_p90':
      return Math.max(16, Math.min(100, Math.round(value * 68)));
    case 'interceptions':
      return Math.max(16, Math.min(100, Math.round(value * 10)));
    default:
      return Math.max(16, Math.min(100, Math.round(value)));
  }
}

function PlayerDiscoveryCard({ player, metrics, onNavigate }) {
  const previewMetrics = getDiscoveryPreviewMetrics(player, metrics).slice(0, 2);

  return (
    <button className="player-card player-card--interactive discovery-player-card" onClick={() => onNavigate(`/player/${buildPlayerKey(player)}`)} type="button">
      <div className="player-card__header">
        <PlayerHoverPreview metrics={metrics} player={player}>
          <div className="player-card__identity">
            <ClubBadge name={player.squad} size="medium" />
            <PlayerTextBlock
              club={player.squad}
              league={getLeagueName(player)}
              name={player.player}
              position={metrics.exactPosition}
              role={metrics.primaryTacticalRoleLabel}
            />
          </div>
        </PlayerHoverPreview>

        <div className="discovery-player-card__badges">
          <LeagueBadge name={getLeagueName(player)} size="small" />
          <div className="discovery-player-card__ovr">
            <OvrInlineValue metrics={metrics} value={metrics.finalOVR} />
          </div>
        </div>
      </div>

      <div className="discovery-player-card__meta">
        <span>{formatTextValue(player.nation)}</span>
        <span>Age {formatTextValue(player.age)}</span>
        <span>{metrics.playerArchetype}</span>
      </div>

      <div className="discovery-player-card__stats-panel">
        {previewMetrics.map((metric) => (
          <div className="discovery-player-card__metric" key={metric.key}>
            <div className="discovery-player-card__metric-row">
              <span>{metric.label}</span>
              <strong className={metric.tone}>{metric.formattedValue}</strong>
            </div>
            <div className="discovery-player-card__metric-track">
              <div
                className={`discovery-player-card__metric-fill ${metric.tone}`}
                style={{ width: `${getDiscoveryMetricPercent(metrics, metric.key, metric.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="player-card__footer">
        <span>{metrics.positionFamilyLabel}</span>
        <strong>{formatTextValue(player.season)}</strong>
      </div>
    </button>
  );
}

export default function PlayerDiscoverySection({ players, ratingIndex, onNavigate }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PLAYERS);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedClub, setSelectedClub] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const discoveryRecords = useMemo(
    () =>
      (players || []).map((player) => {
        const metrics = computeDisplayMetrics(player, ratingIndex);

        return {
          player,
          metrics,
          leagueId: getLeagueFilterValue(player),
          leagueName: getLeagueName(player),
          club: player.squad || '',
          age: toNumber(player.age)
        };
      }),
    [players, ratingIndex]
  );

  const ageExtent = useMemo(() => {
    const values = discoveryRecords.map((record) => record.age).filter((value) => Number.isFinite(value) && value > 0);

    if (!values.length) {
      return { min: 16, max: 40 };
    }

    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [discoveryRecords]);

  const xgDiffExtent = useMemo(() => getMetricExtents(discoveryRecords, 'xg_diff'), [discoveryRecords]);
  const keyPassEffExtent = useMemo(() => getMetricExtents(discoveryRecords, 'key_pass_eff'), [discoveryRecords]);
  const tackleSuccessExtent = useMemo(() => getMetricExtents(discoveryRecords, 'tackle_success'), [discoveryRecords]);

  const [filterState, setFilterState] = useState({
    ageMin: ageExtent.min,
    ageMax: ageExtent.max,
    goalsP90Min: 0,
    assistsP90Min: 0,
    xgDiffMin: xgDiffExtent.min,
    keyPassEffMin: keyPassEffExtent.min,
    tackleSuccessMin: tackleSuccessExtent.min
  });

  useEffect(() => {
    setFilterState({
      ageMin: ageExtent.min,
      ageMax: ageExtent.max,
      goalsP90Min: 0,
      assistsP90Min: 0,
      xgDiffMin: xgDiffExtent.min,
      keyPassEffMin: keyPassEffExtent.min,
      tackleSuccessMin: tackleSuccessExtent.min
    });
  }, [ageExtent.max, ageExtent.min, keyPassEffExtent.min, tackleSuccessExtent.min, xgDiffExtent.min]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_PLAYERS);
  }, [filterState, selectedClub, selectedLeagues, selectedPositions, sortBy]);

  const leagueOptions = useMemo(
    () =>
      Array.from(new Map(discoveryRecords.map((record) => [record.leagueId, { value: record.leagueId, label: record.leagueName }])).values()).sort((left, right) =>
        left.label.localeCompare(right.label)
      ),
    [discoveryRecords]
  );

  const clubOptions = useMemo(() => {
    const clubs = discoveryRecords
      .filter((record) => !selectedLeagues.length || selectedLeagues.includes(record.leagueId))
      .map((record) => record.club)
      .filter(Boolean);

    return Array.from(new Set(clubs)).sort((left, right) => left.localeCompare(right));
  }, [discoveryRecords, selectedLeagues]);

  const filteredRecords = useMemo(() => {
    return discoveryRecords
      .filter((record) => {
        if (selectedLeagues.length && !selectedLeagues.includes(record.leagueId)) {
          return false;
        }

        if (selectedPositions.length && !selectedPositions.includes(record.metrics.positionFamily)) {
          return false;
        }

        if (selectedClub !== 'all' && record.club !== selectedClub) {
          return false;
        }

        if (record.age < filterState.ageMin || record.age > filterState.ageMax) {
          return false;
        }

        if (toNumber(record.player.goals_p90) < filterState.goalsP90Min) {
          return false;
        }

        if (toNumber(record.player.assists_p90) < filterState.assistsP90Min) {
          return false;
        }

        if (toNumber(record.metrics.scoutingMetricMap?.xg_diff?.value) < filterState.xgDiffMin) {
          return false;
        }

        if (toNumber(record.metrics.scoutingMetricMap?.key_pass_eff?.value) < filterState.keyPassEffMin) {
          return false;
        }

        if (toNumber(record.metrics.scoutingMetricMap?.tackle_success?.value) < filterState.tackleSuccessMin) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        const sortDiff = getSortValue(right, sortBy) - getSortValue(left, sortBy);

        if (sortDiff !== 0) {
          return sortDiff;
        }

        return String(left.player.player || '').localeCompare(String(right.player.player || ''));
      });
  }, [discoveryRecords, filterState, selectedClub, selectedLeagues, selectedPositions, sortBy]);

  const visibleRecords = useMemo(() => filteredRecords.slice(0, visibleCount), [filteredRecords, visibleCount]);

  function toggleLeague(leagueId) {
    setSelectedLeagues((current) => (current.includes(leagueId) ? current.filter((value) => value !== leagueId) : [...current, leagueId]));
  }

  function togglePosition(positionValue) {
    setSelectedPositions((current) =>
      current.includes(positionValue) ? current.filter((value) => value !== positionValue) : [...current, positionValue]
    );
  }

  function updateFilterValue(key, value) {
    setFilterState((current) => ({
      ...current,
      [key]: value
    }));
  }

  return (
    <section className="browser-section home-discovery-section" id="players">
      <div className="section-heading section-heading--discovery">
        <div>
          <p className="home-kicker">Explore Players</p>
          <h2>Scout The Full Database</h2>
          <p className="home-subtitle">Filter across leagues, roles, and advanced indicators without leaving the home page.</p>
        </div>

        <div className="home-discovery-section__actions">
          <button className="secondary-button discovery-filters-toggle" onClick={() => setIsMobileFiltersOpen((current) => !current)} type="button">
            {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button className="secondary-button" type="button" onClick={() => onNavigate('/compare')}>
            Compare two players
          </button>
        </div>
      </div>

      <div className="discovery-layout">
        <aside className={`discovery-sidebar${isMobileFiltersOpen ? ' discovery-sidebar--open' : ''}`}>
          <div className="discovery-sidebar__section">
            <div className="discovery-sidebar__heading">
              <h3>Basic Filters</h3>
            </div>

            <div className="discovery-filter">
              <span>League</span>
              <div className="discovery-filter__chips">
                {leagueOptions.map((option) => (
                  <button
                    className={`discovery-chip${selectedLeagues.includes(option.value) ? ' discovery-chip--active' : ''}`}
                    key={option.value}
                    onClick={() => toggleLeague(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="discovery-filter">
              <span>Position</span>
              <div className="discovery-filter__chips">
                {POSITION_OPTIONS.map((option) => (
                  <button
                    className={`discovery-chip${selectedPositions.includes(option.value) ? ' discovery-chip--active' : ''}`}
                    key={option.value}
                    onClick={() => togglePosition(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="discovery-filter">
              <span>Club</span>
              <select className="discovery-select" onChange={(event) => setSelectedClub(event.target.value)} value={selectedClub}>
                <option value="all">All Clubs</option>
                {clubOptions.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
            </label>

            <div className="discovery-filter">
              <span>
                Age Range: {filterState.ageMin} - {filterState.ageMax}
              </span>
              <input
                className="discovery-range"
                max={ageExtent.max}
                min={ageExtent.min}
                onChange={(event) =>
                  updateFilterValue('ageMin', clampRange(Number(event.target.value), ageExtent.min, filterState.ageMax))
                }
                type="range"
                value={filterState.ageMin}
              />
              <input
                className="discovery-range"
                max={ageExtent.max}
                min={ageExtent.min}
                onChange={(event) =>
                  updateFilterValue('ageMax', clampRange(Number(event.target.value), filterState.ageMin, ageExtent.max))
                }
                type="range"
                value={filterState.ageMax}
              />
            </div>
          </div>

          <div className="discovery-sidebar__section">
            <div className="discovery-sidebar__heading">
              <h3>Advanced Filters</h3>
            </div>

            <label className="discovery-filter">
              <span>Goals P90 Min: {formatStatValue(filterState.goalsP90Min)}</span>
              <input
                className="discovery-range"
                max={2}
                min={0}
                onChange={(event) => updateFilterValue('goalsP90Min', Number(event.target.value))}
                step={0.05}
                type="range"
                value={filterState.goalsP90Min}
              />
            </label>

            <label className="discovery-filter">
              <span>Assists P90 Min: {formatStatValue(filterState.assistsP90Min)}</span>
              <input
                className="discovery-range"
                max={1.5}
                min={0}
                onChange={(event) => updateFilterValue('assistsP90Min', Number(event.target.value))}
                step={0.05}
                type="range"
                value={filterState.assistsP90Min}
              />
            </label>

            <label className="discovery-filter">
              <span>xG Diff Min: {formatStatValue(filterState.xgDiffMin)}</span>
              <input
                className="discovery-range"
                max={Math.max(3, xgDiffExtent.max)}
                min={Math.min(-3, xgDiffExtent.min)}
                onChange={(event) => updateFilterValue('xgDiffMin', Number(event.target.value))}
                step={0.1}
                type="range"
                value={filterState.xgDiffMin}
              />
            </label>

            <label className="discovery-filter">
              <span>Key Pass Eff. Min: {formatStatValue(filterState.keyPassEffMin)}%</span>
              <input
                className="discovery-range"
                max={Math.max(100, keyPassEffExtent.max)}
                min={Math.min(0, keyPassEffExtent.min)}
                onChange={(event) => updateFilterValue('keyPassEffMin', Number(event.target.value))}
                step={1}
                type="range"
                value={filterState.keyPassEffMin}
              />
            </label>

            <label className="discovery-filter">
              <span>Tackle Success Min: {formatStatValue(filterState.tackleSuccessMin)}%</span>
              <input
                className="discovery-range"
                max={100}
                min={0}
                onChange={(event) => updateFilterValue('tackleSuccessMin', Number(event.target.value))}
                step={1}
                type="range"
                value={filterState.tackleSuccessMin}
              />
            </label>
          </div>
        </aside>

        <div className="discovery-results">
          <div className="discovery-results__toolbar">
            <span>
              Showing {visibleRecords.length} of {filteredRecords.length} players
            </span>

            <label className="discovery-sort">
              <span>Sort by</span>
              <select className="discovery-select" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="players-grid discovery-grid">
            {visibleRecords.map((record) => (
              <PlayerDiscoveryCard key={buildPlayerKey(record.player)} metrics={record.metrics} onNavigate={onNavigate} player={record.player} />
            ))}
          </section>

          {!filteredRecords.length ? <p className="message">No players match the current scouting filters.</p> : null}

          {visibleRecords.length < filteredRecords.length ? (
            <div className="browser-footer">
              <span>Load more scouting cards</span>
              <button
                className="secondary-button"
                onClick={() => setVisibleCount((current) => Math.min(current + LOAD_MORE_PLAYERS, filteredRecords.length))}
                type="button"
              >
                Load more players
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
