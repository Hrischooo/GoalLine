import { EXACT_POSITION_OPTIONS, RELIABILITY_OPTIONS, RELIABILITY_RANK, getRoleGroupsForPositions } from './scoutFiltersConfig';

export { EXACT_POSITION_OPTIONS, RELIABILITY_OPTIONS, RELIABILITY_RANK };

export const SCORE_FLOOR_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 55, label: '55+' },
  { value: 65, label: '65+' },
  { value: 75, label: '75+' },
  { value: 85, label: '85+' }
];

export const PLAYER_COMPARISON_LENSES = [
  { value: 'auto', label: 'Auto Lens' },
  { value: 'position', label: 'Exact Position' },
  { value: 'role', label: 'Role Lens' }
];

export const TEAM_COMPARE_FOCUS_OPTIONS = [
  { value: 'balanced', label: 'Balanced View' },
  { value: 'tactical', label: 'Tactical Edge' },
  { value: 'depth', label: 'Depth Edge' },
  { value: 'recruitment', label: 'Recruitment Edge' }
];

export const TEAM_STYLE_OPTIONS = [
  { value: 'possession-heavy', label: 'Possession-heavy' },
  { value: 'creative', label: 'Creative' },
  { value: 'direct', label: 'Direct' },
  { value: 'defensively-stable', label: 'Defensively stable' },
  { value: 'wide-focused', label: 'Wide-focused' },
  { value: 'central-control', label: 'Central-control' }
];

export const TEAM_LINE_OPTIONS = [
  { value: 'Attack', label: 'Attack' },
  { value: 'Midfield', label: 'Midfield' },
  { value: 'Defense', label: 'Defense' },
  { value: 'Goalkeeper', label: 'Goalkeeper' }
];

export const TEAM_GAP_OPTIONS = [
  { value: 'stable', label: 'Stable' },
  { value: 'moderate', label: 'Moderate Need' },
  { value: 'urgent', label: 'Urgent Need' }
];

export const TEAM_ROLE_COVERAGE_OPTIONS = [
  { value: 'strong', label: 'Strong Coverage' },
  { value: 'adequate', label: 'Adequate Coverage' },
  { value: 'thin', label: 'Thin Coverage' }
];

export const PLAYER_COMPARE_PRESETS = [
  { id: 'same_position', label: 'Same Position', description: 'Narrow Player B to the same exact-position lane as Player A.' },
  { id: 'same_role', label: 'Same Role', description: 'Prefer primary-role matches against Player A.' },
  { id: 'similar_age', label: 'Similar Age', description: 'Keep the comparison within a close age window.' },
  { id: 'similar_ovr', label: 'Similar OVR', description: 'Match Player A against peers in the same level band.' },
  { id: 'scouting_match', label: 'Scouting Match', description: 'Blend position, role, age, and reliability around Player A.' }
];

export const TEAM_COMPARE_PRESETS = [
  { id: 'same_league', label: 'Same League', description: "Hold the comparison inside Team A's league context." },
  { id: 'same_shape', label: 'Same Shape', description: "Keep Team B aligned to Team A's shape profile." },
  { id: 'same_style', label: 'Same Style', description: 'Find stylistic peers to Team A.' },
  { id: 'strongest_xi_compare', label: 'Strongest XI', description: 'Lean toward best-XI and tactical strength comparisons.' },
  { id: 'depth_compare', label: 'Depth Compare', description: 'Lean toward bench stability and squad depth comparisons.' }
];

export function createDefaultPlayerCompareFilters() {
  return {
    league: 'all',
    club: 'all',
    positions: [],
    ageMin: '',
    ageMax: '',
    ovrMin: '',
    ovrMax: '',
    minutesMin: '',
    reliability: 'all',
    primaryRole: 'all',
    secondaryRole: 'all',
    archetype: 'all',
    attackMin: 0,
    creativityMin: 0,
    possessionMin: 0,
    defendingMin: 0
  };
}

