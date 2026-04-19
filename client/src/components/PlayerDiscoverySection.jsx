import { useEffect, useMemo, useState } from 'react';
import ClubBadge from './ClubBadge';
import LeagueBadge from './LeagueBadge';
import OvrInlineValue from './OvrInlineValue';
import PlayerHoverPreview from './PlayerHoverPreview';
import PlayerTextBlock from './PlayerTextBlock';
import {
  DISCOVERY_METRIC_DEFINITIONS,
  DISCOVERY_SORT_OPTIONS,
  EXACT_POSITION_OPTIONS,
  RELIABILITY_OPTIONS,
  RELIABILITY_RANK,
  SCOUT_PRESETS,
  TACTICAL_CATEGORY_FILTERS,
  getDefaultMetricGroup,
  getMetricGroupsForPositions,
  getRoleGroupsForPositions
} from '../utils/scoutFiltersConfig';
import { buildPlayerKey, getLeagueFilterValue, getLeagueName } from '../utils/dataset';
import { computeDisplayMetrics, formatStatValue, formatTextValue, toNumber } from '../utils/playerMetrics';
import { getDiscoveryPreviewMetrics } from '../utils/playerViews';

const INITIAL_VISIBLE_PLAYERS = 24;
const LOAD_MORE_PLAYERS = 24;

function clampRange(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getExtent(values, fallback) {
  const numericValues = values.filter((value) => Number.isFinite(value));

  if (!numericValues.length) {
    return fallback;
  }

  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues)
  };
}

function formatSliderValue(value, format = 'decimal') {
  if (format === 'integer') {
    return String(Math.round(toNumber(value)));
  }

  if (format === 'pct') {
    return `${formatStatValue(value)}%`;
  }

  return formatStatValue(value);
}

function formatMinutes(value) {
  return `${Math.round(toNumber(value)).toLocaleString()} mins`;
}

function hasMeaningfulDifference(left, right) {
  return Math.abs(toNumber(left) - toNumber(right)) > 0.001;
}

function createDefaultFilters(extents) {
  return {
    leagues: [],
    positions: [],
    club: 'all',
    reliability: 'all',
    primaryRole: 'all',
    secondaryRole: 'all',
    archetype: 'all',
    ageMin: extents.age.min,
    ageMax: extents.age.max,
    ovrMin: extents.ovr.min,
    ovrMax: extents.ovr.max,
    minutesMin: extents.minutes.min,
    minutesMax: extents.minutes.max,
    attackMin: 0,
    creativityMin: 0,
    possessionMin: 0,
    defendingMin: 0,
    metricThresholds: Object.fromEntries(
      DISCOVERY_METRIC_DEFINITIONS.map((metric) => [
        metric.key,
        metric.mode === 'max' ? extents.metrics[metric.key].max : extents.metrics[metric.key].min
      ])
    )
  };
}

function matchesDiscoveryFilters(record, filters, defaultMetricThresholds) {
  if (filters.leagues.length && !filters.leagues.includes(record.leagueId)) {
    return false;
  }

  if (filters.positions.length && !filters.positions.includes(record.positionModel)) {
    return false;
  }

  if (filters.club !== 'all' && record.club !== filters.club) {
    return false;
  }

  if (filters.primaryRole !== 'all' && record.primaryRole !== filters.primaryRole) {
    return false;
  }

  if (filters.secondaryRole !== 'all' && record.secondaryRole !== filters.secondaryRole) {
    return false;
  }

  if (filters.archetype !== 'all' && record.archetype !== filters.archetype) {
    return false;
  }

  if (filters.reliability !== 'all' && record.reliabilityRank < RELIABILITY_RANK[filters.reliability]) {
    return false;
  }

  if (record.age && (record.age < filters.ageMin || record.age > filters.ageMax)) {
    return false;
  }

  if (record.ovr < filters.ovrMin || record.ovr > filters.ovrMax) {
    return false;
  }

  if (record.minutes < filters.minutesMin || record.minutes > filters.minutesMax) {
    return false;
  }

  if (record.attackScore < filters.attackMin) {
    return false;
  }

  if (record.creativityScore < filters.creativityMin) {
    return false;
  }

  if (record.possessionScore < filters.possessionMin) {
    return false;
  }

  if (record.defendingScore < filters.defendingMin) {
    return false;
  }

  for (const definition of DISCOVERY_METRIC_DEFINITIONS) {
    const currentValue = filters.metricThresholds[definition.key];
    const defaultValue = defaultMetricThresholds[definition.key];

    if (!hasMeaningfulDifference(currentValue, defaultValue)) {
      continue;
    }

    const metricValue = record.metricValues[definition.key];

    if (!Number.isFinite(metricValue)) {
      return false;
    }

    if (definition.mode === 'max') {
      if (metricValue > currentValue) {
        return false;
      }
    } else if (metricValue < currentValue) {
      return false;
    }
  }

  return true;
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
              position={metrics.positionModel}
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
        <span>{formatMinutes(metrics.minutesPlayed)}</span>
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
        <span>{metrics.reliabilityLabel} sample</span>
        <strong>{formatTextValue(player.season)}</strong>
      </div>
    </button>
  );
}

