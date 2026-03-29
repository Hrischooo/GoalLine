import { computeDisplayMetrics, toNumber } from './playerMetrics';
import { getLeagueName } from './dataset';
import { getPlayerRadarProfile } from './playerRadar';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pickVariant(seed, variants = []) {
  if (!variants.length) {
    return '';
  }

  const numericSeed = String(seed || '')
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return variants[numericSeed % variants.length];
}

function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function average(values = []) {
  return values.length ? values.reduce((sum, value) => sum + toNumber(value), 0) / values.length : 0;
}

function percentile(values = [], value) {
  const sorted = [...values].sort((left, right) => left - right);

  if (!sorted.length) {
    return 50;
  }

  let below = 0;

  for (const candidateValue of sorted) {
    if (candidateValue < value) {
      below += 1;
    }
  }

  return Math.round((below / sorted.length) * 100);
}

function getProfileConfidence(metrics = {}) {
  const confidenceScore = 0.65 * toNumber(metrics.reliabilityModifier) + 0.35 * toNumber(metrics.dataCoverageModifier);

  if (confidenceScore >= 0.96) {
    return 'High confidence';
  }

  if (confidenceScore >= 0.88) {
    return 'Solid confidence';
  }

  return 'Moderate confidence';
}

function getLineKeyFromPositionModel(positionModel) {
  switch (positionModel) {
    case 'GK':
      return 'goalkeeper';
    case 'CB':
    case 'LB/RB':
      return 'defense';
    case 'DM':
    case 'CM':
    case 'CAM':
      return 'midfield';
    case 'LW/RW':
    case 'ST':
      return 'attack';
    default:
      return 'midfield';
  }
}

function classifyStrengthLevel(value) {
  if (value >= 88) {
    return 'elite';
  }

  if (value >= 74) {
    return 'strong';
  }

  return 'mild';
}

function classifyWeaknessLevel(value) {
  if (value <= 28) {
    return 'major';
  }

  if (value <= 40) {
    return 'secondary';
  }

  return 'development';
}

function buildStrengthTitle(axisLabel, level, seed) {
  const labelKey = String(axisLabel || '').toLowerCase();
  const footballSpecific = {
    creativity: ['Elite final-third creator', 'High-end chance creator', 'Premium supply profile'],
    attack: ['High-value attacking threat', 'Reliable attacking output', 'Dangerous attacking profile'],
    progression: ['Reliable progression outlet', 'Strong line-breaking progression', 'Consistent ball progression value'],
    possession: ['Strong control in possession', 'Secure circulation profile', 'Calm possession presence'],
    ball_security: ['Strong ball security under pressure', 'Secure retention profile', 'Low-error possession outlet'],
    defending: ['Aggressive defensive interrupter', 'Reliable defensive anchor', 'Strong defensive platform'],
    box_presence: ['Dangerous box attacker', 'High-value penalty-area presence', 'Consistent central threat'],
    shot_threat: ['High shot-volume threat', 'Repeatable shooting presence', 'Strong scoring-platform threat'],
    finishing: ['Efficient finishing profile', 'Clean shot conversion value', 'Reliable finishing touch'],
    aerial: ['Reliable aerial presence', 'Strong aerial duel profile', 'High-value overhead dominance'],
    physical_dueling: ['Strong duel profile', 'Reliable physical defending', 'Hard-to-beat duel presence'],
    carrying: ['Strong ball-carrying value', 'High-value support runner', 'Consistent carrying outlet'],
    carry_threat: ['Strong wide carrying threat', 'Direct carry danger', 'Progressive running threat'],
    dribbling: ['Dangerous one-v-one profile', 'Reliable dribble threat', 'Direct elimination value'],
    final_third_delivery: ['Strong final-third delivery', 'Reliable danger-zone supply', 'Advanced delivery quality'],
    delivery: ['Strong service from wide zones', 'Reliable wide delivery', 'Dangerous crossing support'],
    support_play: ['High-value support runner from wide areas', 'Reliable support play profile', 'Consistent overlap value'],
    ball_winning: ['Aggressive ball-winning profile', 'Reliable defensive recovery value', 'Strong possession-winning presence'],
    command: ['Commanding goalkeeping profile', 'Strong area control', 'Reliable presence on crosses'],
    shot_stopping: ['Elite shot stopper', 'High-end shot prevention', 'Reliable save-making profile'],
    distribution: ['Secure distribution outlet', 'Reliable build-up distributor', 'Strong passing value from deeper zones'],
    'handling / security': ['Secure handling profile', 'Reliable error avoidance', 'Clean goalkeeper security'],
    reliability: ['Sustained season reliability', 'High-trust sample profile', 'Strong consistency signal']
  };
  const matchedSpecific = Object.entries(footballSpecific).find(([key]) => labelKey.includes(key));

  if (matchedSpecific) {
    return pickVariant(`${seed}-${axisLabel}-${level}-strength-specific`, matchedSpecific[1]);
  }

  const variants = {
    elite: [`Elite ${axisLabel.toLowerCase()}`, `High-end ${axisLabel.toLowerCase()} profile`, `Premium ${axisLabel.toLowerCase()} value`],
    strong: [`Strong ${axisLabel.toLowerCase()}`, `Reliable ${axisLabel.toLowerCase()} profile`, `Above-average ${axisLabel.toLowerCase()}`],
    mild: [`Useful ${axisLabel.toLowerCase()}`, `Competent ${axisLabel.toLowerCase()}`, `Steady ${axisLabel.toLowerCase()} value`]
  };

  return pickVariant(`${seed}-${axisLabel}-${level}-strength`, variants[level]);
}

