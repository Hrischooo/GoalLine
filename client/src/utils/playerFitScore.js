import { buildFormationFitProfile } from './formationFit';
import { getSlotCandidateScore } from './formationModels';
import { buildSquadGapFinderProfile } from './squadGapFinder';
import { buildSystemSuitabilityProfile } from './systemSuitability';
import { getFitTier, getNeedMatchScore, getTeamFormationSlots, scoreIdentityCompatibility } from './recruitmentShared';
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

function getScoutingSignal(metrics = {}, key) {
  const entry = metrics?.scoutingMetricMap?.[key];
  const percentile = toNumber(entry?.percentile);

  if (percentile > 0) {
    return percentile;
  }

  return toNumber(entry?.value);
}

function getPrimaryPosition(player, metrics = {}) {
  const listedPosition = String(player?.pos || '')
    .split(/[\/,;]+/)
    .map((part) => String(part || '').trim().toUpperCase())
    .find(Boolean);

  return listedPosition === 'AM' ? 'CAM' : listedPosition || metrics.exactPosition || 'CM';
}

function inferBestRole(metrics = {}, exactPosition = 'CM') {
  const attack = toNumber(metrics.attackScore);
  const creativity = toNumber(metrics.creativityScore);
  const possession = toNumber(metrics.possessionScore);
  const defending = toNumber(metrics.defendingScore);
  const finishing = Math.max(getScoutingSignal(metrics, 'finishing_ratio'), getScoutingSignal(metrics, 'xg_diff'));
  const chanceCreation = Math.max(getScoutingSignal(metrics, 'key_pass_eff'), creativity);
  const progression = Math.max(getScoutingSignal(metrics, 'progressive_pass_rate'), possession);
  const defensiveWork = Math.max(getScoutingSignal(metrics, 'def_actions_p90'), defending);
  const duelSecurity = Math.max(getScoutingSignal(metrics, 'tackle_success'), defending);

  switch (exactPosition) {
    case 'GK':
      return progression >= 70 || possession >= 72 ? 'Sweeper Keeper' : 'Shot Stopper';
    case 'CB':
      if (progression >= 72 || possession >= 70 || chanceCreation >= 58) {
        return 'Ball-Playing Defender';
      }

      return defensiveWork >= 72 || duelSecurity >= 70 || defending >= 76 ? 'Stopper' : 'Cover Defender';
    case 'LB':
    case 'RB':
    case 'LWB':
    case 'RWB':
      if (progression >= 74 || creativity >= 72 || chanceCreation >= 66) {
        return 'Overlapping Fullback';
      }

      return possession >= 74 && defending >= 64 ? 'Inverted Fullback' : 'Defensive Fullback';
    case 'DM':
      if (defending >= 74 && (defensiveWork >= 68 || duelSecurity >= 66)) {
        return 'Ball Winner';
      }

      if (progression >= 74 || (possession >= 74 && chanceCreation >= 60)) {
        return 'Deep Lying Playmaker';
      }

      return 'Controller';
    case 'CM':
      if (defending >= 72 && (defensiveWork >= 66 || duelSecurity >= 64)) {
        return 'Ball Winner';
      }

      if (progression >= 74) {
        return 'Progressive Midfielder';
      }

      if (possession >= 76) {
        return 'Controller';
      }

      return creativity >= 72 ? 'Playmaker' : 'Progressive Midfielder';
    case 'CAM':
      if (attack >= 76 && finishing >= 70) {
        return 'Shadow Striker';
      }

      if (creativity >= 78 && chanceCreation >= 72) {
        return 'Advanced Creator';
      }

      return 'Playmaker';
    case 'LW':
    case 'RW':
      if (creativity >= 76 && chanceCreation >= 70) {
        return 'Wide Creator';
      }

      return attack >= 74 && finishing >= 68 ? 'Inside Forward' : 'Winger';
    case 'ST':
    case 'CF':
      if (creativity >= 68 && chanceCreation >= 66) {
        return 'Complete Forward';
      }

      if (defensiveWork >= 60 && defending >= 48) {
        return 'Pressing Forward';
      }

      if (attack >= 82 && finishing >= 74) {
        return 'Poacher';
      }

      return 'Advanced Forward';
    default:
      return metrics.primaryTacticalRoleLabel || metrics.playerArchetype || metrics.exactPosition || 'Role';
  }
}

function getPreferredSlots(exactPosition = 'CM', roleLabel = '') {
  switch (exactPosition) {
    case 'GK':
      return ['GK'];
    case 'CB':
      return ['CB', 'LCB', 'RCB'];
    case 'LB':
      return ['LB', 'LWB'];
    case 'RB':
      return ['RB', 'RWB'];
    case 'LWB':
      return ['LWB', 'LB'];
    case 'RWB':
      return ['RWB', 'RB'];
    case 'DM':
      return ['DM', 'LDM', 'RDM'];
    case 'CM':
      return ['LCM', 'RCM', 'CM', ...(roleLabel === 'Controller' || roleLabel === 'Deep Lying Playmaker' ? ['DM'] : [])];
    case 'CAM':
      return roleLabel === 'Shadow Striker' ? ['CAM', 'ST', 'LCM', 'RCM'] : ['CAM', 'LCM', 'RCM'];
    case 'LW':
      return roleLabel === 'Inside Forward' ? ['LW', 'LM', 'ST'] : ['LW', 'LM'];
    case 'RW':
      return roleLabel === 'Inside Forward' ? ['RW', 'RM', 'ST'] : ['RW', 'RM'];
    case 'ST':
    case 'CF':
      return ['ST', 'LST', 'RST'];
    default:
      return [exactPosition];
  }
}

