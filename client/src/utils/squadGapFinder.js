import { humanizeLine } from './recruitmentShared';
import { buildTeamProfile } from './teamProfile';
import { toNumber } from './playerMetrics';

function scoreToPriority(score) {
  if (score >= 74) {
    return 'high';
  }

  if (score >= 50) {
    return 'medium';
  }

  return 'low';
}

function buildGap({
  key,
  gapType,
  score,
  title,
  explanation,
  affectedPosition = null,
  affectedRole = null,
  weakSlotReference = null,
  supportingEvidence = [],
  positions = [],
  positionModels = [],
  roleKeys = [],
  categoryWeights = {},
  axisWeights = {}
}) {
  return {
    key,
    gapType,
    priority: scoreToPriority(score),
    priorityScore: Math.round(score),
    title,
    explanation,
    affectedPosition,
    affectedRole,
    weakSlotReference,
    supportingEvidence: supportingEvidence.filter(Boolean).slice(0, 4),
    positions,
    positionModels,
    roleKeys,
    categoryWeights,
    axisWeights
  };
}

function buildXiWeaknessGaps(teamProfile) {
  return (teamProfile.weakSlotMap || [])
    .filter((slot) => slot.weaknessScore >= 18)
    .slice(0, 4)
    .map((slot) => {
      const assignedPlayer = slot.assignedPlayer;
      const gapRole =
        assignedPlayer?.metrics?.primaryTacticalRoleLabel ||
        assignedPlayer?.metrics?.playerArchetype ||
        slot.slotLabel;

      return buildGap({
        key: `xi-${slot.slotId}`,
        gapType: 'position',
        score: slot.weaknessScore,
        title: `${slot.slotLabel} is one of the weaker XI slots`,
        explanation: `${slot.slotLabel} currently drags below the ${humanizeLine(slot.line).toLowerCase()} line level, either through lower effective rating or an imperfect role/position fit.`,
        affectedPosition: slot.assignedPlayer?.metrics?.exactPosition || slot.slotLabel,
        affectedRole: gapRole,
        weakSlotReference: {
          slotId: slot.slotId,
          slotLabel: slot.slotLabel,
          playerName: assignedPlayer?.player || null
        },
        supportingEvidence: [
          `Slot-adjusted rating ${Math.round(slot.slotAdjustedEffectiveRating)}.`,
          `Combined slot fit ${Math.round(slot.fitScore)}%.`,
          `Position fit ${slot.positionFitScore}% / role fit ${slot.roleFitScore}%.`
        ],
        positions: slot.assignedPlayer?.metrics?.exactPosition ? [slot.assignedPlayer.metrics.exactPosition] : [],
        positionModels: slot.assignedPlayer?.metrics?.positionModel ? [slot.assignedPlayer.metrics.positionModel] : [],
        roleKeys: assignedPlayer?.metrics?.primaryTacticalRole ? [assignedPlayer.metrics.primaryTacticalRole] : [],
        categoryWeights: {
          attack: slot.line === 'attack' ? 0.45 : 0.15,
          creativity: slot.line === 'midfield' ? 0.3 : 0.15,
          possession: slot.line !== 'attack' ? 0.3 : 0.15,
          defending: slot.line === 'defense' || slot.line === 'goalkeeper' ? 0.4 : 0.25
        },
        axisWeights: {
          progression: slot.line === 'defense' || slot.line === 'midfield' ? 0.3 : 0.12,
          ball_security: 0.18,
          defending: slot.line === 'defense' ? 0.35 : 0.1,
          shot_threat: slot.line === 'attack' ? 0.35 : 0.1
        }
      });
    });
}