function buildWeaknessTitle(axisLabel, level, seed) {
  const labelKey = String(axisLabel || '').toLowerCase();
  const footballSpecific = {
    creativity: ['Limited advanced creation', 'Below-average chance supply', 'Modest creative volume'],
    attack: ['Limited direct threat in the box', 'Low attacking output for role', 'Attack is not yet a separator'],
    progression: ['Limited progression under pressure', 'Does not move play forward enough', 'Progression trails peers'],
    possession: ['Loose retention in high-touch situations', 'Possession control is lighter than ideal', 'Can lose control phases too easily'],
    ball_security: ['Loose ball security', 'Turnover risk is too visible', 'Retention breaks down too often'],
    defending: ['Below-average defensive work for role', 'Limited defensive impact', 'Defensive contribution trails peers'],
    box_presence: ['Modest box threat', 'Limited central penalty-area influence', 'Does not attack the box often enough'],
    shot_threat: ['Low shot volume', 'Does not generate enough shooting pressure', 'Shot threat is lighter than ideal'],
    finishing: ['Inconsistent shot efficiency', 'Finishing remains volatile', 'Conversion quality is not yet reliable'],
    aerial: ['Limited aerial duel presence', 'Weak overhead profile', 'Aerial impact is modest'],
    carrying: ['Does not progress enough through carries', 'Limited support running value', 'Carrying threat is modest'],
    carry_threat: ['Wide carrying threat is limited', 'Direct running is not a major weapon', 'Carry danger trails stronger peers'],
    dribbling: ['One-v-one profile is limited', 'Low dribble separation value', 'Beats defenders less than top peers'],
    final_third_delivery: ['Limited final-third influence', 'Danger-zone supply is modest', 'Advanced delivery trails peers'],
    delivery: ['Limited crossing quality', 'Service from wide areas is inconsistent', 'Wide delivery is not yet a strength'],
    support_play: ['Support play is limited', 'Does not add enough support from wide areas', 'Secondary attacking support is modest'],
    ball_winning: ['Passive ball-winning profile', 'Recovery volume is lighter than ideal', 'Defensive regains trail peers'],
    command: ['Area command is modest', 'Cross control remains a watch area', 'Presence outside pure shot-stopping is limited'],
    shot_stopping: ['Shot prevention is below top peers', 'Save-making ceiling looks modest', 'Shot-stopping trails stronger keepers'],
    distribution: ['Distribution is not yet a separator', 'Build-up passing is modest', 'Deep distribution quality trails peers'],
    'handling / security': ['Handling security is a concern', 'Error avoidance needs to sharpen', 'Security under pressure is inconsistent']
  };
  const matchedSpecific = Object.entries(footballSpecific).find(([key]) => labelKey.includes(key));

  if (matchedSpecific) {
    return pickVariant(`${seed}-${axisLabel}-${level}-weakness-specific`, matchedSpecific[1]);
  }

  const variants = {
    major: [`Limited ${axisLabel.toLowerCase()}`, `${axisLabel} is a clear weakness`, `${axisLabel} caps the profile`],
    secondary: [`Modest ${axisLabel.toLowerCase()}`, `${axisLabel} trails peers`, `${axisLabel} is inconsistent`],
    development: [`Development area: ${axisLabel}`, `${axisLabel} can still sharpen`, `${axisLabel} is not yet a separator`]
  };

  return pickVariant(`${seed}-${axisLabel}-${level}-weakness`, variants[level]);
}

