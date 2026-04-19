import { useEffect, useMemo, useState } from 'react';
import CompareHeader from '../components/CompareHeader';
import CompareFiltersPanel from '../components/CompareFiltersPanel';
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
import {
  RELIABILITY_OPTIONS,
  RELIABILITY_RANK,
  createDefaultPlayerCompareControls,
  createDefaultPlayerCompareFilters,
  createDefaultTeamCompareControls,
  createDefaultTeamCompareFilters,
  getCompareRoleGroups,
  getTeamGapSeverity,
  getTeamRoleCoverageQuality,
  getTeamStyleTags,
  TEAM_GAP_OPTIONS,
  TEAM_LINE_OPTIONS,
  TEAM_ROLE_COVERAGE_OPTIONS,
  TEAM_STYLE_OPTIONS
} from '../utils/compareFiltersConfig';
import { buildPlayerKey, getLeagueFilterValue, getLeagueName, getPlayerByIdOrUniqueKey } from '../utils/dataset';
import { computeDisplayMetrics, formatStatValue, toNumber } from '../utils/playerMetrics';
import { normalizeString } from '../utils/search';
import { buildTeamComparisonProfile } from '../utils/teamComparisonProfile';

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

function readFilterNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesMin(value, minimum) {
  const parsedMinimum = readFilterNumber(minimum);
  return parsedMinimum === null || (Number(value) || 0) >= parsedMinimum;
}

function matchesRange(value, minValue, maxValue) {
  const parsedMin = readFilterNumber(minValue);
  const parsedMax = readFilterNumber(maxValue);
  const numericValue = readFilterNumber(value);

  if (numericValue === null) {
    return parsedMin === null && parsedMax === null;
  }

  if (parsedMin !== null && numericValue < parsedMin) {
    return false;
  }

  if (parsedMax !== null && numericValue > parsedMax) {
    return false;
  }

  return true;
}

function matchesReliability(reliabilityLabel, filterValue) {
  if (filterValue === 'all') {
    return true;
  }

  return (RELIABILITY_RANK[reliabilityLabel] || 0) >= (RELIABILITY_RANK[filterValue] || 0);
}

function ensureSelectedOption(options = [], selectedValue, allOptions = []) {
  if (!selectedValue) {
    return options;
  }

  if (options.some((option) => option.id === selectedValue)) {
    return options;
  }

  const selectedOption = allOptions.find((option) => option.id === selectedValue);
  return selectedOption ? [selectedOption, ...options] : options;
}

function buildTeamOptions(teams = [], profileMap = new Map()) {
  return teams.map((team) => {
    const displayName = team.displayName || team.name;
    const profile = profileMap.get(team.id);
    const formation = profile?.identity?.preferredFormation || team.preferred_formation || team.detectedFormation || 'N/A';

    return {
      id: team.id,
      name: displayName,
      displayName,
      league: team.league || 'Unknown League',
      country: team.country || '',
      manager: team.manager || '',
      formation,
      preferredFormation: profile?.identity?.preferredFormation || formation,
      detectedFormation: profile?.identity?.detectedFormation || team.detectedFormation || formation,
      rating: Math.round(team.teamRating || team.avgRating || 0),
      bestXIRating: Math.round(profile?.strength?.bestXIRating || team.bestXI?.overallTeamRating || team.teamRating || team.avgRating || 0),
      depthScore: Math.round(profile?.strength?.depthScore || 0),
      benchStability: Math.round(profile?.strength?.benchStability || 0),
      strongestLine: profile?.identity?.strongestLine || 'Midfield',
      weakestLine: profile?.identity?.weakestLine || 'Midfield',
      styleTags: getTeamStyleTags(profile),
      gapSeverity: getTeamGapSeverity(profile),
      roleCoverageQuality: getTeamRoleCoverageQuality(profile),
      popularity: team.popularity || 0,
      profile,
      nameNormalized: normalizeString(displayName),
      nameTokens: normalizeString(displayName).split(' ').filter(Boolean),
      metadataFieldsNormalized: [team.league, team.country, team.manager, formation].map((value) => normalizeString(value)).filter(Boolean),
      searchTextNormalized: normalizeString([displayName, team.league, team.country, team.manager, formation].filter(Boolean).join(' '))
    };
  });
}

