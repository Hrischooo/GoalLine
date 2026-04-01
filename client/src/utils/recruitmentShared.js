import { computeDisplayMetrics, toNumber } from './playerMetrics';
import { FORMATION_TEMPLATES, enrichPlayer, getSlotCandidateScore } from './teamAnalytics';
import { getRadarLookup, titleCase } from './scoutingInsightHelpers';

export const REPLACEMENT_MODES = {
  direct: { id: 'direct', label: 'Direct Replacement' },
  younger: { id: 'younger', label: 'Younger Replacement' },
  higherUpside: { id: 'higherUpside', label: 'Higher-Upside Replacement' },
  safer: { id: 'safer', label: 'Safer Replacement' },
  squadDepth: { id: 'squadDepth', label: 'Squad-Depth Replacement' }
};

export function getTeamFormation(team = {}) {
  return team?.bestXI?.formation || team?.detectedFormation || team?.preferred_formation || '4-3-3';
}

export function getTeamFormationSlots(team = {}) {
  return FORMATION_TEMPLATES[getTeamFormation(team)] || FORMATION_TEMPLATES['4-3-3'] || [];
}

export function getIdentitySignals(team = {}) {
  const identity = String(team?.tacticalIdentitySummary || team?.play_style || '').toLowerCase();

  return {
    raw: identity,
    possession: identity.includes('possession') || identity.includes('control'),
    creation: identity.includes('creation') || identity.includes('creator'),
    direct: identity.includes('direct') || identity.includes('transition'),
    strikerFocused: identity.includes('striker'),
    wide: identity.includes('wide'),
    defensive: identity.includes('defensively stable') || identity.includes('defensive')
  };
}

export function getSeverityLabel(score) {
  if (score >= 76) {
    return 'High';
  }

  if (score >= 52) {
    return 'Medium';
  }

  return 'Low';
}

export function getFitTier(score) {
  if (score >= 80) {
    return 'Strong';
  }

  if (score >= 68) {
    return 'Good';
  }

  if (score >= 56) {
    return 'Moderate';
  }

  return 'Weak';
}

export function getNeedMatchScore(metrics = {}, need = null) {
  if (!need) {
    return 48;
  }

  const positionScore = (need.positions || []).includes(metrics.exactPosition)
    ? 100
    : (need.positionModels || []).includes(metrics.positionModel)
      ? 86
      : 42;
  const roleScore = (need.roleKeys || []).includes(metrics.primaryTacticalRole)
    ? 100
    : (need.roleKeys || []).includes(metrics.secondaryTacticalRole)
      ? 84
      : 56;
  const categoryScore = Object.entries(need.categoryWeights || {}).length
    ? Object.entries(need.categoryWeights).reduce((sum, [key, weight]) => sum + toNumber(metrics[`${key}Score`]) * toNumber(weight), 0)
    : toNumber(metrics.finalOVR);
  const radarLookup = getRadarLookup(metrics);
  const axisScore = Object.entries(need.axisWeights || {}).length
    ? Object.entries(need.axisWeights).reduce((sum, [key, weight]) => sum + toNumber(radarLookup[key]?.value) * toNumber(weight), 0)
    : categoryScore;

  return Math.round(0.36 * positionScore + 0.24 * roleScore + 0.22 * categoryScore + 0.18 * axisScore);
}