export function createDefaultPlayerCompareControls() {
  return {
    showOnlyDifferences: false,
    showOnlyKeyCategories: false,
    highlightBiggestAdvantage: true,
    comparisonLens: 'auto'
  };
}

export function createDefaultTeamCompareFilters() {
  return {
    league: 'all',
    ratingMin: '',
    ratingMax: '',
    preferredFormation: 'all',
    detectedFormation: 'all',
    styleTag: 'all',
    strongestLine: 'all',
    weakestLine: 'all',
    depthMin: '',
    gapSeverity: 'all',
    roleCoverage: 'all'
  };
}

export function createDefaultTeamCompareControls() {
  return {
    showOnlyDifferences: false,
    highlightBiggestAdvantage: true,
    focusArea: 'balanced'
  };
}

export function getCompareRoleGroups(positionModels = []) {
  return getRoleGroupsForPositions(positionModels);
}

export function getRoleFocusSections(roleLabel = '', positionModel = '') {
  const normalizedRole = String(roleLabel || '').toLowerCase();

  if (normalizedRole.includes('keeper')) {
    return ['goalkeeping'];
  }

  if (normalizedRole.includes('creator') || normalizedRole.includes('playmaker') || normalizedRole.includes('regista')) {
    return ['playmaking', 'possession'];
  }

  if (
    normalizedRole.includes('destroyer') ||
    normalizedRole.includes('anchor') ||
    normalizedRole.includes('stopper') ||
    normalizedRole.includes('aerial')
  ) {
    return ['defensive', 'possession'];
  }

  if (
    normalizedRole.includes('poacher') ||
    normalizedRole.includes('target') ||
    normalizedRole.includes('forward') ||
    normalizedRole.includes('dribbler')
  ) {
    return ['attacking', 'playmaking'];
  }

  switch (positionModel) {
    case 'GK':
      return ['goalkeeping'];
    case 'CB':
      return ['defensive', 'possession'];
    case 'LB/RB':
      return ['possession', 'playmaking', 'defensive'];
    case 'DM':
      return ['defensive', 'possession'];
    case 'CM':
      return ['possession', 'playmaking'];
    case 'CAM':
      return ['playmaking', 'attacking'];
    case 'LW/RW':
      return ['attacking', 'playmaking'];
    case 'ST':
      return ['attacking', 'playmaking'];
    default:
      return [];
  }
}

export function getTeamStyleTags(profile = {}) {
  const style = profile.style || {};
  const tags = [];

  if (style.possessionControl >= 72 || style.controlBias >= 72) {
    tags.push('possession-heavy');
  }

  if (style.creativity >= 72) {
    tags.push('creative');
  }

  if (style.directness >= 70) {
    tags.push('direct');
  }

  if (style.defensiveStability >= 72) {
    tags.push('defensively-stable');
  }

  if (style.wideThreat >= style.centralThreat + 6) {
    tags.push('wide-focused');
  }

  if (style.centralThreat >= style.wideThreat + 6 || style.controlBias >= 70) {
    tags.push('central-control');
  }

  return tags.length ? tags : ['creative'];
}

export function getTeamGapSeverity(profile = {}) {
  const topPriority = Math.max(...(profile.recruitment?.priorities || []).map((item) => Number(item.priorityScore) || 0), 0);

  if (topPriority >= 76) {
    return 'urgent';
  }

  if (topPriority >= 56) {
    return 'moderate';
  }

  return 'stable';
}

export function getTeamRoleCoverageQuality(profile = {}) {
  const missingCount = profile.roleCoverage?.missing?.length || 0;
  const thinCount = profile.roleCoverage?.thin?.length || 0;
  const strongCount = profile.roleCoverage?.strong?.length || 0;

  if (missingCount >= 2 || thinCount >= 3) {
    return 'thin';
  }

  if (strongCount >= 3 && missingCount === 0) {
    return 'strong';
  }

  return 'adequate';
}