function buildRoleOptions(pool = [], type = 'primary', positionFilters = []) {
  const counts = new Map();
  const field = type === 'secondary' ? 'secondaryRoleLabel' : 'primaryRoleLabel';

  pool.forEach((record) => {
    const label = record[field];

    if (!label || label === '-') {
      return;
    }

    counts.set(label, (counts.get(label) || 0) + 1);
  });

  const groupedLabels = getCompareRoleGroups(positionFilters)
    .flatMap((group) => group.roles.map((role) => role.label))
    .filter((label, index, source) => source.indexOf(label) === index && counts.has(label));
  const ungroupedLabels = [...counts.keys()].filter((label) => !groupedLabels.includes(label)).sort((left, right) => left.localeCompare(right));
  const labels = [...groupedLabels, ...ungroupedLabels];

  return [
    { value: 'all', label: type === 'secondary' ? 'All secondary roles' : 'All primary roles' },
    ...labels.map((label) => ({
      value: label,
      label: `${label} (${counts.get(label)})`
    }))
  ];
}

function matchesPlayerFilters(record, filters) {
  if (filters.league !== 'all' && record.leagueId !== filters.league) {
    return false;
  }

  if (filters.club !== 'all' && record.clubKey !== filters.club) {
    return false;
  }

  if (filters.positions.length && !filters.positions.includes(record.positionModel)) {
    return false;
  }

  if (!matchesRange(record.age, filters.ageMin, filters.ageMax)) {
    return false;
  }

  if (!matchesRange(record.ovr, filters.ovrMin, filters.ovrMax)) {
    return false;
  }

  if (!matchesMin(record.minutesPlayed, filters.minutesMin)) {
    return false;
  }

  if (!matchesReliability(record.reliabilityLabel, filters.reliability)) {
    return false;
  }

  if (filters.primaryRole !== 'all' && record.primaryRoleLabel !== filters.primaryRole) {
    return false;
  }

  if (filters.secondaryRole !== 'all' && record.secondaryRoleLabel !== filters.secondaryRole) {
    return false;
  }

  if (filters.archetype !== 'all' && record.archetype !== filters.archetype) {
    return false;
  }

  if ((record.attackScore || 0) < filters.attackMin) {
    return false;
  }

  if ((record.creativityScore || 0) < filters.creativityMin) {
    return false;
  }

  if ((record.possessionScore || 0) < filters.possessionMin) {
    return false;
  }

  if ((record.defendingScore || 0) < filters.defendingMin) {
    return false;
  }

  return true;
}

function matchesPlayerPreset(record, referenceRecord, presetId) {
  if (!presetId || presetId === 'none' || !referenceRecord) {
    return true;
  }

  switch (presetId) {
    case 'same_position':
      return record.positionModel === referenceRecord.positionModel;
    case 'same_role':
      return record.primaryRoleLabel === referenceRecord.primaryRoleLabel;
    case 'similar_age':
      return referenceRecord.age === null || record.age === null ? true : Math.abs(record.age - referenceRecord.age) <= 3;
    case 'similar_ovr':
      return Math.abs((record.ovr || 0) - (referenceRecord.ovr || 0)) <= 5;
    case 'scouting_match':
      return (
        record.positionModel === referenceRecord.positionModel &&
        (!referenceRecord.primaryRoleLabel || referenceRecord.primaryRoleLabel === '-' || record.primaryRoleLabel === referenceRecord.primaryRoleLabel) &&
        (referenceRecord.age === null || record.age === null ? true : Math.abs(record.age - referenceRecord.age) <= 3) &&
        Math.abs((record.ovr || 0) - (referenceRecord.ovr || 0)) <= 6 &&
        matchesMin(record.minutesPlayed, Math.max(900, Math.round((referenceRecord.minutesPlayed || 0) * 0.55)))
      );
    default:
      return true;
  }
}