export function getBestSlotForPlayer(team = {}, player, ratingIndex = {}) {
  if (!player) {
    return null;
  }

  const enrichedCandidate = enrichPlayer(player, ratingIndex);
  const slots = getTeamFormationSlots(team);
  const incumbentBySlotId = Object.fromEntries((team?.bestXI?.xi || []).map((slot) => [slot.slotId, slot]));

  return slots
    .map((slot) => {
      const candidateScore = getSlotCandidateScore(enrichedCandidate, slot);
      const incumbent = incumbentBySlotId[slot.id] || null;
      const upgradeDelta = incumbent ? candidateScore.slotAdjustedEffectiveRating - toNumber(incumbent.slotAdjustedEffectiveRating) : candidateScore.slotAdjustedEffectiveRating;

      return {
        ...candidateScore,
        incumbent,
        upgradeDelta
      };
    })
    .sort((left, right) => {
      if (right.slotAdjustedEffectiveRating !== left.slotAdjustedEffectiveRating) {
        return right.slotAdjustedEffectiveRating - left.slotAdjustedEffectiveRating;
      }

      return right.upgradeDelta - left.upgradeDelta;
    })[0];
}

export function getSlotRoleDescription(slot = {}, metrics = {}) {
  const roleLabel = metrics?.primaryTacticalRoleLabel || metrics?.playerArchetype || metrics?.exactPosition || slot?.slotLabel || 'role';
  return `${roleLabel} in ${slot?.slotLabel || metrics?.exactPosition || 'the structure'}`;
}

export function describeUpgradeLabel(upgradeDelta, fitScore) {
  if (upgradeDelta >= 3 && fitScore >= 82) {
    return 'Best XI upgrade';
  }

  if (upgradeDelta >= 0.5 && fitScore >= 76) {
    return 'Competes for XI';
  }

  if (fitScore >= 64) {
    return 'Depth fit';
  }

  return 'Weak squad fit';
}

export function scoreIdentityCompatibility(team = {}, metrics = {}, systemSuitability = null) {
  const identitySignals = getIdentitySignals(team);
  let score = 60;

  if (identitySignals.possession) {
    score += toNumber(metrics.possessionScore) >= 72 ? 16 : toNumber(metrics.possessionScore) <= 56 ? -12 : 0;
  }

  if (identitySignals.creation) {
    score += toNumber(metrics.creativityScore) >= 72 ? 14 : toNumber(metrics.creativityScore) <= 54 ? -10 : 0;
  }

  if (identitySignals.direct) {
    score += toNumber(metrics.attackScore) >= 72 ? 12 : 0;
  }

  if (identitySignals.strikerFocused && metrics.positionModel === 'ST') {
    score += toNumber(metrics.attackScore) >= 74 ? 14 : -6;
  }

  if (identitySignals.wide && ['LW/RW', 'LB/RB'].includes(metrics.positionModel)) {
    score += toNumber(metrics.attackScore) >= 68 || toNumber(metrics.creativityScore) >= 68 ? 12 : -6;
  }

  if (identitySignals.defensive && ['CB', 'DM', 'LB/RB', 'GK'].includes(metrics.positionModel)) {
    score += toNumber(metrics.defendingScore) >= 68 ? 14 : -10;
  }

  if (systemSuitability?.bestFits?.some((fit) => identitySignals.creation && fit.key === 'creation_system')) {
    score += 6;
  }

  if (systemSuitability?.bestFits?.some((fit) => identitySignals.possession && (fit.key === 'possession_heavy' || fit.key === 'controlled_buildup'))) {
    score += 6;
  }

  return Math.max(28, Math.min(Math.round(score), 96));
}

export function getMetricsForPlayer(player, ratingIndex = {}) {
  return computeDisplayMetrics(player, ratingIndex);
}

export function buildDifferenceText(baseMetrics = {}, candidateMetrics = {}) {
  const categoryKeys = ['attack', 'creativity', 'possession', 'defending'];
  const biggestGap = categoryKeys
    .map((key) => ({
      key,
      delta: toNumber(candidateMetrics[`${key}Score`]) - toNumber(baseMetrics[`${key}Score`])
    }))
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))[0];

  if (!biggestGap) {
    return 'Very similar category balance overall.';
  }

  return biggestGap.delta >= 0
    ? `Offers more ${biggestGap.key} than the current profile.`
    : `Offers less ${biggestGap.key} than the current profile.`;
}

export function humanizeLine(line = '') {
  return titleCase(line);
}
