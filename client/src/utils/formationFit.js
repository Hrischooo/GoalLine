import { buildSystemSuitabilityProfile } from './systemSuitability';
import { FORMATION_TEMPLATES, enrichPlayer, getSlotCandidateScore } from './teamAnalytics';
import { toNumber } from './playerMetrics';
import { getConfidenceLabel } from './scoutingInsightHelpers';
import { getSlotRoleDescription } from './recruitmentShared';

function getFitExplanation(playerMetrics, slot, systemSuitability, fitScore) {
  const roleText = getSlotRoleDescription(slot, playerMetrics);
  const formationMentioned = (systemSuitability?.formations || []).includes(slot.formation);

  if (fitScore >= 84 && formationMentioned) {
    return `Strongest in ${slot.formation} as a ${roleText.toLowerCase()}, where the role lines up with the player's preferred system environment.`;
  }

  if (fitScore >= 76) {
    return `Good fit in ${slot.formation} as a ${roleText.toLowerCase()}, with the slot matching the player's primary role and position profile.`;
  }

  return `Playable in ${slot.formation} as a ${roleText.toLowerCase()}, but the role asks for some compromise away from the cleanest fit.`;
}

function buildLessIdealNotes(candidateFits = []) {
  return candidateFits
    .slice(-2)
    .filter((item) => item.fitScore <= 68)
    .reverse()
    .map((item) => ({
      formation: item.formation,
      note: `${item.formation} is less ideal when the role leans on ${item.expectedRole.toLowerCase()} responsibilities the profile only partly covers.`
    }));
}

export function buildFormationFitProfile(player, ratingIndex = {}, options = {}) {
  if (!player) {
    return {
      bestFits: [],
      byFormation: {},
      lessIdealNotes: [],
      confidence: 'Moderate confidence',
      summary: 'Formation fit unavailable.'
    };
  }

  const enrichedPlayer = enrichPlayer(player, ratingIndex);
  const metrics = enrichedPlayer.metrics;
  const systemSuitability = buildSystemSuitabilityProfile(player, metrics);
  const candidateFits = Object.entries(FORMATION_TEMPLATES)
    .map(([formation, slots]) => {
      const bestSlot = slots
        .map((slot) => ({
          ...slot,
          formation,
          ...getSlotCandidateScore(enrichedPlayer, slot)
        }))
        .sort((left, right) => right.slotAdjustedEffectiveRating - left.slotAdjustedEffectiveRating || right.fitScore - left.fitScore)[0];

      if (!bestSlot) {
        return null;
      }

      const relativeEffectiveness = bestSlot.slotAdjustedEffectiveRating / Math.max(toNumber(metrics.finalOVR) * 1.08, 1);
      const formationPreferenceBonus = (systemSuitability.formations || []).includes(formation) ? 8 : 0;
      const fitScore = Math.round(
        Math.max(42, Math.min(96, 54 + relativeEffectiveness * 24 + bestSlot.positionFitScore * 10 + bestSlot.roleFitScore * 10 + formationPreferenceBonus))
      );

      return {
        formation,
        fitScore,
        slotId: bestSlot.slotId,
        slotLabel: bestSlot.slotLabel,
        expectedRole: getSlotRoleDescription(bestSlot, metrics),
        explanation: getFitExplanation(metrics, bestSlot, systemSuitability, fitScore),
        positionFitScore: Math.round(bestSlot.positionFitScore * 100),
        roleFitScore: Math.round(bestSlot.roleFitScore * 100)
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.fitScore - left.fitScore || left.formation.localeCompare(right.formation));

  const bestFits = candidateFits.slice(0, options.limit || 4);

  return {
    bestFits,
    byFormation: Object.fromEntries(candidateFits.map((entry) => [entry.formation, entry])),
    lessIdealNotes: buildLessIdealNotes(candidateFits),
    confidence: getConfidenceLabel(metrics),
    summary: bestFits[0]
      ? `Best formation translation is ${bestFits[0].formation} as a ${bestFits[0].expectedRole.toLowerCase()}.`
      : 'Formation fit unavailable.'
  };
}