function getPlayerPresetScore(record, referenceRecord, presetId) {
  if (!presetId || presetId === 'none' || !referenceRecord) {
    return 1;
  }

  const samePosition = record.positionModel === referenceRecord.positionModel;
  const sameRole = record.primaryRoleLabel && record.primaryRoleLabel === referenceRecord.primaryRoleLabel;
  const sameArchetype = record.archetype && record.archetype === referenceRecord.archetype;
  const ageDiff = referenceRecord.age === null || record.age === null ? null : Math.abs(record.age - referenceRecord.age);
  const ovrDiff = Math.abs((record.ovr || 0) - (referenceRecord.ovr || 0));
  const minutesThreshold = Math.max(900, Math.round((referenceRecord.minutesPlayed || 0) * 0.55));
  const reliableMinutes = matchesMin(record.minutesPlayed, minutesThreshold);

  switch (presetId) {
    case 'same_position':
      return samePosition ? 120 : 0;
    case 'same_role':
      if (sameRole) {
        return 120;
      }

      return samePosition ? 70 : 0;
    case 'similar_age':
      if (ageDiff === null) {
        return samePosition ? 40 : 10;
      }

      if (ageDiff <= 2) {
        return 120;
      }

      if (ageDiff <= 4) {
        return 90;
      }

      if (ageDiff <= 6) {
        return 55;
      }

      return ageDiff <= 8 ? 25 : 0;
    case 'similar_ovr':
      if (ovrDiff <= 2) {
        return 120;
      }

      if (ovrDiff <= 4) {
        return 90;
      }

      if (ovrDiff <= 6) {
        return 55;
      }

      return ovrDiff <= 10 ? 25 : 0;
    case 'scouting_match': {
      let score = 0;

      if (samePosition) {
        score += 52;
      }

      if (sameRole) {
        score += 36;
      }

      if (sameArchetype) {
        score += 14;
      }

      if (ageDiff !== null && ageDiff <= 3) {
        score += 16;
      } else if (ageDiff !== null && ageDiff <= 5) {
        score += 8;
      }

      if (ovrDiff <= 4) {
        score += 18;
      } else if (ovrDiff <= 7) {
        score += 10;
      }

      if (reliableMinutes) {
        score += 10;
      }

      return score;
    }
    default:
      return 1;
  }
}

function orderPlayerPresetOptions(pool = [], referenceRecord, presetId) {
  if (!presetId || presetId === 'none' || !referenceRecord) {
    return pool;
  }

  const scoredPool = pool
    .map((record) => ({
      record,
      presetScore: getPlayerPresetScore(record, referenceRecord, presetId)
    }))
    .sort((left, right) => {
      const presetDiff = right.presetScore - left.presetScore;

      if (presetDiff !== 0) {
        return presetDiff;
      }

      const ovrDiff = (right.record.ovr || 0) - (left.record.ovr || 0);

      if (ovrDiff !== 0) {
        return ovrDiff;
      }

      return String(left.record.name || '').localeCompare(String(right.record.name || ''));
    });

  const strictMatches = scoredPool.filter((entry) => entry.presetScore > 0).map((entry) => entry.record);
  return strictMatches.length ? strictMatches : scoredPool.map((entry) => entry.record);
}

