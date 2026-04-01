import { FORMATION_TEMPLATES, POSITION_FIT_SCORES, enrichPlayer, getPositionFitScore, getRoleFitScore } from './formationModels';
import { formatStatValue, toNumber } from './playerMetrics';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundRating(value) {
  return Math.round(clamp(value, 1, 99));
}

function getCategoryMetric(metrics = {}, key) {
  switch (key) {
    case 'attack':
      return toNumber(metrics.attackScore || metrics.categoryScores?.attacking);
    case 'creativity':
      return toNumber(metrics.creativityScore || metrics.categoryScores?.playmaking);
    case 'possession':
      return toNumber(metrics.possessionScore || metrics.categoryScores?.possession);
    case 'defending':
      return toNumber(metrics.defendingScore || metrics.categoryScores?.defending || metrics.categoryScores?.goalkeeping);
    default:
      return 0;
  }
}

function getPositionCoverageBucket(positionFitScore) {
  if (positionFitScore <= POSITION_FIT_SCORES.emergency) {
    return 'severe';
  }

  if (positionFitScore <= POSITION_FIT_SCORES.familyFallback) {
    return 'mild';
  }

  return 'natural';
}

function getSlotDemandProfile(formation, slot) {
  const slotId = slot.id;
  const isWingBack = slotId.includes('wb');
  const isFullBack = ['lb', 'rb'].includes(slotId);
  const isCentreBack = ['lcb', 'cb', 'rcb'].includes(slotId);
  const isDoublePivot = ['ldm', 'rdm'].includes(slotId);
  const isWideMidfielder = ['lm', 'rm'].includes(slotId);
  const isInterior = ['lcm', 'rcm', 'cm'].includes(slotId);
  const isTwoStrikerShape = ['4-4-2', '3-5-2', '4-1-2-1-2', '5-3-2'].includes(formation);

  if (slotId === 'gk') {
    return {
      categoryWeights: { defending: 0.62, possession: 0.24, creativity: 0.04, attack: 0.1 },
      tacticalTag: 'build-up goalkeeper',
      balanceTag: 'goalkeeper'
    };
  }

  if (isCentreBack) {
    return {
      categoryWeights:
        formation.startsWith('3') || formation.startsWith('5')
          ? { defending: 0.46, possession: 0.24, creativity: 0.12, attack: 0.18 }
          : { defending: 0.5, possession: 0.22, creativity: 0.08, attack: 0.2 },
      tacticalTag: formation.startsWith('3') || formation.startsWith('5') ? 'wide centre-back / stopper' : 'centre-back',
      balanceTag: 'centre_back'
    };
  }

  if (isWingBack) {
    return {
      categoryWeights: { defending: 0.28, possession: 0.18, creativity: 0.18, attack: 0.36 },
      tacticalTag: 'wing-back support profile',
      balanceTag: 'wide_support'
    };
  }

  if (isFullBack) {
    return {
      categoryWeights: { defending: 0.32, possession: 0.22, creativity: 0.16, attack: 0.3 },
      tacticalTag: 'full-back lane support',
      balanceTag: 'wide_support'
    };
  }

  if (slotId === 'dm') {
    return {
      categoryWeights: { defending: 0.34, possession: 0.3, creativity: 0.14, attack: 0.22 },
      tacticalTag: 'single-pivot anchor',
      balanceTag: 'anchor'
    };
  }

  if (isDoublePivot) {
    return {
      categoryWeights: { defending: 0.3, possession: 0.28, creativity: 0.16, attack: 0.26 },
      tacticalTag: 'double-pivot balance piece',
      balanceTag: 'pivot'
    };
  }

  if (slotId === 'cam') {
    return {
      categoryWeights: { defending: 0.08, possession: 0.2, creativity: 0.42, attack: 0.3 },
      tacticalTag: 'central advanced creator',
      balanceTag: 'creator'
    };
  }

  if (isWideMidfielder) {
    return {
      categoryWeights: { defending: 0.24, possession: 0.18, creativity: 0.24, attack: 0.34 },
      tacticalTag: 'wide midfield support',
      balanceTag: 'wide_support'
    };
  }

  if (isInterior) {
    return {
      categoryWeights:
        formation === '4-3-3'
          ? { defending: 0.18, possession: 0.28, creativity: 0.28, attack: 0.26 }
          : formation === '4-1-4-1'
            ? { defending: 0.24, possession: 0.28, creativity: 0.24, attack: 0.24 }
            : { defending: 0.22, possession: 0.26, creativity: 0.24, attack: 0.28 },
      tacticalTag: formation === '4-3-3' ? 'interior midfielder' : 'central support midfielder',
      balanceTag: 'interior'
    };
  }

  if (['lw', 'rw'].includes(slotId)) {
    return {
      categoryWeights: { defending: 0.14, possession: 0.14, creativity: 0.26, attack: 0.46 },
      tacticalTag: 'wide attacking threat',
      balanceTag: 'wide_forward'
    };
  }

  if (['st', 'lst', 'rst'].includes(slotId)) {
    return {
      categoryWeights: isTwoStrikerShape
        ? { defending: 0.12, possession: 0.16, creativity: 0.18, attack: 0.54 }
        : { defending: 0.1, possession: 0.12, creativity: 0.16, attack: 0.62 },
      tacticalTag: isTwoStrikerShape ? 'front-two striker role' : 'focal striker role',
      balanceTag: 'striker'
    };
  }

  return {
    categoryWeights: { defending: 0.25, possession: 0.25, creativity: 0.25, attack: 0.25 },
    tacticalTag: slot.label,
    balanceTag: slot.line
  };
}