function buildDepthWeaknessGaps(teamProfile) {
  return Object.values(teamProfile.positionDepthMap || {})
    .map((row) => {
      if (!row?.starter) {
        return null;
      }

      const hasReliableBackup = row.backup && row.backupReliability >= 0.78;
      const score =
        Math.max(0, row.dropoff - 4) * 4 +
        (row.count <= 1 ? 26 : 0) +
        (row.backup && row.backupRating < 68 ? 16 : 0) +
        (!hasReliableBackup ? 8 : 0);

      if (score < 26) {
        return null;
      }

      return buildGap({
        key: `depth-${row.position}`,
        gapType: 'depth',
        score,
        title: row.count <= 1 ? `No reliable backup at ${row.position}` : `Depth drops sharply at ${row.position}`,
        explanation:
          row.count <= 1
            ? `There is only one viable ${row.position} option in the squad model.`
            : `The drop from the starter to the next option at ${row.position} is steep enough to create squad fragility.`,
        affectedPosition: row.position,
        weakSlotReference: row.starter
          ? {
              slotId: null,
              slotLabel: row.position,
              playerName: row.starter.player?.player || null
            }
          : null,
        supportingEvidence: [
          `Starter ${Math.round(row.starterRating)} OVR.`,
          row.backup ? `Backup ${Math.round(row.backupRating)} OVR.` : 'No clear second option.',
          `Depth drop-off ${Math.round(row.dropoff)} points.`
        ],
        positions: [row.position],
        positionModels: row.starter?.player?.metrics?.positionModel ? [row.starter.player.metrics.positionModel] : [],
        roleKeys: row.starter?.player?.metrics?.primaryTacticalRole ? [row.starter.player.metrics.primaryTacticalRole] : [],
        categoryWeights: {
          attack: row.position === 'ST' ? 0.45 : 0.15,
          creativity: ['CAM', 'CM', 'LW', 'RW'].includes(row.position) ? 0.3 : 0.15,
          possession: ['DM', 'CM', 'CB', 'LB', 'RB'].includes(row.position) ? 0.3 : 0.15,
          defending: ['CB', 'LB', 'RB', 'DM', 'GK'].includes(row.position) ? 0.4 : 0.2
        },
        axisWeights: {
          progression: ['CB', 'LB', 'RB', 'CM', 'DM'].includes(row.position) ? 0.3 : 0.12,
          ball_security: 0.2,
          defending: ['CB', 'LB', 'RB', 'DM', 'GK'].includes(row.position) ? 0.3 : 0.1,
          shot_threat: row.position === 'ST' ? 0.3 : 0.1
        }
      });
    })
    .filter(Boolean);
}