function buildInsightExplanation(axisLabel, type, level, seed, roleLabel) {
  const strengthVariants = {
    elite: [
      `${axisLabel} is one of the clearest ways this ${roleLabel.toLowerCase()} profile separates from peers.`,
      `${axisLabel} consistently grades at the top end of the role model.`
    ],
    strong: [
      `${axisLabel} clearly supports the profile and holds up well against comparable players.`,
      `${axisLabel} is a dependable strength relative to the role baseline.`
    ],
    mild: [
      `${axisLabel} adds useful value even if it is not the main driver of the profile.`,
      `${axisLabel} contributes positively without fully defining the overall game.`
    ]
  };
  const weaknessVariants = {
    major: [
      `${axisLabel} is a real limiting factor against stronger peers in the role.`,
      `${axisLabel} falls well short of the cleaner profiles in the same position group.`
    ],
    secondary: [
      `${axisLabel} is softer than ideal and drags on the total profile.`,
      `${axisLabel} trails stronger peers often enough to matter in the scouting view.`
    ],
    development: [
      `${axisLabel} sits in a workable range but still leaves room for development.`,
      `${axisLabel} is neither a major weakness nor a true strength yet.`
    ]
  };

  return pickVariant(`${seed}-${axisLabel}-${type}-${level}-body`, type === 'strength' ? strengthVariants[level] : weaknessVariants[level]);
}

function getProfileShape(metrics) {
  const entries = [
    ['attack', toNumber(metrics.attackScore)],
    ['creativity', toNumber(metrics.creativityScore)],
    ['possession', toNumber(metrics.possessionScore)],
    ['defending', toNumber(metrics.defendingScore)]
  ].sort((left, right) => right[1] - left[1]);
  const spread = entries[0][1] - entries[3][1];

  if (spread <= 12) {
    return 'well-rounded';
  }

  if (entries[0][0] === 'creativity' || entries[0][0] === 'attack') {
    return 'attacking skew';
  }

  if (entries[0][0] === 'possession' || entries[0][0] === 'defending') {
    return 'control skew';
  }

  return 'specialist';
}

