import { toNumber } from './playerMetrics';
import { clamp, getConfidenceLabel, getProfileSpread, getRadarLookup } from './scoutingInsightHelpers';

function buildReason(key, title, detail, points) {
  return { key, title, detail, points };
}

function getRiskLevel(score) {
  if (score >= 56) {
    return 'High';
  }

  if (score >= 28) {
    return 'Medium';
  }

  return 'Low';
}

function buildSummary(level, reasons = []) {
  if (!reasons.length) {
    return `${level} risk: solid minutes support and no major category collapse in the current profile.`;
  }

  const lead = reasons[0]?.title?.toLowerCase() || 'profile volatility';
  const support = reasons[1]?.title?.toLowerCase();

  if (!support) {
    return `${level} risk: ${lead} is the main data warning in the current projection.`;
  }

  return `${level} risk: ${lead}, with added concern around ${support}.`;
}

export function buildRiskProfile(player, metrics) {
  const radarLookup = getRadarLookup(metrics);
  const spread = getProfileSpread(metrics);
  const reasons = [];
  const minutesPlayed = toNumber(metrics.minutesPlayed);
  const attackScore = toNumber(metrics.attackScore);
  const possessionScore = toNumber(metrics.possessionScore);
  const defendingScore = toNumber(metrics.defendingScore);
  const creativityScore = toNumber(metrics.creativityScore);
  const secondaryRoleSupport = toNumber(metrics.secondaryRoleSupport);
  const primaryRoleOVR = toNumber(metrics.primaryRoleOVR);
  const retentionValue = toNumber(radarLookup.retention?.value || radarLookup.ball_security?.value || radarLookup.security?.value || possessionScore);
  const attackingAxisValue = toNumber(radarLookup.attack?.value || radarLookup.shot_threat?.value || attackScore);

  if (minutesPlayed < 900 || toNumber(metrics.reliabilityModifier) < 0.8) {
    reasons.push(
      buildReason(
        'minutes',
        'Low-minute sample risk',
        `Only ${Math.round(minutesPlayed)} minutes support the model, so the profile is less stable than a full-season sample.`,
        22
      )
    );
  }

  if (spread >= 28 && Math.min(attackScore, creativityScore, possessionScore, defendingScore) <= 44) {
    reasons.push(
      buildReason(
        'one_dimensional',
        'One-dimensional profile risk',
        'The category spread is wide, with clear dependence on a narrow set of standout strengths.',
        16
      )
    );
  }

  if (primaryRoleOVR - secondaryRoleSupport >= 9 || toNumber(metrics.tacticalRoleGap) >= 16) {
    reasons.push(
      buildReason(
        'role_dependency',
        'Role dependency risk',
        'The output is strongest in one role lane, with a visible drop once the role fit widens.',
        14
      )
    );
  }

  if (!['LW/RW', 'ST', 'CAM'].includes(metrics.positionModel) && defendingScore <= 42) {
    reasons.push(
      buildReason(
        'defensive_floor',
        'Weak defensive floor',
        'Defensive contribution is light for the role model, which lowers the safer baseline.',
        15
      )
    );
  }

  if (retentionValue <= 48 || possessionScore <= 46) {
    reasons.push(
      buildReason(
        'possession_security',
        'Weak possession security',
        'Retention and control signals are softer than ideal, creating turnover-related downside.',
        15
      )
    );
  }

  if (['CAM', 'LW/RW', 'ST'].includes(metrics.positionModel) && attackingAxisValue <= 48) {
    reasons.push(
      buildReason(
        'attacking_output',
        'Low attacking output for role',
        'The attacking floor does not fully support the demands of an advanced role.',
        14
      )
    );
  }

  if ((attackScore >= 76 || creativityScore >= 76) && (retentionValue <= 52 || toNumber(metrics.consistencyScore) <= 58)) {
    reasons.push(
      buildReason(
        'volatility',
        'Style volatility risk',
        'The upside is attractive, but the broader profile is less stable than the headline strengths suggest.',
        13
      )
    );
  }

  if ((primaryRoleOVR >= 78 || toNumber(metrics.finalOVR) >= 78) && spread >= 30 && reasons.length < 4) {
    reasons.push(
      buildReason(
        'versatility',
        'Limited versatility risk',
        'The role projection is sharp, but the profile does not show the same comfort across wider tactical demands.',
        11
      )
    );
  }

  const topReasons = reasons.sort((left, right) => right.points - left.points).slice(0, 4);
  const rawScore = topReasons.reduce((sum, reason) => sum + reason.points, 0) * (0.82 + 0.18 * toNumber(metrics.dataCoverageModifier));
  const score = Math.round(clamp(rawScore, 8, 84));
  const level = getRiskLevel(score);

  return {
    level,
    score,
    confidence: getConfidenceLabel(metrics),
    summary: buildSummary(level, topReasons),
    reasons: topReasons
  };
}
