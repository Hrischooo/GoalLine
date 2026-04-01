import { buildFormationFitProfile } from './formationFit';
import { buildSquadGapFinderProfile } from './squadGapFinder';
import { buildSystemSuitabilityProfile } from './systemSuitability';
import {
  getBestSlotForPlayer,
  getFitTier,
  getNeedMatchScore,
  getSlotRoleDescription,
  scoreIdentityCompatibility
} from './recruitmentShared';
import { computeDisplayMetrics, toNumber } from './playerMetrics';

function getUpgradeLevel(bestSlot, overallFitScore) {
  const delta = toNumber(bestSlot?.upgradeDelta || 0);

  if (delta >= 3 && overallFitScore >= 78) {
    return 'major';
  }

  if (delta >= 1 && overallFitScore >= 68) {
    return 'moderate';
  }

  if (delta >= 0 && overallFitScore >= 58) {
    return 'minor';
  }

  return 'depth-only';
}

function getSystemFitSummary(systemSuitability, team) {
  if (!systemSuitability?.summary) {
    return `System fit is unclear for ${team.displayName || team.name}.`;
  }

  return systemSuitability.summary;
}

function buildTopFitReasons({ bestNeed, bestSlot, styleScore, formationFit, systemSuitability, bestTargetRole, bestTargetSlot, upgradeLevel, team }) {
  const reasons = [];

  if (bestNeed && bestNeed.matchScore >= 72) {
    reasons.push(`Directly addresses the ${bestNeed.need.title.toLowerCase()}.`);
  }

  if (bestSlot && bestSlot.fitScore >= 82) {
    reasons.push(`Natural slot fit as ${bestTargetRole.toLowerCase()} in ${bestTargetSlot}.`);
  }

  if (upgradeLevel === 'major' || upgradeLevel === 'moderate') {
    reasons.push(`Projects as a ${upgradeLevel} best-XI upgrade over the current option.`);
  }

  if (formationFit?.fitScore >= 76) {
    reasons.push(`Strong formation translation in ${formationFit.formation}.`);
  }

  if (styleScore >= 72) {
    reasons.push(`Fits the current team identity: ${String(team.tacticalIdentitySummary || '').toLowerCase()}.`);
  }

  if (systemSuitability?.bestFits?.length) {
    reasons.push(`System fit is strongest in ${systemSuitability.bestFits[0].label.toLowerCase()} environments.`);
  }

  return reasons.slice(0, 3);
}

function buildTopConcerns({ bestNeed, bestSlot, styleScore, formationFit, metrics, team, upgradeLevel }) {
  const concerns = [];

  if (bestNeed && bestNeed.matchScore <= 58) {
    concerns.push('Does not line up cleanly with the team’s top-priority gap.');
  }

  if (bestSlot && bestSlot.fitScore <= 72) {
    concerns.push(`Slot fit for ${bestSlot.slotLabel} is only partial.`);
  }

  if (formationFit?.fitScore <= 66) {
    concerns.push('The current team shape is not the cleanest formation context for this player.');
  }

  if (String(team.tacticalIdentitySummary || '').toLowerCase().includes('possession') && toNumber(metrics.possessionScore) <= 58) {
    concerns.push('Ball security is lighter than ideal for a control-oriented side.');
  }

  if (String(team.tacticalIdentitySummary || '').toLowerCase().includes('defensive') && toNumber(metrics.defendingScore) <= 46) {
    concerns.push('Defensive workload may expose the profile in this team context.');
  }

  if (upgradeLevel === 'depth-only') {
    concerns.push('Looks more like a depth addition than a clear starter upgrade.');
  }

  return concerns.slice(0, 3);
}

function getBestNeedMatch(metrics, gapProfile) {
  return (gapProfile?.needs || [])
    .map((need) => ({
      need,
      matchScore: getNeedMatchScore(metrics, need)
    }))
    .sort((left, right) => right.matchScore - left.matchScore)[0] || null;
}

function getFormationFitForTeam(formationProfile, team) {
  const teamFormation = team?.bestXI?.formation || team?.detectedFormation || team?.preferred_formation || '4-3-3';
  return formationProfile?.byFormation?.[teamFormation] || formationProfile?.bestFits?.[0] || null;
}