export function buildStrengthsWeaknessesProfile(player, metrics) {
  const radarAxes = getPlayerRadarProfile(metrics).radarAxes || [];
  const seed = `${player?.player || ''}-${metrics?.playerArchetype || ''}`;
  const confidence = getProfileConfidence(metrics);
  const roleLabel = metrics?.primaryTacticalRoleLabel || metrics?.exactPosition || 'profile';
  const strengths = [...radarAxes]
    .filter((axis) => axis.value >= 68)
    .sort((left, right) => right.value - left.value)
    .slice(0, 5)
    .map((axis) => {
      const level = classifyStrengthLevel(axis.value);
      return {
        key: `strength-${axis.key}`,
        title: buildStrengthTitle(axis.label, level, seed),
        explanation: buildInsightExplanation(axis.label, 'strength', level, seed, roleLabel),
        severity: level,
        confidence,
        tags: [axis.label, roleLabel, metrics.playerArchetype].filter(Boolean).slice(0, 3)
      };
    });
  const weaknesses = [...radarAxes]
    .filter((axis) => axis.value <= 50)
    .sort((left, right) => left.value - right.value)
    .slice(0, 4)
    .map((axis) => {
      const level = classifyWeaknessLevel(axis.value);
      return {
        key: `weakness-${axis.key}`,
        title: buildWeaknessTitle(axis.label, level, seed),
        explanation: buildInsightExplanation(axis.label, 'weakness', level, seed, roleLabel),
        severity: level,
        confidence,
        tags: [axis.label, roleLabel].filter(Boolean).slice(0, 3)
      };
    });
  const developmentAreas = [...radarAxes]
    .filter((axis) => axis.value > 50 && axis.value < 64)
    .sort((left, right) => left.value - right.value)
    .slice(0, 2)
    .map((axis) => ({
      key: `development-${axis.key}`,
      title: `Development area: ${axis.label}`,
      explanation: `${axis.label} is workable, but sharpening it would round out the role profile.`,
      severity: 'development',
      confidence,
      tags: [axis.label, 'Growth'].filter(Boolean)
    }));
  const shape = getProfileShape(metrics);

  return {
    summary: `${titleCase(shape)} with ${confidence.toLowerCase()} from the minutes sample and tracked data coverage.`,
    profileShape: titleCase(shape),
    confidence,
    strengths: strengths.length ? strengths : [],
    weaknesses: weaknesses.length ? weaknesses : [],
    developmentAreas
  };
}

function getComparableRatings(player, metrics, players = [], ratingIndex = {}) {
  const currentLeague = getLeagueName(player);
  const exactLeaguePool = players
    .filter((candidate) => candidate !== player && getLeagueName(candidate) === currentLeague)
    .map((candidate) => computeDisplayMetrics(candidate, ratingIndex))
    .filter((candidateMetrics) => candidateMetrics.exactPosition === metrics.exactPosition);

  if (exactLeaguePool.length >= 5) {
    return { pool: exactLeaguePool, poolLabel: `${currentLeague} ${metrics.exactPosition}s` };
  }

  const exactDatasetPool = players
    .filter((candidate) => candidate !== player)
    .map((candidate) => computeDisplayMetrics(candidate, ratingIndex))
    .filter((candidateMetrics) => candidateMetrics.exactPosition === metrics.exactPosition);

  if (exactDatasetPool.length >= 8) {
    return { pool: exactDatasetPool, poolLabel: `${metrics.exactPosition} dataset pool` };
  }

  return {
    pool: players
      .filter((candidate) => candidate !== player)
      .map((candidate) => computeDisplayMetrics(candidate, ratingIndex))
      .filter((candidateMetrics) => candidateMetrics.positionModel === metrics.positionModel),
    poolLabel: `${metrics.positionModel} role pool`
  };
}

function getDeltaDescriptor(delta) {
  if (delta >= 15) return 'well above average';
  if (delta >= 7) return 'above average';
  if (delta <= -15) return 'well below average';
  if (delta <= -7) return 'below average';
  return 'around average';
}

function getDirection(delta) {
  if (delta > 4) return 'up';
  if (delta < -4) return 'down';
  return 'flat';
}