function getWeightedCategoryAlignment(metrics, categoryWeights) {
  return Object.entries(categoryWeights).reduce((sum, [key, weight]) => sum + getCategoryMetric(metrics, key) * toNumber(weight), 0);
}

function getOutOfPositionPenalty(positionFitScore) {
  if (positionFitScore <= POSITION_FIT_SCORES.emergency) {
    return 18;
  }

  if (positionFitScore <= POSITION_FIT_SCORES.familyFallback) {
    return 8;
  }

  if (positionFitScore < POSITION_FIT_SCORES.exact) {
    return 3;
  }

  return 0;
}

function getRolePenalty(roleFitScore) {
  if (roleFitScore <= 0.8) {
    return 6;
  }

  if (roleFitScore <= 0.84) {
    return 3;
  }

  return 0;
}

function buildSelectionReason(metrics, slot, demandProfile, categoryWeights, positionFitScore, roleFitScore) {
  const categoryEntries = Object.entries(categoryWeights)
    .map(([key, weight]) => ({
      key,
      weight,
      score: getCategoryMetric(metrics, key)
    }))
    .sort((left, right) => right.weight * right.score - left.weight * left.score);
  const leadCategory = categoryEntries[0]?.key || 'role fit';
  const supportCategory = categoryEntries[1]?.key || 'shape balance';

  if (positionFitScore >= 0.93 && roleFitScore >= 0.92) {
    return `Best fit as ${slot.label} due to strong ${leadCategory} and ${supportCategory} support for the ${demandProfile.tacticalTag}.`;
  }

  if (positionFitScore <= 0.82) {
    return `Used in ${slot.label} mainly on quality, but the fit is compromised by a partial positional translation.`;
  }

  return `Works in ${slot.label} because ${leadCategory} helps cover the main ${demandProfile.tacticalTag} demands.`;
}

