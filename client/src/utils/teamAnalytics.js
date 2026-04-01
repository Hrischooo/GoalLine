import { formatStatValue, toNumber } from './playerMetrics';
import {
  FORMATION_TEMPLATES,
  enrichPlayer,
  getPositionFitScore,
  getRoleFitScore,
  getSlotCandidateScore,
  parseListedPositions
} from './formationModels';
import { buildLineupModesForTeam, detectFormationForTeam, pickBestXiForFormation } from './formationOptimizer';

function roundRating(value) {
  return Math.round(Math.min(Math.max(value, 1), 99));
}

function buildQualityFlags(lineup = {}) {
  const flags = [];
  const xi = lineup.xi || [];

  if (xi.some((slot) => slot.positionFitScore < 0.82)) {
    flags.push('out_of_position_starter');
  }

  if (Object.values(lineup.lineRatings || {}).some((rating) => rating && rating < 62)) {
    flags.push('weak_line');
  }

  if (toNumber(lineup.formationConfidence) < 0.62) {
    flags.push('low_formation_confidence');
  }

  if (toNumber(lineup.roleCoherenceScore) < 60) {
    flags.push('low_role_coherence');
  }

  return flags;
}

function attachModeMetadata(lineup = {}, enrichedPlayers = [], autoCandidates = []) {
  const selectedNames = new Set((lineup.xi || []).map((slot) => slot.assignedPlayer?.player));
  const benchCandidates = enrichedPlayers
    .filter((player) => !selectedNames.has(player.player))
    .sort((left, right) => right.finalOVR - left.finalOVR || right.minutesPlayed - left.minutesPlayed)
    .slice(0, 7)
    .map((player) => ({
      player,
      metrics: player.metrics
    }));

  return {
    ...lineup,
    benchCandidates,
    qualityFlags: buildQualityFlags(lineup),
    formationCandidates: autoCandidates
  };
}

function buildPositionDepth(enrichedPlayers = []) {
  const depthMap = new Map();

  for (const player of enrichedPlayers) {
    const position = player.metrics.exactPosition || parseListedPositions(player)[0] || 'CM';
    const current = depthMap.get(position) || [];
    current.push({
      player,
      rating: player.finalOVR,
      role: player.metrics.primaryTacticalRoleLabel
    });
    depthMap.set(position, current);
  }

  return [...depthMap.entries()]
    .map(([position, playersForPosition]) => ({
      position,
      players: playersForPosition.sort((left, right) => right.rating - left.rating).slice(0, 4),
      count: playersForPosition.length
    }))
    .sort((left, right) => left.position.localeCompare(right.position));
}

function getStrongestAndWeakestLines(lineRatings = {}) {
  const lineEntries = Object.entries(lineRatings).filter(([, value]) => value > 0);
  const strongest = [...lineEntries].sort((left, right) => right[1] - left[1])[0];
  const weakest = [...lineEntries].sort((left, right) => left[1] - right[1])[0];

  return {
    strongestLine: strongest ? strongest[0] : 'attack',
    weakestLine: weakest ? weakest[0] : 'defense'
  };
}

function buildTacticalIdentitySummary(bestXI, squadSummary) {
  const xi = bestXI?.xi || [];
  const attacking = xi.reduce((sum, slot) => sum + toNumber(slot.assignedPlayer?.metrics?.attackScore), 0) / Math.max(xi.length, 1);
  const creativity = xi.reduce((sum, slot) => sum + toNumber(slot.assignedPlayer?.metrics?.creativityScore), 0) / Math.max(xi.length, 1);
  const possession = xi.reduce((sum, slot) => sum + toNumber(slot.assignedPlayer?.metrics?.possessionScore), 0) / Math.max(xi.length, 1);
  const defending = xi.reduce((sum, slot) => sum + toNumber(slot.assignedPlayer?.metrics?.defendingScore), 0) / Math.max(xi.length, 1);
  const wingerCount = xi.filter((slot) => ['LW', 'RW', 'LWB', 'RWB'].includes(slot.slotLabel)).length;

  if (creativity >= 72 && wingerCount >= 2) {
    return 'High chance-creation wide team';
  }

  if (possession >= 72 && squadSummary.midfieldCount >= squadSummary.attackCount) {
    return 'Possession-oriented midfield-heavy side';
  }

  if (attacking >= 70 && squadSummary.topScorerGoals >= 10) {
    return 'Direct, striker-focused attacking profile';
  }

  if (defending >= 68 && creativity < 60) {
    return 'Defensively stable but low-creation squad';
  }

  return 'Balanced side with mixed creation and control profiles';
}