export function buildLeagueComparisonProfile(player, metrics, players = [], ratingIndex = {}) {
  const { pool, poolLabel } = getComparableRatings(player, metrics, players, ratingIndex);
  const categoryPairs = [
    ['attack', toNumber(metrics.attackScore)],
    ['creativity', toNumber(metrics.creativityScore)],
    ['possession', toNumber(metrics.possessionScore)],
    ['defending', toNumber(metrics.defendingScore)]
  ];
  const categoryDeltas = Object.fromEntries(
    categoryPairs.map(([key, value]) => {
      const values = pool.map((candidateMetrics) => toNumber(candidateMetrics[`${key}Score`]));
      const averageValue = average(values);
      const delta = Math.round(value - averageValue);
      return [key, { value: delta, average: Math.round(averageValue), percentile: percentile(values, value), descriptor: getDeltaDescriptor(delta), direction: getDirection(delta) }];
    })
  );
  const entries = Object.entries(categoryDeltas).sort((left, right) => right[1].value - left[1].value);
  const strongest = entries[0];
  const weakest = [...entries].reverse()[0];
  const spread = Math.max(...Object.values(categoryDeltas).map((entry) => entry.average + entry.value)) - Math.min(...Object.values(categoryDeltas).map((entry) => entry.average + entry.value));
  const balanceLabel = spread <= 12 ? 'balanced' : spread >= 26 ? 'skewed' : 'mixed';
  const rareCount = Object.values(categoryDeltas).filter((entry) => entry.percentile >= 85 || entry.percentile <= 20).length;
  const rarityLabel = rareCount >= 3 ? 'rare profile' : rareCount >= 2 ? 'unusual profile' : 'fairly standard profile';
  const insights = [];

  if (strongest && strongest[1].value >= 8) {
    insights.push(`${strongest[1].descriptor.charAt(0).toUpperCase() + strongest[1].descriptor.slice(1)} ${strongest[0]} for a ${metrics.exactPosition}.`);
  }

  if (weakest && weakest[1].value <= -8) {
    insights.push(`${weakest[1].descriptor.charAt(0).toUpperCase() + weakest[1].descriptor.slice(1)} ${weakest[0]} contribution relative to ${poolLabel}.`);
  }

  insights.push(balanceLabel === 'balanced' ? 'Well-rounded positional profile with no major category collapse.' : `More ${balanceLabel} profile, built around ${strongest?.[0] || 'its top trait'} rather than broad balance.`);

  if (rareCount >= 2) {
    insights.push(`${rarityLabel.charAt(0).toUpperCase() + rarityLabel.slice(1)} for the position in this comparison pool.`);
  }

  return {
    poolLabel,
    sampleSize: pool.length,
    categoryDeltas,
    balanceLabel,
    rarityLabel,
    summary: `${rarityLabel.charAt(0).toUpperCase() + rarityLabel.slice(1)} with a ${balanceLabel} category mix against ${poolLabel}.`,
    insights: insights.slice(0, 4)
  };
}

const FORMATION_FIT_RULES = {
  GK: ['4-3-3', '4-2-3-1', '4-1-4-1'],
  CB: ['4-3-3', '4-2-3-1', '3-5-2', '3-4-3'],
  'LB/RB': ['4-3-3', '4-2-3-1', '3-4-3', '3-5-2'],
  DM: ['4-3-3', '4-2-3-1', '4-1-4-1'],
  CM: ['4-3-3', '4-4-2', '4-1-4-1'],
  CAM: ['4-2-3-1', '4-1-2-1-2', '4-3-3'],
  'LW/RW': ['4-3-3', '4-2-3-1', '3-4-3', '5-2-3'],
  ST: ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2']
};