export function scorePlayerForSlot(player, slot, formation) {
  const demandProfile = getSlotDemandProfile(formation, slot);
  const positionFitScore = getPositionFitScore(player, slot);
  const roleFitScore = getRoleFitScore(player.metrics, slot);
  const categoryAlignment = getWeightedCategoryAlignment(player.metrics, demandProfile.categoryWeights);
  const reliabilityScore = Math.round(toNumber(player.metrics?.reliabilityModifier) * 100);
  const outOfPositionPenalty = getOutOfPositionPenalty(positionFitScore);
  const rolePenalty = getRolePenalty(roleFitScore);
  const positionBonus = positionFitScore === POSITION_FIT_SCORES.exact ? 8 : positionFitScore >= POSITION_FIT_SCORES.primaryFallback ? 4 : 0;
  const slotScore = clamp(
    0.34 * toNumber(player.finalOVR) +
      0.18 * positionFitScore * 100 +
      0.16 * roleFitScore * 100 +
      0.22 * categoryAlignment +
      0.06 * reliabilityScore +
      0.04 * toNumber(slot.weight) * 100 +
      positionBonus -
      outOfPositionPenalty -
      rolePenalty,
    1,
    99
  );

  return {
    player,
    slotId: slot.id,
    slotLabel: slot.label,
    line: slot.line,
    positions: slot.positions,
    weight: slot.weight,
    demandProfile,
    categoryAlignment: Number(categoryAlignment.toFixed(2)),
    positionFitScore: Number(positionFitScore.toFixed(2)),
    roleFitScore: Number(roleFitScore.toFixed(2)),
    reliabilityScore,
    outOfPositionPenalty,
    slotAdjustedEffectiveRating: Number(slotScore.toFixed(2)),
    fitScore: Number((100 * positionFitScore * roleFitScore).toFixed(1)),
    selectionReason: buildSelectionReason(player.metrics, slot, demandProfile, demandProfile.categoryWeights, positionFitScore, roleFitScore)
  };
}

function buildCostMatrix(slots, candidateScores, paddedPlayersCount) {
  const maxScore = 120;
  const rows = slots.length;
  const cols = paddedPlayersCount;
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => {
      const score = candidateScores[rowIndex]?.[colIndex]?.slotAdjustedEffectiveRating ?? 0;
      return maxScore - score;
    })
  );
}

function solveAssignment(costMatrix) {
  const rows = costMatrix.length;
  const cols = costMatrix[0]?.length || 0;

  if (!rows || !cols) {
    return [];
  }

  const u = new Array(rows + 1).fill(0);
  const v = new Array(cols + 1).fill(0);
  const p = new Array(cols + 1).fill(0);
  const way = new Array(cols + 1).fill(0);

  for (let i = 1; i <= rows; i += 1) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(cols + 1).fill(Infinity);
    const used = new Array(cols + 1).fill(false);

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;

      for (let j = 1; j <= cols; j += 1) {
        if (used[j]) {
          continue;
        }

        const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];

        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }

        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }

      for (let j = 0; j <= cols; j += 1) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }

      j0 = j1;
    } while (p[j0] !== 0);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const assignment = new Array(rows).fill(-1);

  for (let j = 1; j <= cols; j += 1) {
    if (p[j] > 0 && p[j] <= rows) {
      assignment[p[j] - 1] = j - 1;
    }
  }

  return assignment;
}

function average(values = []) {
  return values.length ? values.reduce((sum, value) => sum + toNumber(value), 0) / values.length : 0;
}

function buildLineRatings(xi = []) {
  const grouped = {
    attack: xi.filter((slot) => slot.line === 'attack'),
    midfield: xi.filter((slot) => slot.line === 'midfield'),
    defense: xi.filter((slot) => slot.line === 'defense'),
    goalkeeper: xi.filter((slot) => slot.line === 'goalkeeper')
  };

  return Object.fromEntries(
    Object.entries(grouped).map(([line, slots]) => [
      line,
      slots.length ? roundRating(slots.reduce((sum, slot) => sum + slot.slotAdjustedEffectiveRating, 0) / slots.length) : 0
    ])
  );
}

