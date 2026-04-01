import { getPlayerRadarProfile } from './playerRadar';
import { toNumber } from './playerMetrics';

function average(values = []) {
  return values.length ? values.reduce((sum, value) => sum + toNumber(value), 0) / values.length : 0;
}

function getRadarValue(playerOrMetrics, axisKey) {
  const metrics = playerOrMetrics?.metrics || playerOrMetrics || {};
  const axes = getPlayerRadarProfile(metrics).radarAxes || [];
  return toNumber(axes.find((axis) => axis.key === axisKey)?.value);
}

function getLinePlayers(bestXI = {}, line) {
  return (bestXI.xi || []).filter((slot) => slot.line === line).map((slot) => slot.assignedPlayer).filter(Boolean);
}

function buildLineCategoryProfiles(bestXI = {}) {
  const lines = ['attack', 'midfield', 'defense', 'goalkeeper'];

  return Object.fromEntries(
    lines.map((line) => {
      const players = getLinePlayers(bestXI, line);
      return [
        line,
        {
          attack: average(players.map((player) => player.metrics?.attackScore)),
          creativity: average(players.map((player) => player.metrics?.creativityScore)),
          possession: average(players.map((player) => player.metrics?.possessionScore)),
          defending: average(players.map((player) => player.metrics?.defendingScore))
        }
      ];
    })
  );
}

function buildRoleCoverageMap(squadPlayers = []) {
  const coverage = new Map();

  squadPlayers.forEach((player) => {
    const roleKeys = [player.metrics?.primaryTacticalRole, player.metrics?.secondaryTacticalRole].filter(Boolean);

    roleKeys.forEach((roleKey, index) => {
      const current = coverage.get(roleKey) || {
        roleKey,
        count: 0,
        primaryCount: 0,
        players: []
      };

      current.count += 1;
      if (index === 0) {
        current.primaryCount += 1;
      }

      current.players.push({
        player: player.player,
        exactPosition: player.metrics?.exactPosition,
        ovr: player.metrics?.finalOVR
      });
      coverage.set(roleKey, current);
    });
  });

  return Object.fromEntries([...coverage.entries()]);
}

function buildPositionDepthMap(team = {}) {
  return Object.fromEntries(
    (team.positionDepth || []).map((row) => {
      const starter = row.players?.[0] || null;
      const backup = row.players?.[1] || null;
      const tertiary = row.players?.[2] || null;
      const dropoff = starter && backup ? toNumber(starter.rating) - toNumber(backup.rating) : starter ? 18 : 0;
      const backupReliability = toNumber(backup?.player?.metrics?.reliabilityModifier || 0);

      return [
        row.position,
        {
          ...row,
          starter,
          backup,
          tertiary,
          dropoff,
          starterRating: toNumber(starter?.rating),
          backupRating: toNumber(backup?.rating),
          backupReliability
        }
      ];
    })
  );
}

function buildWeakSlotMap(team = {}) {
  const xi = team.bestXI?.xi || [];
  const lineRatings = team.lineRatings || {};

  return xi
    .map((slot) => {
      const lineRating = toNumber(lineRatings[slot.line]);
      const slotRating = toNumber(slot.slotAdjustedEffectiveRating);
      const fitScore = toNumber(slot.fitScore);
      const weaknessScore = Math.round(
        Math.max(0, (72 - slotRating) * 1.4) +
          Math.max(0, (82 - fitScore) * 0.55) +
          Math.max(0, lineRating - slotRating) * 0.45
      );

      return {
        slotId: slot.slotId,
        slotLabel: slot.slotLabel,
        line: slot.line,
        assignedPlayer: slot.assignedPlayer,
        slotAdjustedEffectiveRating: slotRating,
        fitScore,
        positionFitScore: Math.round(toNumber(slot.positionFitScore) * 100),
        roleFitScore: Math.round(toNumber(slot.roleFitScore) * 100),
        weaknessScore
      };
    })
    .sort((left, right) => right.weaknessScore - left.weaknessScore);
}