function buildStrengthsWeaknesses(bestXI) {
  const xi = bestXI?.xi || [];
  const categoryEntries = ['attack', 'creativity', 'possession', 'defending']
    .map((categoryKey) => ({
      key: categoryKey,
      label: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
      score: xi.reduce((sum, slot) => sum + toNumber(slot.assignedPlayer?.metrics?.[`${categoryKey}Score`]), 0) / Math.max(xi.length, 1)
    }))
    .sort((left, right) => right.score - left.score);

  return {
    strengths: categoryEntries.slice(0, 2).map((entry) => `${entry.label} (${formatStatValue(entry.score)})`),
    weaknesses: [...categoryEntries].reverse().slice(0, 2).map((entry) => `${entry.label} (${formatStatValue(entry.score)})`)
  };
}

export {
  FORMATION_TEMPLATES,
  enrichPlayer,
  getPositionFitScore,
  getRoleFitScore,
  getSlotCandidateScore,
  parseListedPositions,
  pickBestXiForFormation,
  detectFormationForTeam,
  buildLineupModesForTeam
};

export function getBestXIForTeam(players = [], team = {}, ratingIndex = {}, options = {}) {
  const enrichedPlayers = players.map((player) => (player?.metrics ? player : enrichPlayer(player, ratingIndex)));
  const lineupModes = options.lineupModes || buildLineupModesForTeam(enrichedPlayers, team, ratingIndex);

  let selectedLineup = lineupModes.auto;

  if (options.mode === 'preferred') {
    selectedLineup = lineupModes.preferred;
  } else if (options.formation && FORMATION_TEMPLATES[options.formation]) {
    const customLineup = pickBestXiForFormation(enrichedPlayers, options.formation, ratingIndex);
    selectedLineup = {
      mode: 'custom',
      modeLabel: `Custom ${options.formation}`,
      formation: customLineup.formation,
      xi: customLineup.xi,
      lineRatings: customLineup.lineRatings,
      overallTeamRating: roundRating(
        0.3 * toNumber(customLineup.lineRatings.attack) +
          0.32 * toNumber(customLineup.lineRatings.midfield) +
          0.28 * toNumber(customLineup.lineRatings.defense) +
          0.1 * toNumber(customLineup.lineRatings.goalkeeper)
      ),
      formationConfidence: 0.68,
      formationFitScore: customLineup.totalFormationScore,
      totalFormationScore: customLineup.totalFormationScore,
      slotFitAverage: customLineup.slotFitAverage,
      roleCoherenceScore: customLineup.roleCoherenceScore,
      positionCoverageScore: customLineup.positionCoverageScore,
      lineBalanceScore: customLineup.lineBalanceScore,
      outOfPositionPenaltySummary: customLineup.outOfPositionPenaltySummary,
      explanationSummary: customLineup.explanationSummary
    };
  }

  return attachModeMetadata(selectedLineup, enrichedPlayers, lineupModes.auto?.formationCandidates || []);
}