function buildOutOfPositionSummary(xi = []) {
  const severe = xi.filter((slot) => slot.positionFitScore <= POSITION_FIT_SCORES.emergency).length;
  const mild = xi.filter((slot) => slot.positionFitScore > POSITION_FIT_SCORES.emergency && slot.positionFitScore <= POSITION_FIT_SCORES.familyFallback).length;
  const light = xi.filter((slot) => slot.positionFitScore > POSITION_FIT_SCORES.familyFallback && slot.positionFitScore < POSITION_FIT_SCORES.exact).length;
  const totalPenalty = xi.reduce((sum, slot) => sum + toNumber(slot.outOfPositionPenalty), 0);

  let text = 'No meaningful out-of-position compromises.';

  if (severe) {
    text = `${severe} severe compromise${severe > 1 ? 's' : ''} and ${mild + light} lighter adaptation${mild + light !== 1 ? 's' : ''}.`;
  } else if (mild || light) {
    text = `${mild + light} mild adaptation${mild + light !== 1 ? 's' : ''}, but no severe positional stretch.`;
  }

  return {
    severe,
    mild,
    light,
    totalPenalty: Number(totalPenalty.toFixed(1)),
    text
  };
}

function buildRoleCoherenceScore(xi = [], formation) {
  let score = 72;
  const midfield = xi.filter((slot) => slot.line === 'midfield');
  const defenders = xi.filter((slot) => slot.line === 'defense');
  const attackers = xi.filter((slot) => slot.line === 'attack');
  const pivotSlots = xi.filter((slot) => ['dm', 'ldm', 'rdm'].includes(slot.slotId));
  const camSlot = xi.find((slot) => slot.slotId === 'cam');
  const wideSlots = xi.filter((slot) => ['lw', 'rw', 'lm', 'rm', 'lwb', 'rwb', 'lb', 'rb'].includes(slot.slotId));
  const strikerSlots = xi.filter((slot) => ['st', 'lst', 'rst'].includes(slot.slotId));
  const midfieldDefending = average(midfield.map((slot) => getCategoryMetric(slot.assignedPlayer?.metrics, 'defending')));
  const midfieldPossession = average(midfield.map((slot) => getCategoryMetric(slot.assignedPlayer?.metrics, 'possession')));
  const teamCreation = average([...midfield, ...attackers].map((slot) => getCategoryMetric(slot.assignedPlayer?.metrics, 'creativity')));
  const backlinePossession = average([...defenders, ...pivotSlots].map((slot) => getCategoryMetric(slot.assignedPlayer?.metrics, 'possession')));
  const wideNaturalFit = average(wideSlots.map((slot) => slot.positionFitScore * 100));

  if (pivotSlots.length === 1) {
    const anchor = pivotSlots[0];
    const anchorDefending = getCategoryMetric(anchor.assignedPlayer?.metrics, 'defending');
    const anchorPossession = getCategoryMetric(anchor.assignedPlayer?.metrics, 'possession');
    score += anchorDefending >= 62 && anchorPossession >= 60 ? 10 : -12;
  }

  if (pivotSlots.length === 2) {
    const pivotDefending = average(pivotSlots.map((slot) => getCategoryMetric(slot.assignedPlayer?.metrics, 'defending')));
    const pivotPossession = average(pivotSlots.map((slot) => getCategoryMetric(slot.assignedPlayer?.metrics, 'possession')));
    score += pivotDefending >= 60 && pivotPossession >= 62 ? 10 : -10;
  }

  if (camSlot) {
    score += getCategoryMetric(camSlot.assignedPlayer?.metrics, 'creativity') >= 70 ? 9 : -9;
  }

  if (['4-3-3', '4-1-4-1', '4-1-2-1-2'].includes(formation)) {
    score += midfieldDefending >= 56 && teamCreation >= 64 ? 8 : -8;
  }

  if (formation.startsWith('3') || formation.startsWith('5')) {
    const outerCenterBacks = xi.filter((slot) => ['lcb', 'rcb'].includes(slot.slotId));
    const wingBacks = xi.filter((slot) => ['lwb', 'rwb'].includes(slot.slotId));
    score += average(outerCenterBacks.map((slot) => slot.positionFitScore * 100)) >= 88 ? 4 : -5;
    score += average(wingBacks.map((slot) => slot.positionFitScore * 100)) >= 88 ? 6 : -8;
  }

  if (wideSlots.length) {
    score += wideNaturalFit >= 88 ? 6 : -8;
  }

  if (strikerSlots.length >= 2) {
    const secondStrikerValue = average(strikerSlots.map((slot) => getCategoryMetric(slot.assignedPlayer?.metrics, 'creativity')));
    score += secondStrikerValue >= 52 ? 5 : -4;
  }

  score += teamCreation >= 62 ? 4 : -4;
  score += midfieldPossession >= 60 ? 4 : -4;
  score += backlinePossession >= 58 ? 4 : -6;

  return clamp(Math.round(score), 40, 100);
}