function FilterSection({ activeCount, children, description, isOpen, onToggle, title }) {
  return (
    <section className="discovery-sidebar__section discovery-sidebar__section--collapsible">
      <button
        aria-expanded={isOpen}
        className={`discovery-section-toggle${isOpen ? ' discovery-section-toggle--open' : ''}`}
        onClick={onToggle}
        type="button"
      >
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        <span>{activeCount ? `${activeCount} active` : isOpen ? 'Hide' : 'Show'}</span>
      </button>
      {isOpen ? <div className="discovery-section-body">{children}</div> : null}
    </section>
  );
}

function DualRangeFilter({ format = 'decimal', label, max, min, onMaxChange, onMinChange, valueMax, valueMin }) {
  const isActive = hasMeaningfulDifference(valueMin, min) || hasMeaningfulDifference(valueMax, max);
  const summary = isActive ? `${formatSliderValue(valueMin, format)} - ${formatSliderValue(valueMax, format)}` : 'Any';

  return (
    <div className="discovery-filter">
      <span>
        {label}: {summary}
      </span>
      <div className="discovery-range-pair">
        <input className="discovery-range" max={max} min={min} onChange={onMinChange} type="range" value={valueMin} />
        <input className="discovery-range" max={max} min={min} onChange={onMaxChange} type="range" value={valueMax} />
      </div>
    </div>
  );
}