function buildSystemFitSummary(metrics) {
  if (metrics.creativityScore >= 78 && ['CAM', 'LW/RW', 'CM'].includes(metrics.positionModel)) {
    return {
      summary: pickVariant(metrics.playerArchetype, ['Best fit in controlled possession systems that rely on high-value creation between lines.', 'Strongest in structures that free the player to create and supply danger-zone actions consistently.']),
      caution: pickVariant(metrics.playerArchetype + 'c', ['Less ideal in rigid low-block systems demanding heavy defensive volume before creative freedom arrives.', 'Can be a weaker fit for systems that reduce advanced freedom and final-third touch volume.']),
      bestFormations: FORMATION_FIT_RULES[metrics.positionModel] || ['4-3-3']
    };
  }

  if (metrics.attackScore >= 82 && ['LW/RW', 'ST'].includes(metrics.positionModel)) {
    return {
      summary: pickVariant(metrics.playerArchetype, ['Best fit in aggressive attacking systems that create repeated box exposure and direct running lanes.', 'Profiles best where the structure feeds shots, box touches, and repeated attacking actions.']),
      caution: pickVariant(metrics.playerArchetype + 'c', ['Less ideal in slower systems that reduce direct threat and repeated final-third access.', 'May offer less value in sterile possession structures without enough space to attack.']),
      bestFormations: FORMATION_FIT_RULES[metrics.positionModel] || ['4-3-3']
    };
  }

  return {
    summary: pickVariant(metrics.playerArchetype, ['Best fit in structured systems that value role clarity, secure phases, and repeatable positional execution.', 'Profiles best in balanced team structures that can lean on the player’s strongest role traits consistently.']),
    caution: pickVariant(metrics.playerArchetype + 'c', ['Less ideal in chaotic transition-heavy games where role detail breaks down too often.', 'Can be a weaker fit for hyper-open structures that constantly drag the profile away from its best phases.']),
    bestFormations: FORMATION_FIT_RULES[metrics.positionModel] || ['4-3-3']
  };
}
function getDepthNeedScore(team = {}, metrics = {}) {
  const depthEntries = team.positionDepth || [];
  const exactDepth = depthEntries.find((entry) => entry.position === metrics.exactPosition);
  const lineKey = getLineKeyFromPositionModel(metrics.positionModel);
  const familyCounts = team.countsByPositionFamily || {};
  const lineCount =
    lineKey === 'attack'
      ? toNumber(familyCounts.attackCount)
      : lineKey === 'midfield'
        ? toNumber(familyCounts.midfieldCount)
        : lineKey === 'defense'
          ? toNumber(familyCounts.defenseCount)
          : toNumber(familyCounts.goalkeeperCount);
  const shallowDepthBonus = exactDepth ? clamp(30 - exactDepth.count * 8, 0, 24) : 18;
  const weakLineBonus = team.weakestLine === lineKey ? 18 : 0;
  const thinSquadBonus = lineCount > 0 && lineCount <= 3 ? 10 : 0;
  return clamp(48 + shallowDepthBonus + weakLineBonus + thinSquadBonus, 35, 96);
}

function getFormationFitScore(team = {}, bestFormations = []) {
  const detectedFormation = team.detectedFormation || team.preferred_formation || team.preferredFormation;
  const preferredFormation = team.preferred_formation || team.preferredFormation;

  if (detectedFormation && bestFormations.includes(detectedFormation)) {
    return 94;
  }

  if (preferredFormation && bestFormations.includes(preferredFormation)) {
    return 88;
  }

  if (bestFormations.includes('4-3-3') && ['4-2-3-1', '4-1-4-1'].includes(detectedFormation)) {
    return 79;
  }

  if (bestFormations.includes('4-2-3-1') && ['4-3-3', '4-1-2-1-2'].includes(detectedFormation)) {
    return 78;
  }

  return 64;
}

function getStyleFitScore(team = {}, metrics = {}) {
  const identity = String(team.tacticalIdentitySummary || '').toLowerCase();
  let score = 62;

  if (identity.includes('possession') && metrics.possessionScore >= 74) {
    score += 16;
  }

  if (identity.includes('creation') && metrics.creativityScore >= 72) {
    score += 14;
  }

  if (identity.includes('striker-focused') && metrics.positionModel === 'ST' && metrics.attackScore >= 78) {
    score += 18;
  }

  if (identity.includes('wide') && ['LW/RW', 'LB/RB'].includes(metrics.positionModel) && (metrics.attackScore >= 72 || metrics.creativityScore >= 72)) {
    score += 14;
  }

  if (identity.includes('defensively stable') && ['CB', 'DM', 'GK', 'LB/RB'].includes(metrics.positionModel) && metrics.defendingScore >= 72) {
    score += 14;
  }

  if (identity.includes('low-creation') && ['CAM', 'CM', 'LW/RW'].includes(metrics.positionModel) && metrics.creativityScore < 62) {
    score += 6;
  }

  return clamp(score, 45, 96);
}