function buildLineBalanceScore(lineRatings = {}) {
  const values = Object.values(lineRatings).filter((value) => value > 0);

  if (!values.length) {
    return 40;
  }

  const avg = average(values);
  const spread = Math.max(...values) - Math.min(...values);
  const weakest = Math.min(...values);
  return clamp(Math.round(84 - spread * 1.3 - Math.max(0, 62 - weakest) * 0.8 + Math.max(0, avg - 68) * 0.5), 38, 100);
}

function buildFormationExplanation(formation, lineupMetrics = {}) {
  const reasons = [];
  const { midfieldCreativity = 0, pivotSecurity = 0, wideCoverage = 0, strikerThreat = 0, outOfPositionPenaltySummary = {} } = lineupMetrics;

  if (formation === '4-2-3-1' && midfieldCreativity >= 66 && pivotSecurity >= 62) {
    reasons.push('strong central creator options and balanced double-pivot support');
  }

  if (formation === '4-3-3' && midfieldCreativity >= 62 && wideCoverage >= 86) {
    reasons.push('natural wide attackers with strong interior support');
  }

  if (['3-5-2', '3-4-3', '5-3-2', '5-2-3'].includes(formation) && wideCoverage >= 86) {
    reasons.push('wing-back or wide-support depth that keeps the outside lanes natural');
  }

  if (['4-4-2', '3-5-2', '4-1-2-1-2', '5-3-2'].includes(formation) && strikerThreat >= 68) {
    reasons.push('enough front-line quality to support a two-forward structure');
  }

  if (outOfPositionPenaltySummary.severe === 0 && outOfPositionPenaltySummary.mild <= 2) {
    reasons.push('very few positional compromises');
  }

  if (!reasons.length) {
    reasons.push('the best overall slot quality and line balance in the current squad');
  }

  return `Best in ${formation} because it gives the squad ${reasons.slice(0, 2).join(' and ')}.`;
}

function evaluateFormationLineup(formation, xi = []) {
  const lineRatings = buildLineRatings(xi);
  const slotFitAverage = average(xi.map((slot) => slot.fitScore));
  const avgSlotScore = average(xi.map((slot) => slot.slotAdjustedEffectiveRating));
  const positionCoverageScore = clamp(
    Math.round(average(xi.map((slot) => slot.positionFitScore * 100)) - xi.filter((slot) => slot.positionFitScore <= POSITION_FIT_SCORES.emergency).length * 8),
    38,
    100
  );
  const roleCoherenceScore = buildRoleCoherenceScore(xi, formation);
  const lineBalanceScore = buildLineBalanceScore(lineRatings);
  const outOfPositionPenaltySummary = buildOutOfPositionSummary(xi);
  const midfieldSlots = xi.filter((slot) => slot.line === 'midfield');
  const attackSlots = xi.filter((slot) => slot.line === 'attack');
  const pivotSlots = xi.filter((slot) => ['dm', 'ldm', 'rdm'].includes(slot.slotId));
  const wideSlots = xi.filter((slot) => ['lw', 'rw', 'lm', 'rm', 'lwb', 'rwb'].includes(slot.slotId));
  const totalFormationScore = clamp(
    Math.round(0.46 * avgSlotScore + 0.16 * slotFitAverage + 0.14 * roleCoherenceScore + 0.12 * positionCoverageScore + 0.12 * lineBalanceScore),
    1,
    99
  );

  return {
    lineRatings,
    slotFitAverage: Number(slotFitAverage.toFixed(2)),
    avgSlotScore: Number(avgSlotScore.toFixed(2)),
    roleCoherenceScore,
    positionCoverageScore,
    lineBalanceScore,
    totalFormationScore,
    outOfPositionPenaltySummary,
    midfieldCreativity: average(midfieldSlots.map((slot) => getCategoryMetric(slot.assignedPlayer?.metrics, 'creativity'))),
    pivotSecurity: average(pivotSlots.map((slot) => (getCategoryMetric(slot.assignedPlayer?.metrics, 'defending') + getCategoryMetric(slot.assignedPlayer?.metrics, 'possession')) / 2)),
    wideCoverage: average(wideSlots.map((slot) => slot.positionFitScore * 100)),
    strikerThreat: average(attackSlots.map((slot) => getCategoryMetric(slot.assignedPlayer?.metrics, 'attack')))
  };
}