export function buildPlayerFitProfile(player, team, ratingIndex = {}, options = {}) {
  if (!player || !team) {
    return {
      overallFitScore: 0,
      fitTier: 'Weak',
      bestTargetRole: 'Unavailable',
      bestTargetSlot: 'Unavailable',
      upgradesBestXI: false,
      upgradeLevel: 'depth-only',
      topFitReasons: [],
      topConcerns: ['Team or player data is unavailable.'],
      formationFitSummary: 'Unavailable',
      systemFitSummary: 'Unavailable',
      formationFits: []
    };
  }

  const metrics = options.metrics || computeDisplayMetrics(player, ratingIndex);
  const gapProfile = options.gapProfile || buildSquadGapFinderProfile(team);
  const formationProfile = options.formationProfile || buildFormationFitProfile(player, ratingIndex, { limit: 4 });
  const systemSuitability = options.systemSuitability || buildSystemSuitabilityProfile(player, metrics);
  const bestNeed = getBestNeedMatch(metrics, gapProfile);
  const bestSlot = getBestSlotForPlayer(team, player, ratingIndex);
  const selectedFormationFit = getFormationFitForTeam(formationProfile, team);
  const styleScore = scoreIdentityCompatibility(team, metrics, systemSuitability);
  const needRelevanceScore = bestNeed?.matchScore || 48;
  const positionFitScore = bestSlot ? Math.round(toNumber(bestSlot.positionFitScore) * 100) : 44;
  const roleFitScore = bestSlot ? Math.round(toNumber(bestSlot.roleFitScore) * 100) : 44;
  const formationSlotFitScore = selectedFormationFit?.fitScore || 54;
  const upgradeImpactScore = bestSlot ? Math.max(28, Math.min(94, 56 + toNumber(bestSlot.upgradeDelta) * 7)) : 42;
  const overallFitScore = Math.round(
    0.2 * positionFitScore +
      0.18 * roleFitScore +
      0.16 * styleScore +
      0.16 * formationSlotFitScore +
      0.18 * needRelevanceScore +
      0.12 * upgradeImpactScore
  );
  const bestTargetRole = bestSlot ? getSlotRoleDescription(bestSlot, metrics) : metrics.primaryTacticalRoleLabel || metrics.exactPosition;
  const bestTargetSlot = bestSlot?.slotLabel || metrics.exactPosition || 'N/A';
  const upgradeLevel = getUpgradeLevel(bestSlot, overallFitScore);
  const upgradesBestXI = upgradeLevel === 'major' || upgradeLevel === 'moderate' || upgradeLevel === 'minor';
  const topFitReasons = buildTopFitReasons({
    bestNeed,
    bestSlot,
    styleScore,
    formationFit: selectedFormationFit,
    systemSuitability,
    bestTargetRole,
    bestTargetSlot,
    upgradeLevel,
    team
  });
  const topConcerns = buildTopConcerns({
    bestNeed,
    bestSlot,
    styleScore,
    formationFit: selectedFormationFit,
    metrics,
    team,
    upgradeLevel
  });

  return {
    overallFitScore,
    fitScore: overallFitScore,
    fitTier: getFitTier(overallFitScore),
    bestTargetRole,
    bestTargetSlot,
    upgradesBestXI,
    upgradeLevel,
    expectedRole: `${bestTargetRole} in ${team.bestXI?.formation || team.detectedFormation || 'the current structure'}`,
    topFitReasons,
    topConcerns,
    formationFitSummary: selectedFormationFit
      ? `${selectedFormationFit.formation} is the cleanest current-shape fit via ${selectedFormationFit.expectedRole.toLowerCase()}.`
      : 'Current-shape formation fit is unclear.',
    systemFitSummary: getSystemFitSummary(systemSuitability, team),
    selectedFormationFit,
    formationFits: formationProfile.bestFits || [],
    systemSuitability,
    bestNeed: bestNeed ? { ...bestNeed.need, matchScore: bestNeed.matchScore } : null,
    bestSlot,
    positionFitScore,
    roleFitScore,
    formationSlotFitScore,
    needRelevanceScore,
    upgradeImpactScore
  };
}