function buildStyleProfile(team = {}, lineCategoryProfiles) {
  const midfield = lineCategoryProfiles.midfield || {};
  const defense = lineCategoryProfiles.defense || {};
  const attack = lineCategoryProfiles.attack || {};
  const fullBacks = getLinePlayers(team.bestXI || {}, 'defense').filter((player) => ['LB', 'RB', 'LWB', 'RWB'].includes(player.metrics?.exactPosition));
  const centreBacks = getLinePlayers(team.bestXI || {}, 'defense').filter((player) => player.metrics?.exactPosition === 'CB');
  const strikers = getLinePlayers(team.bestXI || {}, 'attack').filter((player) => ['ST', 'CF'].includes(player.metrics?.exactPosition));

  return {
    centralCreativity: average(
      (team.bestXI?.xi || [])
        .filter((slot) => ['CAM', 'CM', 'DM'].includes(slot.assignedPlayer?.metrics?.exactPosition))
        .map((slot) => slot.assignedPlayer?.metrics?.creativityScore)
    ),
    midfieldBallWinning: average(
      (team.bestXI?.xi || [])
        .filter((slot) => ['DM', 'CM'].includes(slot.assignedPlayer?.metrics?.exactPosition))
        .map((slot) => getRadarValue(slot.assignedPlayer, 'ball_winning'))
    ),
    backProgression: average([...getLinePlayers(team.bestXI || {}, 'defense').map((player) => getRadarValue(player, 'progression'))]),
    wideCarryThreat: average(fullBacks.map((player) => getRadarValue(player, 'carrying')).concat(getLinePlayers(team.bestXI || {}, 'attack').map((player) => getRadarValue(player, 'carry_threat')))),
    cbAerial: average(centreBacks.map((player) => getRadarValue(player, 'aerial'))),
    strikerShotThreat: average(strikers.map((player) => getRadarValue(player, 'shot_threat'))),
    buildupSecurity: average(
      [...getLinePlayers(team.bestXI || {}, 'defense'), ...getLinePlayers(team.bestXI || {}, 'goalkeeper')]
        .map((player) => getRadarValue(player, 'ball_security') || getRadarValue(player, 'distribution'))
    ),
    lineCategoryProfiles: {
      attack,
      midfield,
      defense
    }
  };
}

function buildFormationDependencyFlags(team = {}, styleProfile = {}, roleCoverageMap = {}) {
  const formation = team.bestXI?.formation || team.detectedFormation || team.preferred_formation || '4-3-3';
  const flags = [];

  if (formation === '4-2-3-1' && (styleProfile.centralCreativity < 62 || !roleCoverageMap.AdvancedPlaymaker)) {
    flags.push({
      key: 'cam_creator_missing',
      formation,
      title: '4-2-3-1 without a true CAM creator',
      explanation: 'The detected shape leans on a central creator behind the striker, but that profile is weak or thin in the squad.'
    });
  }

  if (['4-3-3', '4-1-4-1'].includes(formation) && styleProfile.backProgression < 58) {
    flags.push({
      key: 'progressive_interiors',
      formation,
      title: `${formation} lacks progressive interiors`,
      explanation: 'The midfield structure needs more line-breaking progression to support this shape cleanly.'
    });
  }

  if (['3-5-2', '3-4-3', '5-3-2', '5-2-3'].includes(formation) && styleProfile.wideCarryThreat < 60) {
    flags.push({
      key: 'wingback_support',
      formation,
      title: `${formation} lacks wing-back support profiles`,
      explanation: 'This shape needs stronger wide support, progression, and carrying from the outside lanes.'
    });
  }

  if (formation === '4-4-2') {
    const strikers = getLinePlayers(team.bestXI || {}, 'attack');
    const linkPlay = average(strikers.map((player) => getRadarValue(player, 'link_play')));

    if (linkPlay < 58) {
      flags.push({
        key: 'second_striker_link',
        formation,
        title: '4-4-2 lacks a link-forward profile',
        explanation: 'The shape would benefit from a more connective second-striker option alongside the main scorer.'
      });
    }
  }

  return flags;
}

export function buildTeamProfile(team = {}) {
  const squadPlayers = team.squadPlayers || [];
  const bestXI = team.bestXI || {};
  const lineCategoryProfiles = buildLineCategoryProfiles(bestXI);
  const roleCoverageMap = buildRoleCoverageMap(squadPlayers);
  const positionDepthMap = buildPositionDepthMap(team);
  const weakSlotMap = buildWeakSlotMap(team);
  const styleProfile = buildStyleProfile(team, lineCategoryProfiles);
  const formationDependencyFlags = buildFormationDependencyFlags(team, styleProfile, roleCoverageMap);

  return {
    teamId: team.id,
    formation: bestXI.formation || team.detectedFormation || team.preferred_formation || '4-3-3',
    detectedFormation: team.detectedFormation || bestXI.formation || '',
    bestXI,
    lineRatings: team.lineRatings || {},
    lineCategoryProfiles,
    roleCoverageMap,
    positionDepthMap,
    tacticalIdentitySummary: team.tacticalIdentitySummary || '',
    styleProfile,
    weakSlotMap,
    strongestLine: team.strongestLine,
    weakestLine: team.weakestLine,
    formationDependencyFlags
  };
}