function refineLineup(formation, xi, slotCandidateMap) {
  let currentXi = [...xi];
  let currentMetrics = evaluateFormationLineup(formation, currentXi);

  for (let round = 0; round < 2; round += 1) {
    let improved = false;
    const selectedNames = new Set(currentXi.map((slot) => slot.assignedPlayer?.player));

    for (let index = 0; index < currentXi.length; index += 1) {
      const slot = currentXi[index];
      const candidates = (slotCandidateMap[slot.slotId] || []).slice(0, 5);

      for (const candidate of candidates) {
        if (candidate.player?.player !== slot.assignedPlayer?.player && selectedNames.has(candidate.player?.player)) {
          continue;
        }

        const trialXi = currentXi.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...candidate, assignedPlayer: candidate.player } : entry));
        const trialMetrics = evaluateFormationLineup(formation, trialXi);

        if (trialMetrics.totalFormationScore > currentMetrics.totalFormationScore + 0.2) {
          currentXi = trialXi;
          currentMetrics = trialMetrics;
          improved = true;
          break;
        }
      }

      if (improved) {
        break;
      }
    }

    if (!improved) {
      break;
    }
  }

  return {
    xi: currentXi,
    metrics: currentMetrics
  };
}

export function pickBestXiForFormation(players = [], formation, ratingIndex = {}) {
  const slots = FORMATION_TEMPLATES[formation] || [];
  const enrichedPlayers = (players || []).map((player) => (player?.metrics ? player : enrichPlayer(player, ratingIndex)));

  if (!slots.length) {
    return {
      formation,
      slots: [],
      xi: [],
      formationFitScore: 0,
      totalFormationScore: 0,
      slotFitAverage: 0,
      roleCoherenceScore: 0,
      positionCoverageScore: 0,
      lineBalanceScore: 0,
      outOfPositionPenaltySummary: { severe: 0, mild: 0, light: 0, totalPenalty: 0, text: 'No data.' },
      explanationSummary: 'No supported slot model is available for this formation.'
    };
  }

  const paddedPlayers = [...enrichedPlayers];
  while (paddedPlayers.length < slots.length) {
    paddedPlayers.push({
      player: `Unavailable ${paddedPlayers.length}`,
      finalOVR: 1,
      metrics: { finalOVR: 1, exactPosition: 'N/A', primaryTacticalRoleLabel: '-', playerArchetype: '-', reliabilityModifier: 0.5 }
    });
  }

  const candidateScores = slots.map((slot) => paddedPlayers.map((player) => scorePlayerForSlot(player, slot, formation)));
  const assignment = solveAssignment(buildCostMatrix(slots, candidateScores, paddedPlayers.length));
  const xi = slots
    .map((slot, slotIndex) => {
      const assignedIndex = assignment[slotIndex];
      const candidate = candidateScores[slotIndex]?.[assignedIndex];

      if (!candidate) {
        return null;
      }

      return {
        slotId: slot.id,
        slotLabel: slot.label,
        line: slot.line,
        positions: slot.positions,
        weight: slot.weight,
        assignedPlayer: candidate.player,
        positionFitScore: candidate.positionFitScore,
        roleFitScore: candidate.roleFitScore,
        categoryAlignment: candidate.categoryAlignment,
        reliabilityScore: candidate.reliabilityScore,
        outOfPositionPenalty: candidate.outOfPositionPenalty,
        selectionReason: candidate.selectionReason,
        demandProfile: candidate.demandProfile,
        slotAdjustedEffectiveRating: candidate.slotAdjustedEffectiveRating,
        fitScore: candidate.fitScore
      };
    })
    .filter(Boolean)
    .filter((slot) => slot.assignedPlayer?.finalOVR > 1);

  const slotCandidateMap = Object.fromEntries(
    slots.map((slot, slotIndex) => [
      slot.id,
      [...candidateScores[slotIndex]]
        .filter((entry) => entry.player?.finalOVR > 1)
        .sort((left, right) => right.slotAdjustedEffectiveRating - left.slotAdjustedEffectiveRating || right.reliabilityScore - left.reliabilityScore)
    ])
  );
  const refined = refineLineup(formation, xi, slotCandidateMap);
  const metrics = refined.metrics;

  return {
    formation,
    slots,
    xi: refined.xi,
    formationFitScore: metrics.totalFormationScore,
    totalFormationScore: metrics.totalFormationScore,
    slotFitAverage: metrics.slotFitAverage,
    roleCoherenceScore: metrics.roleCoherenceScore,
    positionCoverageScore: metrics.positionCoverageScore,
    lineBalanceScore: metrics.lineBalanceScore,
    outOfPositionPenaltySummary: metrics.outOfPositionPenaltySummary,
    lineRatings: metrics.lineRatings,
    explanationSummary: buildFormationExplanation(formation, metrics)
  };
}