function buildStyleDeficiencyGaps(teamProfile) {
  const style = teamProfile.styleProfile || {};
  const gaps = [];

  if (style.centralCreativity < 62) {
    gaps.push(
      buildGap({
        key: 'style-central-creativity',
        gapType: 'style',
        score: (66 - style.centralCreativity) * 2.2,
        title: 'Lacks a true central creator',
        explanation: 'The central midfield/AM unit does not generate enough creativity for the overall team level.',
        affectedPosition: 'CAM/CM',
        affectedRole: 'Central creator',
        supportingEvidence: [`Central creativity averages ${Math.round(style.centralCreativity)}.`],
        positions: ['CAM', 'CM'],
        positionModels: ['CAM', 'CM'],
        roleKeys: ['AdvancedPlaymaker', 'Creative10', 'CentralPlaymaker'],
        categoryWeights: { creativity: 0.5, possession: 0.2, attack: 0.2, defending: 0.1 },
        axisWeights: { creativity: 0.35, final_third_delivery: 0.35, progression: 0.2, possession: 0.1 }
      })
    );
  }

  if (style.backProgression < 58) {
    gaps.push(
      buildGap({
        key: 'style-back-progression',
        gapType: 'style',
        score: (64 - style.backProgression) * 2.1,
        title: 'Low progression from defense',
        explanation: 'The defensive unit does not move play forward well enough for cleaner buildup phases.',
        affectedPosition: 'CB/LB/RB',
        affectedRole: 'Ball-progressing defender',
        supportingEvidence: [`Defensive progression averages ${Math.round(style.backProgression)}.`],
        positions: ['CB', 'LB', 'RB'],
        positionModels: ['CB', 'LB/RB'],
        roleKeys: ['BallPlayingDefender', 'FullBack', 'DeepLyingPlaymaker'],
        categoryWeights: { creativity: 0.25, possession: 0.35, defending: 0.2, attack: 0.2 },
        axisWeights: { progression: 0.45, ball_security: 0.25, possession_control: 0.15, distribution: 0.15 }
      })
    );
  }

  if (style.midfieldBallWinning < 60) {
    gaps.push(
      buildGap({
        key: 'style-midfield-ball-winning',
        gapType: 'style',
        score: (64 - style.midfieldBallWinning) * 2.1,
        title: 'Midfield ball-winning is below team needs',
        explanation: 'The central unit lacks enough recoveries and defensive bite relative to the rest of the structure.',
        affectedPosition: 'DM/CM',
        affectedRole: 'Ball-winning midfielder',
        supportingEvidence: [`Midfield ball-winning averages ${Math.round(style.midfieldBallWinning)}.`],
        positions: ['DM', 'CM'],
        positionModels: ['DM', 'CM'],
        roleKeys: ['BallWinningMidfielder', 'Anchor'],
        categoryWeights: { defending: 0.45, possession: 0.25, creativity: 0.1, attack: 0.2 },
        axisWeights: { ball_winning: 0.45, positioning: 0.25, possession_control: 0.2, security: 0.1 }
      })
    );
  }

  if (style.wideCarryThreat < 60) {
    gaps.push(
      buildGap({
        key: 'style-wide-carry',
        gapType: 'style',
        score: (64 - style.wideCarryThreat) * 1.9,
        title: 'Wide carry threat is too light',
        explanation: 'The side lacks direct dribbling and carrying threat from the wide lanes.',
        affectedPosition: 'LW/RW/LWB/RWB',
        affectedRole: 'Wide runner',
        supportingEvidence: [`Wide carry threat averages ${Math.round(style.wideCarryThreat)}.`],
        positions: ['LW', 'RW', 'LWB', 'RWB'],
        positionModels: ['LW/RW', 'LB/RB'],
        roleKeys: ['Winger', 'InsideForward', 'WingBack'],
        categoryWeights: { attack: 0.35, creativity: 0.2, possession: 0.15, defending: 0.3 },
        axisWeights: { dribbling: 0.45, carry_threat: 0.4, delivery: 0.15 }
      })
    );
  }

  if (style.cbAerial < 62) {
    gaps.push(
      buildGap({
        key: 'style-cb-aerial',
        gapType: 'style',
        score: (66 - style.cbAerial) * 2,
        title: 'Central defense lacks aerial strength',
        explanation: 'The center-back unit could use more aerial presence and duel security.',
        affectedPosition: 'CB',
        affectedRole: 'Aerial centre-back',
        supportingEvidence: [`CB aerial value averages ${Math.round(style.cbAerial)}.`],
        positions: ['CB'],
        positionModels: ['CB'],
        roleKeys: ['Stopper', 'NoNonsenseDefender', 'BallPlayingDefender'],
        categoryWeights: { defending: 0.45, possession: 0.15, creativity: 0.05, attack: 0.35 },
        axisWeights: { aerial: 0.45, physical_dueling: 0.25, defending: 0.2, ball_security: 0.1 }
      })
    );
  }

  if (style.strikerShotThreat < 60) {
    gaps.push(
      buildGap({
        key: 'style-st-shot',
        gapType: 'style',
        score: (66 - style.strikerShotThreat) * 2,
        title: 'Weak finishing and shot threat at ST',
        explanation: 'The striker line is not producing enough repeatable shooting pressure for the setup.',
        affectedPosition: 'ST',
        affectedRole: 'Shot-leading striker',
        supportingEvidence: [`Striker shot threat averages ${Math.round(style.strikerShotThreat)}.`],
        positions: ['ST', 'CF'],
        positionModels: ['ST'],
        roleKeys: ['AdvancedForward', 'Poacher', 'TargetForward'],
        categoryWeights: { attack: 0.55, creativity: 0.1, possession: 0.1, defending: 0.25 },
        axisWeights: { shot_threat: 0.4, box_presence: 0.35, finishing: 0.25 }
      })
    );
  }

  if (style.buildupSecurity < 58) {
    gaps.push(
      buildGap({
        key: 'style-build-security',
        gapType: 'style',
        score: (62 - style.buildupSecurity) * 1.8,
        title: 'Buildup security is light in key positions',
        explanation: 'The first phase lacks enough safe circulation and retention in the players most involved in buildup.',
        affectedPosition: 'CB/DM/GK',
        affectedRole: 'Secure buildup option',
        supportingEvidence: [`Buildup security averages ${Math.round(style.buildupSecurity)}.`],
        positions: ['CB', 'DM', 'GK'],
        positionModels: ['CB', 'DM', 'GK'],
        roleKeys: ['DeepLyingPlaymaker', 'Anchor', 'BallPlayingDefender', 'Goalkeeper'],
        categoryWeights: { possession: 0.45, creativity: 0.15, defending: 0.25, attack: 0.15 },
        axisWeights: { ball_security: 0.4, security: 0.25, distribution: 0.15, possession_control: 0.2 }
      })
    );
  }

  return gaps;
}