function getAcceptableSlots(exactPosition = 'CM', roleLabel = '') {
  switch (exactPosition) {
    case 'CB':
      return ['LB', 'RB'];
    case 'LB':
      return ['LCB'];
    case 'RB':
      return ['RCB'];
    case 'LWB':
      return ['LW', 'LM'];
    case 'RWB':
      return ['RW', 'RM'];
    case 'DM':
      return ['CM', 'LCM', 'RCM'];
    case 'CM':
      return ['DM', 'LDM', 'RDM'];
    case 'CAM':
      return roleLabel === 'Shadow Striker' ? ['LW', 'RW'] : ['CM', 'LCM', 'RCM'];
    case 'LW':
      return ['RW', 'LWB'];
    case 'RW':
      return ['LW', 'RWB'];
    case 'ST':
    case 'CF':
      return roleLabel === 'Complete Forward' ? ['CAM'] : [];
    default:
      return [];
  }
}

function scoreSlotRealism(slot = {}, exactPosition = 'CM', roleLabel = '') {
  const slotLabel = slot.label || '';
  const preferredSlots = getPreferredSlots(exactPosition, roleLabel);
  const acceptableSlots = getAcceptableSlots(exactPosition, roleLabel);
  let score = 0;

  if (preferredSlots.includes(slotLabel)) {
    score += 18;
  } else if (acceptableSlots.includes(slotLabel)) {
    score += 8;
  } else {
    score -= 16;
  }

  if ((slot.positions || []).includes(exactPosition)) {
    score += 6;
  }

  if (exactPosition === 'CAM' && slotLabel === 'ST' && roleLabel !== 'Shadow Striker') {
    score -= 20;
  }

  if (['CM', 'DM'].includes(exactPosition) && ['LW', 'RW', 'LM', 'RM', 'ST', 'LST', 'RST'].includes(slotLabel)) {
    score -= 26;
  }

  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(exactPosition) && ['CAM', 'LW', 'RW', 'ST', 'LST', 'RST'].includes(slotLabel)) {
    score -= 34;
  }

  if (['ST', 'CF'].includes(exactPosition) && ['DM', 'LDM', 'RDM', 'CM', 'LCM', 'RCM', 'CB', 'LCB', 'RCB'].includes(slotLabel)) {
    score -= 30;
  }

  if (slot.line === 'attack' && !['LW', 'RW', 'ST', 'CF', 'CAM'].includes(exactPosition) && !(exactPosition === 'CAM' && roleLabel === 'Shadow Striker')) {
    score -= 18;
  }

  if (slot.line === 'defense' && ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(exactPosition)) {
    score -= 22;
  }

  if (slot.line === 'midfield' && exactPosition === 'GK') {
    score -= 40;
  }

  if (roleLabel === 'Wide Creator' && slotLabel === 'ST') {
    score -= 18;
  }

  if (roleLabel === 'Ball Winner' && ['CAM', 'LW', 'RW'].includes(slotLabel)) {
    score -= 24;
  }

  return score;
}

function buildRealisticBestSlot(team = {}, player, metrics = {}) {
  if (!player) {
    return null;
  }

  const exactPosition = getPrimaryPosition(player, metrics);
  const roleLabel = inferBestRole(metrics, exactPosition);
  const slots = getTeamFormationSlots(team);
  const incumbentBySlotId = Object.fromEntries((team?.bestXI?.xi || []).map((slot) => [slot.slotId, slot]));
  const candidate = {
    ...player,
    metrics,
    finalOVR: toNumber(metrics.finalOVR)
  };

  return slots
    .map((slot) => {
      const slotCandidate = getSlotCandidateScore(candidate, slot);
      const incumbent = incumbentBySlotId[slot.id] || null;
      const upgradeDelta = incumbent ? slotCandidate.slotAdjustedEffectiveRating - toNumber(incumbent.slotAdjustedEffectiveRating) : slotCandidate.slotAdjustedEffectiveRating;
      const realismScore = scoreSlotRealism(slot, exactPosition, roleLabel);
      const targetScore = slotCandidate.slotAdjustedEffectiveRating + upgradeDelta * 0.35 + realismScore;

      return {
        ...slotCandidate,
        incumbent,
        upgradeDelta,
        realismScore,
        roleLabel,
        targetScore
      };
    })
    .sort((left, right) => right.targetScore - left.targetScore || right.slotAdjustedEffectiveRating - left.slotAdjustedEffectiveRating || right.upgradeDelta - left.upgradeDelta)[0];
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

function buildTopConcerns({ bestNeed, bestSlot, formationFit, metrics, team, upgradeLevel }) {
  const concerns = [];

  if (bestNeed && bestNeed.matchScore <= 58) {
    concerns.push("Does not line up cleanly with the team's top-priority gap.");
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
  const bestSlot = buildRealisticBestSlot(team, player, metrics);
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
  const bestTargetRole = bestSlot?.roleLabel || inferBestRole(metrics, getPrimaryPosition(player, metrics));
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
    expectedRole: `${bestTargetRole} in ${bestTargetSlot}`,
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