function ThresholdSlider({ definition, extent, onChange, value }) {
  const defaultValue = definition.mode === 'max' ? extent.max : extent.min;
  const isActive = hasMeaningfulDifference(value, defaultValue);
  const prefix = definition.mode === 'max' ? 'Max' : 'Min';

  return (
    <label className="discovery-filter discovery-filter--metric">
      <span>
        {definition.label}: {isActive ? `${prefix} ${formatSliderValue(value, definition.format)}` : 'Any'}
      </span>
      <input
        className="discovery-range"
        max={extent.max}
        min={extent.min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={definition.step || 1}
        type="range"
        value={value}
      />
    </label>
  );
}

export default function PlayerDiscoverySection({ players, ratingIndex, onNavigate }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PLAYERS);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [activePresetId, setActivePresetId] = useState(null);
  const [openSections, setOpenSections] = useState({
    presets: true,
    basic: true,
    tactical: true,
    advanced: false
  });
  const [activeMetricGroup, setActiveMetricGroup] = useState(getDefaultMetricGroup());

  const discoveryRecords = useMemo(
    () =>
      (players || []).map((player) => {
        const metrics = computeDisplayMetrics(player, ratingIndex);
        const metricValues = Object.fromEntries(
          DISCOVERY_METRIC_DEFINITIONS.map((definition) => [definition.key, definition.valueGetter(player, metrics)])
        );

        return {
          player,
          metrics,
          metricValues,
          leagueId: getLeagueFilterValue(player),
          leagueName: getLeagueName(player),
          club: player.squad || '',
          age: toNumber(player.age),
          ovr: toNumber(metrics.finalOVR),
          minutes: toNumber(metrics.minutesPlayed),
          reliabilityLabel: metrics.reliabilityLabel,
          reliabilityRank: RELIABILITY_RANK[metrics.reliabilityLabel] || 0,
          positionModel: metrics.positionModel,
          primaryRole: metrics.primaryTacticalRoleLabel,
          secondaryRole: metrics.secondaryTacticalRoleLabel,
          archetype: metrics.playerArchetype,
          attackScore: toNumber(metrics.attackScore),
          creativityScore: toNumber(metrics.creativityScore),
          possessionScore: toNumber(metrics.possessionScore),
          defendingScore: toNumber(metrics.defendingScore)
        };
      }),
    [players, ratingIndex]
  );

  const ageExtent = useMemo(() => getExtent(discoveryRecords.map((record) => record.age).filter((value) => value > 0), { min: 16, max: 40 }), [discoveryRecords]);
  const ovrExtent = useMemo(() => getExtent(discoveryRecords.map((record) => record.ovr).filter((value) => value > 0), { min: 45, max: 95 }), [discoveryRecords]);
  const minutesExtent = useMemo(() => getExtent(discoveryRecords.map((record) => record.minutes).filter((value) => value >= 0), { min: 0, max: 3200 }), [discoveryRecords]);
  const metricExtents = useMemo(
    () =>
      Object.fromEntries(
        DISCOVERY_METRIC_DEFINITIONS.map((definition) => [
          definition.key,
          getExtent(
            discoveryRecords.map((record) => record.metricValues[definition.key]).filter((value) => Number.isFinite(value)),
            definition.fallback
          )
        ])
      ),
    [discoveryRecords]
  );

  const defaultFilters = useMemo(
    () =>
      createDefaultFilters({
        age: ageExtent,
        ovr: ovrExtent,
        minutes: minutesExtent,
        metrics: metricExtents
      }),
    [ageExtent, metricExtents, minutesExtent, ovrExtent]
  );

  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    setFilters(defaultFilters);
    setActivePresetId(null);
  }, [defaultFilters]);

  const availableMetricGroups = useMemo(() => getMetricGroupsForPositions(filters.positions), [filters.positions]);

  useEffect(() => {
    const nextDefaultMetricGroup = availableMetricGroups[0]?.key || getDefaultMetricGroup();
    setActiveMetricGroup((current) => (availableMetricGroups.some((group) => group.key === current) ? current : nextDefaultMetricGroup));
  }, [availableMetricGroups]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_PLAYERS);
  }, [filters, sortBy]);

  const leagueOptions = useMemo(
    () =>
      Array.from(new Map(discoveryRecords.map((record) => [record.leagueId, { value: record.leagueId, label: record.leagueName }])).values()).sort((left, right) =>
        left.label.localeCompare(right.label)
      ),
    [discoveryRecords]
  );

  const leagueScopedRecords = useMemo(
    () =>
      discoveryRecords.filter((record) => {
        if (filters.leagues.length && !filters.leagues.includes(record.leagueId)) {
          return false;
        }

        return true;
      }),
    [discoveryRecords, filters.leagues]
  );

  const marketScopedRecords = useMemo(
    () =>
      leagueScopedRecords.filter((record) => {
        if (filters.club !== 'all' && record.club !== filters.club) {
          return false;
        }

        return true;
      }),
    [filters.club, leagueScopedRecords]
  );

  const roleScopedRecords = useMemo(
    () =>
      marketScopedRecords.filter((record) => {
        if (filters.positions.length && !filters.positions.includes(record.positionModel)) {
          return false;
        }

        return true;
      }),
    [filters.positions, marketScopedRecords]
  );

  const clubOptions = useMemo(() => {
    const clubs = leagueScopedRecords.map((record) => record.club).filter(Boolean);
    return Array.from(new Set(clubs)).sort((left, right) => left.localeCompare(right));
  }, [leagueScopedRecords]);

  const positionCounts = useMemo(
    () =>
      marketScopedRecords.reduce((counts, record) => {
        counts[record.positionModel] = (counts[record.positionModel] || 0) + 1;
        return counts;
      }, {}),
    [marketScopedRecords]
  );

  const roleGroups = useMemo(
    () =>
      getRoleGroupsForPositions(filters.positions)
        .map((group) => {
          const groupRecords = roleScopedRecords.filter((record) => record.positionModel === group.positionModel);
          const primaryCounts = groupRecords.reduce((counts, record) => {
            if (record.primaryRole && record.primaryRole !== '-') {
              counts[record.primaryRole] = (counts[record.primaryRole] || 0) + 1;
            }

            return counts;
          }, {});
          const secondaryCounts = groupRecords.reduce((counts, record) => {
            if (record.secondaryRole && record.secondaryRole !== '-') {
              counts[record.secondaryRole] = (counts[record.secondaryRole] || 0) + 1;
            }

            return counts;
          }, {});

          return {
            ...group,
            primaryOptions: group.roles.filter((role) => primaryCounts[role.label] || !groupRecords.length).map((role) => ({
              ...role,
              count: primaryCounts[role.label] || 0
            })),
            secondaryOptions: group.roles.filter((role) => secondaryCounts[role.label] || !groupRecords.length).map((role) => ({
              ...role,
              count: secondaryCounts[role.label] || 0
            }))
          };
        })
        .filter((group) => group.primaryOptions.length || group.secondaryOptions.length),
    [filters.positions, roleScopedRecords]
  );

  const primaryRoleLabels = useMemo(
    () => new Set(roleGroups.flatMap((group) => group.primaryOptions.map((role) => role.label))),
    [roleGroups]
  );
  const secondaryRoleLabels = useMemo(
    () => new Set(roleGroups.flatMap((group) => group.secondaryOptions.map((role) => role.label))),
    [roleGroups]
  );
  const archetypeOptions = useMemo(
    () => Array.from(new Set(roleScopedRecords.map((record) => record.archetype).filter(Boolean))).sort((left, right) => left.localeCompare(right)),
    [roleScopedRecords]
  );

  useEffect(() => {
    if (filters.club !== 'all' && !clubOptions.includes(filters.club)) {
      setFilters((current) => ({ ...current, club: 'all' }));
      setActivePresetId(null);
    }
  }, [clubOptions, filters.club]);

  useEffect(() => {
    if (filters.primaryRole !== 'all' && !primaryRoleLabels.has(filters.primaryRole)) {
      setFilters((current) => ({ ...current, primaryRole: 'all' }));
      setActivePresetId(null);
    }
  }, [filters.primaryRole, primaryRoleLabels]);

  useEffect(() => {
    if (filters.secondaryRole !== 'all' && !secondaryRoleLabels.has(filters.secondaryRole)) {
      setFilters((current) => ({ ...current, secondaryRole: 'all' }));
      setActivePresetId(null);
    }
  }, [filters.secondaryRole, secondaryRoleLabels]);

  useEffect(() => {
    if (filters.archetype !== 'all' && !archetypeOptions.includes(filters.archetype)) {
      setFilters((current) => ({ ...current, archetype: 'all' }));
      setActivePresetId(null);
    }
  }, [archetypeOptions, filters.archetype]);

  function clearPresetAndUpdate(updater) {
    setActivePresetId(null);
    setFilters((current) => updater(current));
  }

  function toggleLeague(leagueId) {
    clearPresetAndUpdate((current) => ({
      ...current,
      leagues: current.leagues.includes(leagueId) ? current.leagues.filter((value) => value !== leagueId) : [...current.leagues, leagueId]
    }));
  }

  function togglePosition(positionModel) {
    clearPresetAndUpdate((current) => ({
      ...current,
      positions: current.positions.includes(positionModel)
        ? current.positions.filter((value) => value !== positionModel)
        : [...current.positions, positionModel]
    }));
  }

  function updateFilter(key, value) {
    clearPresetAndUpdate((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updateMetricThreshold(metricKey, value) {
    clearPresetAndUpdate((current) => ({
      ...current,
      metricThresholds: {
        ...current.metricThresholds,
        [metricKey]: value
      }
    }));
  }

  function resetFilters() {
    setFilters(defaultFilters);
    setActivePresetId(null);
  }

  function toggleSection(sectionKey) {
    setOpenSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey]
    }));
  }

  function applyPreset(preset) {
    if (activePresetId === preset.id) {
      resetFilters();
      return;
    }

    function buildPresetCandidate({ clearMetrics = false, floorDrop = 0, loosenIdentity = false, ratioDrop = 0 }) {
      const nextMetricThresholds = { ...defaultFilters.metricThresholds };

      if (!clearMetrics) {
        Object.entries(preset.filters.metricFloorRatios || {}).forEach(([metricKey, ratio]) => {
          const extent = metricExtents[metricKey];

          if (!extent) {
            return;
          }

          const span = extent.max - extent.min;
          const relaxedRatio = Math.max(0, ratio - ratioDrop);
          nextMetricThresholds[metricKey] = span > 0 ? Number((extent.min + span * relaxedRatio).toFixed(2)) : extent.max;
        });
      }

      const relaxFloor = (value) => Math.max(0, (value || 0) - floorDrop);

      return {
        ...defaultFilters,
        positions: preset.filters.positions || [],
        primaryRole: loosenIdentity ? 'all' : preset.filters.primaryRole || 'all',
        secondaryRole: loosenIdentity ? 'all' : preset.filters.secondaryRole || 'all',
        archetype: loosenIdentity ? 'all' : preset.filters.archetype || 'all',
        attackMin: clearMetrics ? 0 : relaxFloor(preset.filters.attackMin),
        creativityMin: clearMetrics ? 0 : relaxFloor(preset.filters.creativityMin),
        possessionMin: clearMetrics ? 0 : relaxFloor(preset.filters.possessionMin),
        defendingMin: clearMetrics ? 0 : relaxFloor(preset.filters.defendingMin),
        metricThresholds: nextMetricThresholds
      };
    }

    const presetStages = [
      { floorDrop: 0, ratioDrop: 0, loosenIdentity: false },
      { floorDrop: 6, ratioDrop: 0.08, loosenIdentity: false },
      { floorDrop: 12, ratioDrop: 0.16, loosenIdentity: true },
      { floorDrop: 18, ratioDrop: 0.24, loosenIdentity: true },
      { clearMetrics: true, floorDrop: 100, ratioDrop: 1, loosenIdentity: true }
    ];

    const stagedCandidates = presetStages.map((stage) => {
      const candidateFilters = buildPresetCandidate(stage);
      const count = discoveryRecords.filter((record) => matchesDiscoveryFilters(record, candidateFilters, defaultFilters.metricThresholds)).length;

      return {
        candidateFilters,
        count
      };
    });

    const resolvedPreset =
      stagedCandidates.find((stage) => stage.count >= 8) ||
      stagedCandidates.find((stage) => stage.count > 0) ||
      stagedCandidates[stagedCandidates.length - 1];

    setFilters(resolvedPreset.candidateFilters);

    setActivePresetId(preset.id);
    setActiveMetricGroup(getDefaultMetricGroup(preset.filters.positions || []));
    setOpenSections((current) => ({
      ...current,
      advanced: true,
      tactical: true
    }));
  }

  const sortDefinition = useMemo(
    () => DISCOVERY_SORT_OPTIONS.find((option) => option.value === sortBy) || DISCOVERY_SORT_OPTIONS[0],
    [sortBy]
  );

  const filteredRecords = useMemo(
    () =>
      discoveryRecords
        .filter((record) => matchesDiscoveryFilters(record, filters, defaultFilters.metricThresholds))
        .sort((left, right) => {
          const sortDiff = sortDefinition.getValue(right) - sortDefinition.getValue(left);

          if (sortDiff !== 0) {
            return sortDiff;
          }

          return String(left.player.player || '').localeCompare(String(right.player.player || ''));
        }),
    [defaultFilters.metricThresholds, discoveryRecords, filters, sortDefinition]
  );

  const visibleRecords = useMemo(() => filteredRecords.slice(0, visibleCount), [filteredRecords, visibleCount]);

  const basicActiveCount = useMemo(() => {
    let count = 0;

    if (filters.leagues.length) {
      count += 1;
    }

    if (filters.positions.length) {
      count += 1;
    }

    if (filters.club !== 'all') {
      count += 1;
    }

    if (filters.reliability !== 'all') {
      count += 1;
    }

    if (hasMeaningfulDifference(filters.ageMin, defaultFilters.ageMin) || hasMeaningfulDifference(filters.ageMax, defaultFilters.ageMax)) {
      count += 1;
    }

    if (hasMeaningfulDifference(filters.ovrMin, defaultFilters.ovrMin) || hasMeaningfulDifference(filters.ovrMax, defaultFilters.ovrMax)) {
      count += 1;
    }

    if (
      hasMeaningfulDifference(filters.minutesMin, defaultFilters.minutesMin) ||
      hasMeaningfulDifference(filters.minutesMax, defaultFilters.minutesMax)
    ) {
      count += 1;
    }

    return count;
  }, [defaultFilters.ageMax, defaultFilters.ageMin, defaultFilters.minutesMax, defaultFilters.minutesMin, defaultFilters.ovrMax, defaultFilters.ovrMin, filters]);

  const tacticalActiveCount = useMemo(() => {
    let count = 0;

    if (filters.primaryRole !== 'all') {
      count += 1;
    }

    if (filters.secondaryRole !== 'all') {
      count += 1;
    }

    if (filters.archetype !== 'all') {
      count += 1;
    }

    if (filters.attackMin > 0) {
      count += 1;
    }

    if (filters.creativityMin > 0) {
      count += 1;
    }

    if (filters.possessionMin > 0) {
      count += 1;
    }

    if (filters.defendingMin > 0) {
      count += 1;
    }

    return count;
  }, [filters]);

  const advancedActiveCount = useMemo(
    () =>
      DISCOVERY_METRIC_DEFINITIONS.reduce((count, definition) => {
        const currentValue = filters.metricThresholds[definition.key];
        const defaultValue = defaultFilters.metricThresholds[definition.key];
        return hasMeaningfulDifference(currentValue, defaultValue) ? count + 1 : count;
      }, 0),
    [defaultFilters.metricThresholds, filters.metricThresholds]
  );

  const totalActiveCount = basicActiveCount + tacticalActiveCount + advancedActiveCount + (activePresetId ? 1 : 0);
  const activeMetricDefinitions = availableMetricGroups.find((group) => group.key === activeMetricGroup)?.metrics || [];

  const summaryChips = useMemo(() => {
    const chips = [];

    if (activePresetId) {
      const preset = SCOUT_PRESETS.find((entry) => entry.id === activePresetId);

      if (preset) {
        chips.push(`Preset: ${preset.label}`);
      }
    }

    if (filters.leagues.length) {
      chips.push(
        `League: ${
          filters.leagues.length === 1 ? leagueOptions.find((option) => option.value === filters.leagues[0])?.label : `${filters.leagues.length} selected`
        }`
      );
    }

    if (filters.positions.length) {
      chips.push(`Position: ${filters.positions.join(', ')}`);
    }

    if (filters.club !== 'all') {
      chips.push(`Club: ${filters.club}`);
    }

    if (filters.primaryRole !== 'all') {
      chips.push(`Primary: ${filters.primaryRole}`);
    }

    if (filters.secondaryRole !== 'all') {
      chips.push(`Secondary: ${filters.secondaryRole}`);
    }

    if (filters.archetype !== 'all') {
      chips.push(`Archetype: ${filters.archetype}`);
    }

    if (filters.reliability !== 'all') {
      chips.push(`Reliability: ${filters.reliability}+`);
    }

    if (hasMeaningfulDifference(filters.ageMin, defaultFilters.ageMin) || hasMeaningfulDifference(filters.ageMax, defaultFilters.ageMax)) {
      chips.push(`Age: ${Math.round(filters.ageMin)}-${Math.round(filters.ageMax)}`);
    }

    if (hasMeaningfulDifference(filters.ovrMin, defaultFilters.ovrMin) || hasMeaningfulDifference(filters.ovrMax, defaultFilters.ovrMax)) {
      chips.push(`OVR: ${Math.round(filters.ovrMin)}-${Math.round(filters.ovrMax)}`);
    }

    if (hasMeaningfulDifference(filters.minutesMin, defaultFilters.minutesMin) || hasMeaningfulDifference(filters.minutesMax, defaultFilters.minutesMax)) {
      chips.push(`Minutes: ${Math.round(filters.minutesMin)}-${Math.round(filters.minutesMax)}`);
    }

    const categoryFloorCount =
      (filters.attackMin > 0 ? 1 : 0) +
      (filters.creativityMin > 0 ? 1 : 0) +
      (filters.possessionMin > 0 ? 1 : 0) +
      (filters.defendingMin > 0 ? 1 : 0);

    if (categoryFloorCount) {
      chips.push(`Profile floors: ${categoryFloorCount}`);
    }

    if (advancedActiveCount) {
      chips.push(`Advanced: ${advancedActiveCount}`);
    }

    return chips;
  }, [activePresetId, advancedActiveCount, defaultFilters.ageMax, defaultFilters.ageMin, defaultFilters.minutesMax, defaultFilters.minutesMin, defaultFilters.ovrMax, defaultFilters.ovrMin, filters, leagueOptions]);

  const visibleSummaryChips = summaryChips.slice(0, 8);
  const hiddenSummaryChipCount = Math.max(summaryChips.length - visibleSummaryChips.length, 0);

  return (
    <section className="browser-section home-discovery-section" id="players">
      <div className="section-heading section-heading--discovery">
        <div>
          <p className="home-kicker">Explore Players</p>
          <h2>Scout The Full Database</h2>
          <p className="home-subtitle">Search by exact position, tactical role, archetype, and advanced scouting output without bloating the page.</p>
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
          <div className="discovery-sidebar__summary">
            <strong>{totalActiveCount ? `${totalActiveCount} active filters` : 'Open-ended scouting search'}</strong>
            <button className="discovery-reset-button" onClick={resetFilters} type="button">
              Reset Filters
            </button>
          </div>

          <FilterSection
            activeCount={activePresetId ? 1 : 0}
            description="Quick role-aware shortcuts that prefill the tactical search."
            isOpen={openSections.presets}
            onToggle={() => toggleSection('presets')}
            title="Smart Presets"
          >
            <div className="discovery-filter__chips">
              {SCOUT_PRESETS.map((preset) => (
                <button
                  className={`discovery-chip${activePresetId === preset.id ? ' discovery-chip--active' : ''}`}
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  title={preset.description}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection
            activeCount={basicActiveCount}
            description="Market scope, sample size, and exact-position discovery."
            isOpen={openSections.basic}
            onToggle={() => toggleSection('basic')}
            title="Basic Filters"
          >
            <div className="discovery-filter">
              <span>League</span>
              <div className="discovery-filter__chips">
                {leagueOptions.map((option) => (
                  <button
                    className={`discovery-chip${filters.leagues.includes(option.value) ? ' discovery-chip--active' : ''}`}
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
              <span>Exact Position</span>
              <div className="discovery-filter__chips">
                {EXACT_POSITION_OPTIONS.map((option) => (
                  <button
                    className={`discovery-chip${filters.positions.includes(option.value) ? ' discovery-chip--active' : ''}`}
                    key={option.value}
                    onClick={() => togglePosition(option.value)}
                    type="button"
                  >
                    <span>{option.label}</span>
                    <small>{positionCounts[option.value] || 0}</small>
                  </button>
                ))}
              </div>
            </div>

            <label className="discovery-filter">
              <span>Club</span>
              <select className="discovery-select" onChange={(event) => updateFilter('club', event.target.value)} value={filters.club}>
                <option value="all">All Clubs</option>
                {clubOptions.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
            </label>

            <label className="discovery-filter">
              <span>Reliability</span>
              <select className="discovery-select" onChange={(event) => updateFilter('reliability', event.target.value)} value={filters.reliability}>
                {RELIABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <DualRangeFilter
              format="integer"
              label="Age"
              max={ageExtent.max}
              min={ageExtent.min}
              onMaxChange={(event) => updateFilter('ageMax', clampRange(Number(event.target.value), filters.ageMin, ageExtent.max))}
              onMinChange={(event) => updateFilter('ageMin', clampRange(Number(event.target.value), ageExtent.min, filters.ageMax))}
              valueMax={filters.ageMax}
              valueMin={filters.ageMin}
            />

            <DualRangeFilter
              format="integer"
              label="OVR"
              max={ovrExtent.max}
              min={ovrExtent.min}
              onMaxChange={(event) => updateFilter('ovrMax', clampRange(Number(event.target.value), filters.ovrMin, ovrExtent.max))}
              onMinChange={(event) => updateFilter('ovrMin', clampRange(Number(event.target.value), ovrExtent.min, filters.ovrMax))}
              valueMax={filters.ovrMax}
              valueMin={filters.ovrMin}
            />

            <DualRangeFilter
              format="integer"
              label="Minutes"
              max={minutesExtent.max}
              min={minutesExtent.min}
              onMaxChange={(event) => updateFilter('minutesMax', clampRange(Number(event.target.value), filters.minutesMin, minutesExtent.max))}
              onMinChange={(event) => updateFilter('minutesMin', clampRange(Number(event.target.value), minutesExtent.min, filters.minutesMax))}
              valueMax={filters.minutesMax}
              valueMin={filters.minutesMin}
            />
          </FilterSection>

          <FilterSection
            activeCount={tacticalActiveCount}
            description="Role-fit filters that stay aligned to the selected position lane."
            isOpen={openSections.tactical}
            onToggle={() => toggleSection('tactical')}
            title="Tactical Filters"
          >
            <label className="discovery-filter">
              <span>Primary Role</span>
              <select className="discovery-select" onChange={(event) => updateFilter('primaryRole', event.target.value)} value={filters.primaryRole}>
                <option value="all">Any Primary Role</option>
                {roleGroups.map((group) => (
                  <optgroup key={`primary-${group.positionModel}`} label={group.label}>
                    {group.primaryOptions.map((role) => (
                      <option key={role.key} value={role.label}>
                        {role.count ? `${role.label} (${role.count})` : role.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="discovery-filter">
              <span>Secondary Role</span>
              <select className="discovery-select" onChange={(event) => updateFilter('secondaryRole', event.target.value)} value={filters.secondaryRole}>
                <option value="all">Any Secondary Role</option>
                {roleGroups.map((group) => (
                  <optgroup key={`secondary-${group.positionModel}`} label={group.label}>
                    {group.secondaryOptions.map((role) => (
                      <option key={role.key} value={role.label}>
                        {role.count ? `${role.label} (${role.count})` : role.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="discovery-filter">
              <span>Archetype</span>
              <select className="discovery-select" onChange={(event) => updateFilter('archetype', event.target.value)} value={filters.archetype}>
                <option value="all">Any Archetype</option>
                {archetypeOptions.map((archetype) => (
                  <option key={archetype} value={archetype}>
                    {archetype}
                  </option>
                ))}
              </select>
            </label>

            <div className="discovery-filter">
              <span>Profile Floors</span>
              <div className="discovery-filter-grid">
                {TACTICAL_CATEGORY_FILTERS.map((definition) => (
                  <label className="discovery-filter discovery-filter--compact" key={definition.key}>
                    <span>
                      {definition.label}: {filters[definition.key] ? Math.round(filters[definition.key]) : 'Any'}
                    </span>
                    <input
                      className="discovery-range"
                      max={99}
                      min={0}
                      onChange={(event) => updateFilter(definition.key, Number(event.target.value))}
                      step={1}
                      type="range"
                      value={filters[definition.key]}
                    />
                  </label>
                ))}
              </div>
            </div>
          </FilterSection>

          <FilterSection
            activeCount={advancedActiveCount}
            description="Progressive disclosure for the strongest discovery metrics only."
            isOpen={openSections.advanced}
            onToggle={() => toggleSection('advanced')}
            title="Advanced Metrics"
          >
            <div className="discovery-metric-tabs">
              {availableMetricGroups.map((group) => (
                <button
                  className={`discovery-tab${activeMetricGroup === group.key ? ' discovery-tab--active' : ''}`}
                  key={group.key}
                  onClick={() => setActiveMetricGroup(group.key)}
                  type="button"
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="discovery-filter-grid">
              {activeMetricDefinitions.map((definition) => (
                <ThresholdSlider
                  definition={definition}
                  extent={metricExtents[definition.key]}
                  key={definition.key}
                  onChange={(value) => updateMetricThreshold(definition.key, value)}
                  value={filters.metricThresholds[definition.key]}
                />
              ))}
            </div>
          </FilterSection>
        </aside>

        <div className="discovery-results">
          <div className="discovery-results__toolbar">
            <div className="discovery-results__status">
              <strong>
                Showing {visibleRecords.length} of {filteredRecords.length} players
              </strong>
              {summaryChips.length ? (
                <div className="discovery-results__summary">
                  {visibleSummaryChips.map((chip) => (
                    <span className="discovery-summary-chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                  {hiddenSummaryChipCount ? <span className="discovery-summary-chip discovery-summary-chip--muted">+{hiddenSummaryChipCount} more</span> : null}
                </div>
              ) : (
                <p className="discovery-results__note">Use exact position chips, tactical roles, and presets to narrow the scouting pool.</p>
              )}
            </div>

            <label className="discovery-sort">
              <span>Sort by</span>
              <select className="discovery-select" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
                {DISCOVERY_SORT_OPTIONS.map((option) => (
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

          {!filteredRecords.length ? (
            <div className="discovery-empty-state">
              <p className="message">No players match the current scouting filters.</p>
              <button className="secondary-button" onClick={resetFilters} type="button">
                Reset filters
              </button>
            </div>
          ) : null}

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