function buildFormationDependencyGaps(teamProfile) {
  return (teamProfile.formationDependencyFlags || []).map((flag) =>
    buildGap({
      key: `formation-${flag.key}`,
      gapType: 'role',
      score: 68,
      title: flag.title,
      explanation: flag.explanation,
      affectedRole: flag.title,
      supportingEvidence: [`Current shape: ${flag.formation}.`],
      positions:
        flag.key === 'cam_creator_missing'
          ? ['CAM']
          : flag.key === 'progressive_interiors'
            ? ['CM']
            : flag.key === 'wingback_support'
              ? ['LWB', 'RWB']
              : ['ST', 'CF'],
      positionModels:
        flag.key === 'cam_creator_missing'
          ? ['CAM']
          : flag.key === 'progressive_interiors'
            ? ['CM']
            : flag.key === 'wingback_support'
              ? ['LB/RB']
              : ['ST'],
      roleKeys:
        flag.key === 'cam_creator_missing'
          ? ['AdvancedPlaymaker', 'Creative10']
          : flag.key === 'progressive_interiors'
            ? ['CentralPlaymaker', 'BoxToBox']
            : flag.key === 'wingback_support'
              ? ['WingBack', 'FullBack']
              : ['DeepLyingForward', 'AdvancedForward'],
      categoryWeights:
        flag.key === 'cam_creator_missing'
          ? { creativity: 0.5, possession: 0.2, attack: 0.2, defending: 0.1 }
          : flag.key === 'progressive_interiors'
            ? { creativity: 0.25, possession: 0.35, defending: 0.2, attack: 0.2 }
            : flag.key === 'wingback_support'
              ? { attack: 0.25, creativity: 0.2, possession: 0.2, defending: 0.35 }
              : { attack: 0.45, creativity: 0.15, possession: 0.2, defending: 0.2 },
      axisWeights:
        flag.key === 'cam_creator_missing'
          ? { creativity: 0.35, final_third_delivery: 0.35, progression: 0.2, possession: 0.1 }
          : flag.key === 'progressive_interiors'
            ? { progression: 0.4, possession_control: 0.2, ball_security: 0.2, creativity: 0.2 }
            : flag.key === 'wingback_support'
              ? { progression: 0.3, support_play: 0.2, carrying: 0.25, delivery: 0.25 }
              : { link_play: 0.35, attack: 0.25, shot_threat: 0.25, box_presence: 0.15 }
    })
  );
}

function dedupeGaps(gaps = []) {
  const seen = new Set();
  return gaps.filter((gap) => {
    if (!gap || seen.has(gap.key)) {
      return false;
    }

    seen.add(gap.key);
    return true;
  });
}

export function buildSquadGapFinderProfile(team) {
  if (!team?.bestXI?.xi?.length) {
    return {
      summary: 'Recruitment intelligence is unavailable until best-XI data is loaded.',
      needs: [],
      teamProfile: null
    };
  }

  const teamProfile = buildTeamProfile(team);
  const gaps = dedupeGaps([
    ...buildXiWeaknessGaps(teamProfile),
    ...buildDepthWeaknessGaps(teamProfile),
    ...buildStyleDeficiencyGaps(teamProfile),
    ...buildFormationDependencyGaps(teamProfile)
  ])
    .sort((left, right) => right.priorityScore - left.priorityScore)
    .slice(0, 5);
  const summary = gaps.length
    ? `${team.displayName || team.name} shows the clearest recruitment pressure around ${gaps[0].title.toLowerCase()} inside a ${teamProfile.formation} structure.`
    : `${team.displayName || team.name} does not show a major tactical recruitment gap from the current team profile.`;

  return {
    formation: teamProfile.formation,
    summary,
    needs: gaps,
    teamProfile
  };
}