function buildFormationConfidence(bestFormation, secondBest) {
  const gap = toNumber(bestFormation?.totalFormationScore) - toNumber(secondBest?.totalFormationScore);
  return clamp(
    0.48 * (toNumber(bestFormation?.slotFitAverage) / 100) +
      0.18 * (toNumber(bestFormation?.roleCoherenceScore) / 100) +
      0.16 * (toNumber(bestFormation?.positionCoverageScore) / 100) +
      0.1 * (toNumber(bestFormation?.lineBalanceScore) / 100) +
      clamp(gap / 18, 0, 0.08),
    0,
    1
  );
}

export function detectFormationForTeam(players = [], ratingIndex = {}, preferredFormation = '') {
  const candidates = Object.keys(FORMATION_TEMPLATES)
    .map((formation) => pickBestXiForFormation(players, formation, ratingIndex))
    .sort((left, right) => right.totalFormationScore - left.totalFormationScore || right.slotFitAverage - left.slotFitAverage);
  const bestFormation = candidates[0];
  const secondBest = candidates[1];
  const confidence = buildFormationConfidence(bestFormation, secondBest);

  return {
    detectedFormation: bestFormation?.formation || preferredFormation || '4-3-3',
    formationConfidence: Number(confidence.toFixed(2)),
    formationFitScore: Number((bestFormation?.totalFormationScore || 0).toFixed(2)),
    totalFormationScore: Number((bestFormation?.totalFormationScore || 0).toFixed(2)),
    slotFitAverage: Number((bestFormation?.slotFitAverage || 0).toFixed(2)),
    roleCoherenceScore: Number((bestFormation?.roleCoherenceScore || 0).toFixed(2)),
    positionCoverageScore: Number((bestFormation?.positionCoverageScore || 0).toFixed(2)),
    lineBalanceScore: Number((bestFormation?.lineBalanceScore || 0).toFixed(2)),
    outOfPositionPenaltySummary: bestFormation?.outOfPositionPenaltySummary || null,
    explanationSummary: bestFormation?.explanationSummary || 'No strong formation read was available.',
    chosenXI: bestFormation?.xi || [],
    lineRatings: bestFormation?.lineRatings || {},
    formationCandidates: candidates.slice(0, 3).map((candidate) => ({
      formation: candidate.formation,
      totalFormationScore: candidate.totalFormationScore,
      slotFitAverage: candidate.slotFitAverage,
      roleCoherenceScore: candidate.roleCoherenceScore,
      positionCoverageScore: candidate.positionCoverageScore,
      lineBalanceScore: candidate.lineBalanceScore,
      outOfPositionPenaltySummary: candidate.outOfPositionPenaltySummary,
      explanationSummary: candidate.explanationSummary,
      xi: candidate.xi
    }))
  };
}