export function buildTeamAnalytics(team, players = [], ratingIndex = {}) {
  const enrichedPlayers = players.map((player) => enrichPlayer(player, ratingIndex));
  const lineupModes = buildLineupModesForTeam(enrichedPlayers, team, ratingIndex);
  const autoBestXI = attachModeMetadata(lineupModes.auto, enrichedPlayers, lineupModes.auto?.formationCandidates || []);
  const preferredBestXI = attachModeMetadata(lineupModes.preferred, enrichedPlayers, lineupModes.auto?.formationCandidates || []);
  const squadSize = enrichedPlayers.length;
  const averageAge =
    enrichedPlayers.reduce((sum, player) => sum + toNumber(player.age), 0) / Math.max(enrichedPlayers.filter((player) => toNumber(player.age) > 0).length, 1);
  const averageOVR = enrichedPlayers.reduce((sum, player) => sum + player.finalOVR, 0) / Math.max(squadSize, 1);
  const totalGoals = enrichedPlayers.reduce((sum, player) => sum + toNumber(player.goals), 0);
  const totalAssists = enrichedPlayers.reduce((sum, player) => sum + toNumber(player.assists), 0);
  const squadSummary = {
    attackCount: enrichedPlayers.filter((player) => player.metrics.positionFamily === 'forward').length,
    midfieldCount: enrichedPlayers.filter((player) => player.metrics.positionFamily === 'midfielder').length,
    defenseCount: enrichedPlayers.filter((player) => player.metrics.positionFamily === 'defender').length,
    goalkeeperCount: enrichedPlayers.filter((player) => player.metrics.positionFamily === 'goalkeeper').length,
    topScorerGoals: Math.max(...enrichedPlayers.map((player) => toNumber(player.goals)), 0)
  };
  const starPlayer = [...enrichedPlayers].sort((left, right) => right.finalOVR - left.finalOVR || right.minutesPlayed - left.minutesPlayed)[0] || null;
  const captain =
    [...enrichedPlayers]
      .filter((player) => toNumber(player.age) >= 27)
      .sort((left, right) => right.minutesPlayed - left.minutesPlayed)[0] ||
    [...enrichedPlayers].sort((left, right) => right.minutesPlayed - left.minutesPlayed)[0] ||
    null;
  const topScorer = [...enrichedPlayers].sort((left, right) => toNumber(right.goals) - toNumber(left.goals))[0] || null;
  const topCreator =
    [...enrichedPlayers].sort((left, right) => toNumber(right.assists) - toNumber(left.assists) || toNumber(right.key_passes) - toNumber(left.key_passes))[0] ||
    null;
  const youngTalents = [...enrichedPlayers]
    .filter((player) => toNumber(player.age) > 0 && toNumber(player.age) <= 23)
    .sort((left, right) => right.finalOVR - left.finalOVR || right.minutesPlayed - left.minutesPlayed)
    .slice(0, 4);
  const keyPlayers = [...autoBestXI.xi]
    .sort((left, right) => right.slotAdjustedEffectiveRating - left.slotAdjustedEffectiveRating)
    .slice(0, 4)
    .map((slot) => slot.assignedPlayer);
  const depthChart = buildPositionDepth(enrichedPlayers);
  const lineSummary = getStrongestAndWeakestLines(autoBestXI.lineRatings);
  const strengthsWeaknesses = buildStrengthsWeaknesses(autoBestXI);

  return {
    squadPlayers: enrichedPlayers,
    squadSize,
    averageAge: Number(averageAge.toFixed(1)),
    averageOVR: Number(averageOVR.toFixed(1)),
    totalGoals,
    totalAssists,
    detectedFormation: autoBestXI.formation,
    formationConfidence: autoBestXI.formationConfidence,
    formationFitScore: autoBestXI.formationFitScore,
    formationCandidates: autoBestXI.formationCandidates || [],
    bestXI: autoBestXI,
    preferredBestXI,
    lineupModes: {
      auto: autoBestXI,
      preferred: preferredBestXI
    },
    teamRating: autoBestXI.overallTeamRating,
    lineRatings: autoBestXI.lineRatings,
    strongestLine: lineSummary.strongestLine,
    weakestLine: lineSummary.weakestLine,
    positionDepth: depthChart,
    countsByPositionFamily: squadSummary,
    starPlayer,
    captain,
    topScorer,
    topCreator,
    youngTalents,
    keyPlayers,
    tacticalIdentitySummary: buildTacticalIdentitySummary(autoBestXI, squadSummary),
    strengths: strengthsWeaknesses.strengths,
    weaknesses: strengthsWeaknesses.weaknesses
  };
}