function matchesTeamFilters(record, filters) {
  if (filters.league !== 'all' && record.league !== filters.league) {
    return false;
  }

  if (!matchesRange(record.rating, filters.ratingMin, filters.ratingMax)) {
    return false;
  }

  if (filters.preferredFormation !== 'all' && record.preferredFormation !== filters.preferredFormation) {
    return false;
  }

  if (filters.detectedFormation !== 'all' && record.detectedFormation !== filters.detectedFormation) {
    return false;
  }

  if (filters.styleTag !== 'all' && !record.styleTags.includes(filters.styleTag)) {
    return false;
  }

  if (filters.strongestLine !== 'all' && record.strongestLine !== filters.strongestLine) {
    return false;
  }

  if (filters.weakestLine !== 'all' && record.weakestLine !== filters.weakestLine) {
    return false;
  }

  if (!matchesMin(record.depthScore, filters.depthMin)) {
    return false;
  }

  if (filters.gapSeverity !== 'all' && record.gapSeverity !== filters.gapSeverity) {
    return false;
  }

  if (filters.roleCoverage !== 'all' && record.roleCoverageQuality !== filters.roleCoverage) {
    return false;
  }

  return true;
}

function matchesTeamPreset(record, referenceRecord, presetId) {
  if (!presetId || presetId === 'none' || !referenceRecord) {
    return true;
  }

  switch (presetId) {
    case 'same_league':
      return record.league === referenceRecord.league;
    case 'same_shape':
      return record.preferredFormation === referenceRecord.preferredFormation || record.detectedFormation === referenceRecord.detectedFormation;
    case 'same_style':
      return record.styleTags.some((tag) => referenceRecord.styleTags.includes(tag));
    case 'strongest_xi_compare':
      return Math.abs((record.bestXIRating || 0) - (referenceRecord.bestXIRating || 0)) <= 4;
    case 'depth_compare':
      return Math.abs((record.depthScore || 0) - (referenceRecord.depthScore || 0)) <= 6;
    default:
      return true;
  }
}

function getTeamPresetScore(record, referenceRecord, presetId) {
  if (!presetId || presetId === 'none' || !referenceRecord) {
    return 1;
  }

  const sameLeague = record.league === referenceRecord.league;
  const samePreferredShape = record.preferredFormation === referenceRecord.preferredFormation;
  const sameDetectedShape = record.detectedFormation === referenceRecord.detectedFormation;
  const sharedStyleCount = record.styleTags.filter((tag) => referenceRecord.styleTags.includes(tag)).length;
  const bestXIDiff = Math.abs((record.bestXIRating || 0) - (referenceRecord.bestXIRating || 0));
  const depthDiff = Math.abs((record.depthScore || 0) - (referenceRecord.depthScore || 0));

  switch (presetId) {
    case 'same_league':
      return sameLeague ? 120 : 0;
    case 'same_shape':
      if (samePreferredShape) {
        return 120;
      }

      return sameDetectedShape ? 85 : 0;
    case 'same_style':
      return sharedStyleCount > 0 ? 60 + sharedStyleCount * 20 : 0;
    case 'strongest_xi_compare':
      if (bestXIDiff <= 2) {
        return 120;
      }

      if (bestXIDiff <= 4) {
        return 90;
      }

      return bestXIDiff <= 7 ? 45 : 0;
    case 'depth_compare':
      if (depthDiff <= 3) {
        return 120;
      }

      if (depthDiff <= 6) {
        return 90;
      }

      return depthDiff <= 10 ? 45 : 0;
    default:
      return 1;
  }
}