function getNeedFitScore(team = {}, metrics = {}) {
  const lineKey = getLineKeyFromPositionModel(metrics.positionModel);
  const weakestLineBonus = team.weakestLine === lineKey ? 20 : 0;
  const lineRating =
    lineKey === 'goalkeeper'
      ? toNumber(team.lineRatings?.goalkeeper)
      : lineKey === 'defense'
        ? toNumber(team.lineRatings?.defense)
        : lineKey === 'midfield'
          ? toNumber(team.lineRatings?.midfield)
          : toNumber(team.lineRatings?.attack);
  const lineWeaknessBonus = clamp(78 - lineRating, 0, 18);
  const roleNeedBonus =
    metrics.positionModel === 'CAM' && String(team.tacticalIdentitySummary || '').toLowerCase().includes('low-creation')
      ? 12
      : 0;
  return clamp(55 + weakestLineBonus + lineWeaknessBonus + roleNeedBonus, 40, 95);
}

function getImmediateImpactScore(team = {}, metrics = {}) {
  const teamRating = toNumber(team.teamRating || team.avgRating);
  const playerLevel = toNumber(metrics.finalOVR);
  const delta = playerLevel - teamRating;
  return clamp(64 + delta * 3.2, 40, 97);
}

function buildProjectedRole(team = {}, metrics = {}, bestFormations = []) {
  const formation = team.detectedFormation || bestFormations[0] || '4-3-3';
  const roleLabel = metrics.primaryTacticalRoleLabel || metrics.playerArchetype || metrics.exactPosition;

  switch (metrics.positionModel) {
    case 'CAM':
      return `${roleLabel} in the central line of a ${formation}`;
    case 'DM':
      return `${roleLabel} as the balance piece in a ${formation}`;
    case 'CM':
      return `${roleLabel} in the interior midfield line of a ${formation}`;
    case 'LW/RW':
      return `${roleLabel} starting from the wide attacking lane in a ${formation}`;
    case 'LB/RB':
      return `${roleLabel} providing support from full-back zones in a ${formation}`;
    case 'CB':
      return `${roleLabel} anchoring the defensive line in a ${formation}`;
    case 'ST':
      return `${roleLabel} leading the front line in a ${formation}`;
    case 'GK':
      return `${roleLabel} as the starting goalkeeper in a ${formation}`;
    default:
      return `${roleLabel} within a ${formation}`;
  }
}

function buildTeamFitReasons(team = {}, metrics = {}, bestFormations = []) {
  const reasons = [];

  if (getFormationFitScore(team, bestFormations) >= 88) {
    reasons.push(`Formation match is strong through ${team.detectedFormation || bestFormations[0]}.`);
  }

  if (team.weakestLine === getLineKeyFromPositionModel(metrics.positionModel)) {
    reasons.push(`The squad's weakest line is ${team.weakestLine}, so the profile addresses a visible need.`);
  }

  if (String(team.tacticalIdentitySummary || '').toLowerCase().includes('possession') && metrics.possessionScore >= 74) {
    reasons.push('Possession profile aligns with a control-oriented team structure.');
  }

  if (String(team.tacticalIdentitySummary || '').toLowerCase().includes('creation') && metrics.creativityScore >= 74) {
    reasons.push('Chance-creation profile matches the club attacking identity.');
  }

  if (metrics.positionModel === 'ST' && metrics.attackScore >= 80) {
    reasons.push('Attacking output should translate quickly into immediate finishing value.');
  }

  if (metrics.positionModel === 'CB' && metrics.defendingScore >= 78) {
    reasons.push('Defensive profile fits a team needing more stable duel and coverage value.');
  }

  return reasons.slice(0, 3);
}

