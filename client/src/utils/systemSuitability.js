import { toNumber } from './playerMetrics';
import { getConfidenceLabel, getRadarLookup, POSITION_FORMATION_MAP } from './scoutingInsightHelpers';

function addFit(target, key, label, detail) {
  if (!target.some((entry) => entry.key === key)) {
    target.push({ key, label, detail });
  }
}

function addNote(target, key, text) {
  if (!target.some((entry) => entry.key === key)) {
    target.push({ key, text });
  }
}

function getBestFitSummary(metrics, fits = []) {
  const leadFit = fits[0]?.label || 'balanced team structures';
  const supportFit = fits[1]?.label;
  const roleLabel = metrics.primaryTacticalRoleLabel || metrics.playerArchetype || metrics.exactPosition;

  if (supportFit) {
    return `Best in ${leadFit.toLowerCase()} and ${supportFit.toLowerCase()} environments, where the ${roleLabel.toLowerCase()} profile can stay close to its strongest phases.`;
  }

  return `Best in ${leadFit.toLowerCase()} environments, where the ${roleLabel.toLowerCase()} profile can be used on its strongest terms.`;
}

export function buildSystemSuitabilityProfile(player, metrics, strengthsProfile = null) {
  const fits = [];
  const lessIdeal = [];
  const radarLookup = getRadarLookup(metrics);
  const attackScore = toNumber(metrics.attackScore);
  const creativityScore = toNumber(metrics.creativityScore);
  const possessionScore = toNumber(metrics.possessionScore);
  const defendingScore = toNumber(metrics.defendingScore);
  const carryThreat = toNumber(radarLookup.carry_threat?.value || radarLookup.flair_carrying?.value || radarLookup.carrying?.value);
  const deliveryValue = toNumber(radarLookup.final_third_delivery?.value || radarLookup.delivery?.value || creativityScore);
  const progressionValue = toNumber(radarLookup.progression?.value || creativityScore);
  const ballSecurity = toNumber(radarLookup.ball_security?.value || radarLookup.security?.value || radarLookup.retention?.value || possessionScore);
  const aerialValue = toNumber(radarLookup.aerial?.value || radarLookup.aerial_threat?.value);
  const boxPresence = toNumber(radarLookup.box_presence?.value || attackScore);

  if (possessionScore >= 72 || ballSecurity >= 72) {
    addFit(fits, 'possession_heavy', 'Possession-heavy team', 'Can support longer controlled phases without dragging the circulation level down.');
  }

  if (progressionValue >= 72) {
    addFit(fits, 'controlled_buildup', 'Controlled build-up side', 'Progression quality supports teams that want clean advances into better attacking zones.');
  }

  if (creativityScore >= 76 || deliveryValue >= 76) {
    addFit(fits, 'creation_system', 'High-final-third creation system', 'The profile is strongest when the structure feeds repeated creation actions near the box.');
  }

  if ((attackScore >= 78 || carryThreat >= 76) && ['LW/RW', 'ST', 'CAM'].includes(metrics.positionModel)) {
    addFit(fits, 'transition', 'Direct transition team', 'Attacking value rises when there is space to attack early and often.');
  }

  switch (metrics.positionModel) {
    case 'CAM':
      addFit(fits, 'cam_4231', 'Advanced creator in 4-2-3-1', 'Best when allowed to receive between lines and supply the final pass.');
      if (creativityScore >= 72 && possessionScore >= 68) {
        addFit(fits, 'cam_433', 'Wide-rotation creator in 4-3-3', 'Can also function as the creative reference in a fluid front five.');
      }
      break;
    case 'CM':
      addFit(fits, 'cm_433', 'Interior in 4-3-3', 'Fits sides that want progression and support play from the midfield line.');
      if (possessionScore >= 72 && defendingScore >= 60) {
        addFit(fits, 'cm_double_pivot', 'Double-pivot control system', 'Has enough control and work rate to help stabilize the second line.');
      }
      break;
    case 'DM':
      addFit(fits, 'dm_double_pivot', 'Double-pivot control system', 'Secure fit for teams that want a balancing piece in front of the back line.');
      if (defendingScore >= 70 && possessionScore >= 68) {
        addFit(fits, 'dm_single_pivot', 'Single-pivot build-up role', 'Can anchor possession and defensive coverage in a more control-heavy setup.');
      }
      break;
    case 'LW/RW':
      addFit(fits, 'wing_433', 'Wide creator in 4-3-3', 'Best when starting high and wide before attacking the box or releasing runners.');
      if (attackScore >= 76) {
        addFit(fits, 'inside_forward', 'Inside-forward attack', 'Profiles well when asked to finish phases rather than just hold width.');
      }
      break;
    case 'ST':
      addFit(fits, 'st_frontline', 'Front-line focal point', 'Strongest when the team can feed repeated box entries and finishing actions.');
      if (boxPresence >= 74 && aerialValue >= 62) {
        addFit(fits, 'st_442', 'Two-forward structure', 'Can stay close to goal and attack service with less creation burden.');
      }
      break;
    case 'LB/RB':
      addFit(fits, 'fullback_wide', 'Wide attacking structure', 'Progression and delivery are best used with permission to advance from full-back.');
      break;
    case 'CB':
      if (progressionValue >= 68 && ballSecurity >= 68) {
        addFit(fits, 'cb_build_up', 'Possession-first back line', 'Can support cleaner first-phase progression into midfield.');
      }
      if (defendingScore >= 74 || aerialValue >= 72) {
        addFit(fits, 'cb_duel', 'Deeper line with duel focus', 'Defensive profile suits teams that still need box security and clear duel winning.');
      }
      break;
    case 'GK':
      if (ballSecurity >= 68) {
        addFit(fits, 'gk_build_up', 'Build-up goalkeeper role', 'Distribution and security fit calmer first-phase structures.');
      }
      if (toNumber(radarLookup.shot_stopping?.value) >= 76) {
        addFit(fits, 'gk_shot_stopper', 'Shot-stopping focused setup', 'Can hold extra value in teams that still concede higher-quality looks.');
      }
      break;
    default:
      break;
  }

  if (ballSecurity <= 56) {
    addNote(lessIdeal, 'possession', 'Less ideal for slow possession systems that need clean retention on nearly every touch.');
  }

  if (defendingScore <= 46 && !['ST'].includes(metrics.positionModel)) {
    addNote(lessIdeal, 'defensive_load', 'Less ideal for high-defensive-load pressing roles if the player must win a large share of duels or recoveries.');
  }

  if (['CAM', 'LW/RW', 'ST'].includes(metrics.positionModel) && attackScore <= 50) {
    addNote(lessIdeal, 'focal_point', 'Less ideal as the main scoring outlet in systems that need primary final-third output from this role.');
  }

  if (['ST', 'CB'].includes(metrics.positionModel) && aerialValue > 0 && aerialValue <= 52) {
    addNote(lessIdeal, 'physical', 'Less ideal for low-block physical systems that rely heavily on aerial security.');
  }

  if (['DM', 'CM', 'CB', 'LB/RB'].includes(metrics.positionModel) && progressionValue <= 54) {
    addNote(lessIdeal, 'build_up', 'Less ideal for build-up dominant teams that need this role to move play forward consistently.');
  }

  return {
    summary: getBestFitSummary(metrics, fits),
    bestFits: fits.slice(0, 4),
    lessIdeal: lessIdeal.slice(0, 2),
    formations: POSITION_FORMATION_MAP[metrics.positionModel] || ['4-3-3'],
    confidence: getConfidenceLabel(metrics),
    strengthReference: strengthsProfile?.strengths?.[0]?.title || null
  };
}