export function buildLineupModesForTeam(players = [], team = {}, ratingIndex = {}) {
  const auto = detectFormationForTeam(players, ratingIndex, team.preferred_formation || team.detectedFormation || '');
  const preferredFormation =
    team.preferred_formation && FORMATION_TEMPLATES[team.preferred_formation] ? team.preferred_formation : auto.detectedFormation || '4-3-3';
  const preferredLineup = pickBestXiForFormation(players, preferredFormation, ratingIndex);
  const preferredConfidence = buildFormationConfidence(preferredLineup, auto.formationCandidates?.find((entry) => entry.formation !== preferredFormation) || auto);

  return {
    preferred: {
      mode: 'preferred',
      modeLabel: 'Preferred Tactical Shape',
      formation: preferredFormation,
      xi: preferredLineup.xi,
      lineRatings: preferredLineup.lineRatings,
      overallTeamRating: roundRating(
        0.3 * toNumber(preferredLineup.lineRatings.attack) +
          0.32 * toNumber(preferredLineup.lineRatings.midfield) +
          0.28 * toNumber(preferredLineup.lineRatings.defense) +
          0.1 * toNumber(preferredLineup.lineRatings.goalkeeper)
      ),
      formationConfidence: Number(preferredConfidence.toFixed(2)),
      formationFitScore: Number((preferredLineup.totalFormationScore || 0).toFixed(2)),
      totalFormationScore: Number((preferredLineup.totalFormationScore || 0).toFixed(2)),
      slotFitAverage: preferredLineup.slotFitAverage,
      roleCoherenceScore: preferredLineup.roleCoherenceScore,
      positionCoverageScore: preferredLineup.positionCoverageScore,
      lineBalanceScore: preferredLineup.lineBalanceScore,
      outOfPositionPenaltySummary: preferredLineup.outOfPositionPenaltySummary,
      explanationSummary:
        team.preferred_formation && team.preferred_formation === preferredFormation
          ? `Best XI inside the preferred ${preferredFormation} shape. ${preferredLineup.explanationSummary}`
          : `Preferred shape not available, so the tactical board falls back to ${preferredFormation}.`,
      qualityFlags: []
    },
    auto: {
      mode: 'auto',
      modeLabel: 'Auto Best Shape',
      formation: auto.detectedFormation,
      xi: auto.chosenXI,
      lineRatings: auto.lineRatings,
      overallTeamRating: roundRating(
        0.3 * toNumber(auto.lineRatings.attack) +
          0.32 * toNumber(auto.lineRatings.midfield) +
          0.28 * toNumber(auto.lineRatings.defense) +
          0.1 * toNumber(auto.lineRatings.goalkeeper)
      ),
      formationConfidence: auto.formationConfidence,
      formationFitScore: auto.totalFormationScore,
      totalFormationScore: auto.totalFormationScore,
      slotFitAverage: auto.slotFitAverage,
      roleCoherenceScore: auto.roleCoherenceScore,
      positionCoverageScore: auto.positionCoverageScore,
      lineBalanceScore: auto.lineBalanceScore,
      outOfPositionPenaltySummary: auto.outOfPositionPenaltySummary,
      explanationSummary: auto.explanationSummary,
      formationCandidates: auto.formationCandidates || [],
      qualityFlags: []
    }
  };
}

export function summarizeLineupMode(modeProfile) {
  if (!modeProfile) {
    return 'No tactical mode available.';
  }

  return `${modeProfile.modeLabel}: ${modeProfile.formation} · ${formatStatValue(modeProfile.totalFormationScore, '-')}`;
}