function buildTeamFitCaution(team = {}, metrics = {}) {
  const identity = String(team.tacticalIdentitySummary || '').toLowerCase();

  if (identity.includes('defensively stable') && ['CAM', 'LW/RW', 'ST'].includes(metrics.positionModel) && metrics.defendingScore < 44) {
    return 'Lower defensive work for the role could reduce fit in a more demanding collective structure.';
  }

  if (identity.includes('possession') && metrics.possessionScore < 58) {
    return 'Ball security and circulation are lighter than ideal for a possession-heavy environment.';
  }

  if (identity.includes('wide') && metrics.positionModel === 'ST' && metrics.creativityScore < 48) {
    return 'Could rely heavily on service quality rather than broad combination play in wide-led attacks.';
  }

  if (metrics.reliabilityModifier < 0.9) {
    return 'Minutes sample is lighter than ideal, so adaptation confidence is slightly lower.';
  }

  return 'No major structural warning, but team context would still shape the ceiling of the role.';
}

function getFitConfidence(score, team = {}, metrics = {}) {
  const dataDepth = team.positionDepth?.length ? 1 : 0;
  const confidenceBase = score * 0.7 + toNumber(metrics.reliabilityModifier) * 100 * 0.2 + dataDepth * 10;

  if (confidenceBase >= 86) {
    return 'High confidence';
  }

  if (confidenceBase >= 74) {
    return 'Solid confidence';
  }

  return 'Moderate confidence';
}

export function buildTransferIntelligenceProfile(player, metrics, teams = []) {
  const systemFit = buildSystemFitSummary(metrics);
  const bestFormations = systemFit.bestFormations || FORMATION_FIT_RULES[metrics.positionModel] || ['4-3-3'];
  const bestTeams = teams
    .map((team) => {
      const formationFit = getFormationFitScore(team, bestFormations);
      const styleFit = getStyleFitScore(team, metrics);
      const needFit = getNeedFitScore(team, metrics);
      const immediateImpact = getImmediateImpactScore(team, metrics);
      const depthNeed = getDepthNeedScore(team, metrics);
      const fitScore = Math.round(0.26 * formationFit + 0.24 * styleFit + 0.18 * needFit + 0.16 * immediateImpact + 0.16 * depthNeed);
      const whyItFits = buildTeamFitReasons(team, metrics, bestFormations);
      const caution = buildTeamFitCaution(team, metrics);

      return {
        teamName: team.displayName || team.name,
        fitScore,
        fitConfidence: getFitConfidence(fitScore, team, metrics),
        projectedRole: buildProjectedRole(team, metrics, bestFormations),
        tacticalMatchSummary: `${team.displayName || team.name} fits through ${String(team.tacticalIdentitySummary || 'its current structure').toLowerCase()} and ${team.detectedFormation || bestFormations[0]}.`,
        whyItFits,
        caution,
        lineNeed: titleCase(getLineKeyFromPositionModel(metrics.positionModel)),
        roleFit: metrics.primaryTacticalRoleLabel || metrics.playerArchetype || metrics.exactPosition
      };
    })
    .filter((entry) => entry.fitScore >= 66)
    .sort((left, right) => right.fitScore - left.fitScore)
    .slice(0, 4);

  return {
    systemFitSummary: systemFit.summary,
    lessIdealContext: systemFit.caution,
    bestFormationFits: bestFormations,
    bestTeams,
    profileSummary: `${metrics.playerArchetype || metrics.primaryTacticalRoleLabel || metrics.exactPosition} profile with strongest tactical translation into ${bestFormations.slice(0, 2).join(' / ')} structures.`,
    fitConfidence: bestTeams[0]?.fitConfidence || 'Moderate confidence'
  };
}