function orderTeamPresetOptions(pool = [], referenceRecord, presetId) {
  if (!presetId || presetId === 'none' || !referenceRecord) {
    return pool;
  }

  const scoredPool = pool
    .map((record) => ({
      record,
      presetScore: getTeamPresetScore(record, referenceRecord, presetId)
    }))
    .sort((left, right) => {
      const presetDiff = right.presetScore - left.presetScore;

      if (presetDiff !== 0) {
        return presetDiff;
      }

      const ratingDiff = (right.record.rating || 0) - (left.record.rating || 0);

      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      return String(left.record.name || '').localeCompare(String(right.record.name || ''));
    });

  const strictMatches = scoredPool.filter((entry) => entry.presetScore > 0).map((entry) => entry.record);
  return strictMatches.length ? strictMatches : scoredPool.map((entry) => entry.record);
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
  const [playerFilters, setPlayerFilters] = useState(() => createDefaultPlayerCompareFilters());
  const [playerControls, setPlayerControls] = useState(() => createDefaultPlayerCompareControls());
  const [playerPresetId, setPlayerPresetId] = useState('none');
  const [teamFilters, setTeamFilters] = useState(() => createDefaultTeamCompareFilters());
  const [teamControls, setTeamControls] = useState(() => createDefaultTeamCompareControls());
  const [teamPresetId, setTeamPresetId] = useState('none');
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

  const updatePlayerFilters = (patch) => setPlayerFilters((current) => ({ ...current, ...patch }));
  const updatePlayerControls = (patch) => setPlayerControls((current) => ({ ...current, ...patch }));
  const updateTeamFilters = (patch) => setTeamFilters((current) => ({ ...current, ...patch }));
  const updateTeamControls = (patch) => setTeamControls((current) => ({ ...current, ...patch }));
  const resetPlayerFilters = () => {
    setPlayerFilters(createDefaultPlayerCompareFilters());
    setPlayerControls(createDefaultPlayerCompareControls());
    setPlayerPresetId('none');
  };
  const resetTeamFilters = () => {
    setTeamFilters(createDefaultTeamCompareFilters());
    setTeamControls(createDefaultTeamCompareControls());
    setTeamPresetId('none');
  };

  const playerOptions = useMemo(
    () =>
      (players.data || []).map((player) => {
        const metrics = computeDisplayMetrics(player, ratingIndex);
        const age = readFilterNumber(player.age);

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
            metrics.secondaryTacticalRoleLabel,
            metrics.archetype
          ]
            .filter(Boolean)
            .join(' '),
          name: player.player,
          team: player.squad,
          clubKey: normalizeString(player.squad),
          position: player.pos,
          positionModel: metrics.positionModel,
          age,
          ovr: metrics.finalOVR,
          minutesPlayed: metrics.minutesPlayed,
          reliabilityLabel: metrics.reliabilityLabel,
          primaryRoleLabel: metrics.primaryTacticalRoleLabel,
          secondaryRoleLabel: metrics.secondaryTacticalRoleLabel,
          archetype: metrics.playerArchetype,
          attackScore: metrics.attackScore,
          creativityScore: metrics.creativityScore,
          possessionScore: metrics.possessionScore,
          defendingScore: metrics.defendingScore,
          nationality: player.nation,
          league: getLeagueName(player)
        };
      }),
    [players.data, ratingIndex]
  );

  const teamProfilesById = useMemo(
    () =>
      new Map(
        teams.map((team) => [team.id, buildTeamComparisonProfile(team, teams)])
      ),
    [teams]
  );

  const teamOptions = useMemo(() => buildTeamOptions(teams, teamProfilesById), [teamProfilesById, teams]);

  const playerContextPool = useMemo(
    () =>
      playerOptions.filter((record) => {
        if (playerFilters.league !== 'all' && record.leagueId !== playerFilters.league) {
          return false;
        }

        if (playerFilters.club !== 'all' && record.clubKey !== playerFilters.club) {
          return false;
        }

        if (playerFilters.positions.length && !playerFilters.positions.includes(record.positionModel)) {
          return false;
        }

        if (!matchesRange(record.age, playerFilters.ageMin, playerFilters.ageMax)) {
          return false;
        }

        if (!matchesRange(record.ovr, playerFilters.ovrMin, playerFilters.ovrMax)) {
          return false;
        }

        if (!matchesMin(record.minutesPlayed, playerFilters.minutesMin)) {
          return false;
        }

        return matchesReliability(record.reliabilityLabel, playerFilters.reliability);
      }),
    [playerFilters, playerOptions]
  );

  const filteredPlayerPool = useMemo(() => playerOptions.filter((record) => matchesPlayerFilters(record, playerFilters)), [playerFilters, playerOptions]);
  const selectedPlayerRecord = useMemo(() => playerOptions.find((record) => record.id === selectors.player1) || null, [playerOptions, selectors.player1]);
  const playerAOptions = useMemo(() => ensureSelectedOption(filteredPlayerPool, selectors.player1, playerOptions), [filteredPlayerPool, playerOptions, selectors.player1]);
  const playerBOptions = useMemo(
    () =>
      ensureSelectedOption(
        orderPlayerPresetOptions(
          filteredPlayerPool.filter((record) => record.id !== selectors.player1),
          selectedPlayerRecord,
          playerPresetId
        ),
        selectors.player2,
        playerOptions
      ),
    [filteredPlayerPool, playerOptions, playerPresetId, selectedPlayerRecord, selectors.player1, selectors.player2]
  );

  const playerMeta = useMemo(() => {
    const leagueOptions = [
      { value: 'all', label: 'All leagues' },
      ...Array.from(new Map(playerOptions.map((record) => [record.leagueId, { value: record.leagueId, label: record.leagueName }])).values()).sort((left, right) =>
        left.label.localeCompare(right.label)
      )
    ];
    const clubBasePool = playerOptions.filter((record) => playerFilters.league === 'all' || record.leagueId === playerFilters.league);
    const clubOptions = [
      { value: 'all', label: 'All clubs' },
      ...Array.from(new Map(clubBasePool.map((record) => [record.clubKey, { value: record.clubKey, label: record.team }])).values()).sort((left, right) =>
        left.label.localeCompare(right.label)
      )
    ];
    const archetypeOptions = [
      { value: 'all', label: 'All archetypes' },
      ...Array.from(new Set(playerContextPool.map((record) => record.archetype).filter(Boolean))).sort((left, right) => left.localeCompare(right)).map((archetype) => ({
        value: archetype,
        label: archetype
      }))
    ];

    return {
      leagueOptions,
      clubOptions,
      reliabilityOptions: RELIABILITY_OPTIONS,
      archetypeOptions,
      primaryRoleOptions: buildRoleOptions(playerContextPool, 'primary', playerFilters.positions),
      secondaryRoleOptions: buildRoleOptions(playerContextPool, 'secondary', playerFilters.positions)
    };
  }, [playerContextPool, playerFilters.league, playerFilters.positions, playerOptions]);

  const selectedTeamRecord = useMemo(() => teamOptions.find((record) => record.id === selectors.team1) || null, [selectors.team1, teamOptions]);
  const filteredTeamPool = useMemo(() => teamOptions.filter((record) => matchesTeamFilters(record, teamFilters)), [teamFilters, teamOptions]);
  const teamAOptions = useMemo(() => ensureSelectedOption(filteredTeamPool, selectors.team1, teamOptions), [filteredTeamPool, selectors.team1, teamOptions]);
  const teamBOptions = useMemo(
    () =>
      ensureSelectedOption(
        orderTeamPresetOptions(
          filteredTeamPool.filter((record) => record.id !== selectors.team1),
          selectedTeamRecord,
          teamPresetId
        ),
        selectors.team2,
        teamOptions
      ),
    [filteredTeamPool, selectors.team1, selectors.team2, selectedTeamRecord, teamOptions, teamPresetId]
  );

  const teamMeta = useMemo(() => {
    const scopedPool = teamOptions.filter((record) => {
      if (teamFilters.league !== 'all' && record.league !== teamFilters.league) {
        return false;
      }

      return matchesRange(record.rating, teamFilters.ratingMin, teamFilters.ratingMax);
    });

    return {
      leagueOptions: [
        { value: 'all', label: 'All leagues' },
        ...Array.from(new Set(teamOptions.map((record) => record.league))).filter(Boolean).sort((left, right) => left.localeCompare(right)).map((league) => ({
          value: league,
          label: league
        }))
      ],
      preferredFormationOptions: [
        { value: 'all', label: 'All preferred shapes' },
        ...Array.from(new Set(scopedPool.map((record) => record.preferredFormation))).filter(Boolean).sort((left, right) => left.localeCompare(right)).map((formation) => ({
          value: formation,
          label: formation
        }))
      ],
      detectedFormationOptions: [
        { value: 'all', label: 'All auto-best shapes' },
        ...Array.from(new Set(scopedPool.map((record) => record.detectedFormation))).filter(Boolean).sort((left, right) => left.localeCompare(right)).map((formation) => ({
          value: formation,
          label: formation
        }))
      ],
      styleOptions: [{ value: 'all', label: 'All styles' }, ...TEAM_STYLE_OPTIONS],
      lineOptions: [{ value: 'all', label: 'Any line' }, ...TEAM_LINE_OPTIONS],
      gapOptions: [{ value: 'all', label: 'Any gap pressure' }, ...TEAM_GAP_OPTIONS],
      roleCoverageOptions: [{ value: 'all', label: 'Any coverage level' }, ...TEAM_ROLE_COVERAGE_OPTIONS]
    };
  }, [teamFilters.league, teamFilters.ratingMax, teamFilters.ratingMin, teamOptions]);

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

        <CompareFiltersPanel
          mode={compareMode}
          onPlayerControlsChange={updatePlayerControls}
          onPlayerFiltersChange={updatePlayerFilters}
          onResetPlayerFilters={resetPlayerFilters}
          onResetTeamFilters={resetTeamFilters}
          onSelectPlayerPreset={(presetId) => {
            setPlayerPresetId(presetId);

            if (presetId === 'same_position') {
              setPlayerControls((current) => ({ ...current, comparisonLens: 'position' }));
            } else if (presetId === 'same_role' || presetId === 'scouting_match') {
              setPlayerControls((current) => ({ ...current, comparisonLens: 'role', showOnlyKeyCategories: true }));
            }
          }}
          onSelectTeamPreset={(presetId) => {
            setTeamPresetId(presetId);

            if (presetId === 'strongest_xi_compare' || presetId === 'same_shape') {
              setTeamControls((current) => ({ ...current, focusArea: 'tactical' }));
            } else if (presetId === 'depth_compare') {
              setTeamControls((current) => ({ ...current, focusArea: 'depth' }));
            } else if (presetId === 'same_style') {
              setTeamControls((current) => ({ ...current, focusArea: 'balanced' }));
            }
          }}
          onTeamControlsChange={updateTeamControls}
          onTeamFiltersChange={updateTeamFilters}
          playerControls={playerControls}
          playerFilters={playerFilters}
          playerMeta={playerMeta}
          playerPresetId={playerPresetId}
          playerReferenceLabel={selectedPlayerRecord?.name}
          teamControls={teamControls}
          teamFilters={teamFilters}
          teamMeta={teamMeta}
          teamPresetId={teamPresetId}
          teamReferenceLabel={selectedTeamRecord?.name}
        />

        {compareMode === 'players' ? (
          <>
            <section className="compare-selector-grid">
              <ComparePlayerSelector
                label="Player A"
                onSelect={(value) => setSelectors((current) => ({ ...current, player1: value }))}
                options={playerAOptions}
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
                options={playerBOptions}
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
                <CompareStatsSection
                  controls={playerControls}
                  leftMetrics={leftMetrics}
                  leftPlayer={playerCompareState.player1}
                  rightMetrics={rightMetrics}
                  rightPlayer={playerCompareState.player2}
                />
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
                options={teamAOptions}
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
                options={teamBOptions}
                selectedTeam={rightTeam}
                selectedValue={selectors.team2}
              />
            </section>

            {!selectors.team1 || !selectors.team2 ? (
              <p className="compare-message">Select two teams to open the scouting, tactical, depth, and recruitment comparison views.</p>
            ) : null}

            {leftTeam && rightTeam ? (
              <TeamComparisonDashboard controls={teamControls} leftTeam={leftTeam} onNavigate={onNavigate} rightTeam={rightTeam} teams={teams} />
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
