import { computeDisplayMetrics, toNumber } from './playerMetrics';
import { buildPlayerFitProfile } from './playerFitScore';
import { buildSquadGapFinderProfile } from './squadGapFinder';
import { buildDifferenceText, getNeedMatchScore, REPLACEMENT_MODES } from './recruitmentShared';
import { getSimilarPlayersForPlayer, SIMILARITY_MODES } from './similarPlayers';

const SOURCE_PLAYER_MODE_MAP = {
  [REPLACEMENT_MODES.direct.id]: SIMILARITY_MODES.similarStyle.id,
  [REPLACEMENT_MODES.younger.id]: SIMILARITY_MODES.youngerAlternative.id,
  [REPLACEMENT_MODES.higherUpside.id]: SIMILARITY_MODES.higherLevel.id,
  [REPLACEMENT_MODES.safer.id]: SIMILARITY_MODES.sameRole.id,
  [REPLACEMENT_MODES.squadDepth.id]: SIMILARITY_MODES.sameLevel.id
};

function getModeLabel(mode) {
  return REPLACEMENT_MODES[mode]?.label || REPLACEMENT_MODES.direct.label;
}

function getReliabilityBand(metrics = {}) {
  return Math.round((toNumber(metrics.reliabilityModifier) * 100 + toNumber(metrics.possessionScore) + toNumber(metrics.defendingScore)) / 3);
}

function getUpgradeContext(fitProfile) {
  if (fitProfile.upgradeLevel === 'major' || fitProfile.upgradeLevel === 'moderate') {
    return `${fitProfile.upgradeLevel} XI upgrade`;
  }

  if (fitProfile.upgradeLevel === 'minor') {
    return 'Competes for XI minutes';
  }

  return 'Depth solution';
}

function computeNeedDrivenScore(mode, fitProfile, metrics, player, needMatchScore) {
  const age = toNumber(player?.age);
  const upsideScore = Math.round(0.6 * toNumber(metrics.finalOVR) + 0.4 * Math.max(0, 30 - age) * 3);
  const safeScore = getReliabilityBand(metrics);

  switch (mode) {
    case REPLACEMENT_MODES.younger.id:
      return Math.round(0.46 * fitProfile.overallFitScore + 0.24 * needMatchScore + 0.3 * upsideScore);
    case REPLACEMENT_MODES.higherUpside.id:
      return Math.round(0.42 * fitProfile.overallFitScore + 0.2 * needMatchScore + 0.38 * upsideScore);
    case REPLACEMENT_MODES.safer.id:
      return Math.round(0.44 * fitProfile.overallFitScore + 0.24 * needMatchScore + 0.32 * safeScore);
    case REPLACEMENT_MODES.squadDepth.id:
      return Math.round(0.58 * fitProfile.overallFitScore + 0.22 * needMatchScore + 0.2 * Math.min(78, toNumber(metrics.finalOVR)));
    default:
      return Math.round(0.6 * fitProfile.overallFitScore + 0.4 * needMatchScore);
  }
}

function buildNeedCandidateEntry(candidate, metrics, fitProfile, need, mode, needMatchScore) {
  const score = computeNeedDrivenScore(mode, fitProfile, metrics, candidate, needMatchScore);
  const fitReason = fitProfile.topFitReasons?.[0] || `Fits the ${need.title.toLowerCase()} brief.`;
  const caution = fitProfile.topConcerns?.[0] || 'No major tactical red flag.';
  const upgradeContext = getUpgradeContext(fitProfile);

  return {
    player: candidate,
    metrics,
    replacementScore: score,
    replacementType: getModeLabel(mode),
    whyFits: fitReason,
    whyItFits: fitReason,
    difference: caution,
    howItDiffers: caution,
    matchType: 'Tactical match',
    expectedRole: fitProfile.expectedRole,
    expectedRoleInTargetTeam: fitProfile.expectedRole,
    upgradeOrDowngradeContext: upgradeContext,
    fitTier: fitProfile.fitTier
  };
}

function buildNeedDrivenCandidates(team, need, players = [], ratingIndex = {}, mode, gapProfile) {
  return players
    .filter((candidate) => candidate.squad !== team.name)
    .map((candidate) => {
      const metrics = computeDisplayMetrics(candidate, ratingIndex);
      const positionOkay =
        (need.positions || []).includes(metrics.exactPosition) ||
        (need.positionModels || []).includes(metrics.positionModel) ||
        (need.roleKeys || []).includes(metrics.primaryTacticalRole) ||
        (need.roleKeys || []).includes(metrics.secondaryTacticalRole);

      if (!positionOkay || toNumber(metrics.minutesPlayed) < 450 || toNumber(metrics.reliabilityModifier) < 0.64) {
        return null;
      }

      const fitProfile = buildPlayerFitProfile(candidate, team, ratingIndex, { metrics, gapProfile });
      const needMatchScore = getNeedMatchScore(metrics, need);

      if (fitProfile.overallFitScore < 56 || needMatchScore < 56) {
        return null;
      }

      return buildNeedCandidateEntry(candidate, metrics, fitProfile, need, mode, needMatchScore);
    })
    .filter(Boolean)
    .sort((left, right) => right.replacementScore - left.replacementScore || right.metrics.finalOVR - left.metrics.finalOVR)
    .slice(0, 4);
}

function buildSourcePlayerScore(mode, similarityScore, fitProfile, metrics, candidatePlayer, sourcePlayer, sourceMetrics) {
  const ageGapBonus = Math.max(0, toNumber(sourcePlayer?.age) - toNumber(candidatePlayer?.age)) * 3;
  const reliabilityScore = getReliabilityBand(metrics);
  const levelBonus = Math.max(0, toNumber(metrics.finalOVR) - toNumber(sourceMetrics.finalOVR)) * 4;

  switch (mode) {
    case REPLACEMENT_MODES.younger.id:
      return Math.round(0.45 * fitProfile.overallFitScore + 0.33 * similarityScore + 0.22 * Math.min(100, 55 + ageGapBonus));
    case REPLACEMENT_MODES.higherUpside.id:
      return Math.round(0.42 * fitProfile.overallFitScore + 0.28 * similarityScore + 0.3 * Math.min(100, 58 + levelBonus));
    case REPLACEMENT_MODES.safer.id:
      return Math.round(0.48 * fitProfile.overallFitScore + 0.2 * similarityScore + 0.32 * reliabilityScore);
    case REPLACEMENT_MODES.squadDepth.id:
      return Math.round(0.56 * fitProfile.overallFitScore + 0.24 * similarityScore + 0.2 * Math.min(82, toNumber(metrics.finalOVR)));
    default:
      return Math.round(0.52 * fitProfile.overallFitScore + 0.48 * similarityScore);
  }
}

function buildSourcePlayerCandidates(team, sourcePlayer, players = [], ratingIndex = {}, mode, gapProfile) {
  const sourceMetrics = computeDisplayMetrics(sourcePlayer, ratingIndex);
  const similarityMode = SOURCE_PLAYER_MODE_MAP[mode] || SIMILARITY_MODES.similarStyle.id;
  const similarityResults = getSimilarPlayersForPlayer(sourcePlayer, players, ratingIndex, similarityMode, {
    samePrimaryRoleOnly: mode === REPLACEMENT_MODES.safer.id || mode === REPLACEMENT_MODES.squadDepth.id
  });

  return similarityResults
    .map((result) => {
      if (result.player.squad === team.name) {
        return null;
      }

      const metrics = result.rating || computeDisplayMetrics(result.player, ratingIndex);
      const fitProfile = buildPlayerFitProfile(result.player, team, ratingIndex, { metrics, gapProfile });

      if (fitProfile.overallFitScore < 52) {
        return null;
      }

      const replacementScore = buildSourcePlayerScore(mode, result.finalSimilarity, fitProfile, metrics, result.player, sourcePlayer, sourceMetrics);
      const fitReason = `${result.explanation} ${fitProfile.topFitReasons?.[0] || ''}`.trim();
      const difference = result.majorDifference || buildDifferenceText(sourceMetrics, metrics);
      const upgradeContext = getUpgradeContext(fitProfile);

      return {
        player: result.player,
        metrics,
        replacementScore,
        replacementType: getModeLabel(mode),
        whyFits: fitReason,
        whyItFits: fitReason,
        difference,
        howItDiffers: difference,
        matchType: mode === REPLACEMENT_MODES.direct.id ? 'Stylistic + tactical match' : 'Tactical match',
        expectedRole: fitProfile.expectedRole,
        expectedRoleInTargetTeam: fitProfile.expectedRole,
        upgradeOrDowngradeContext: upgradeContext,
        fitTier: fitProfile.fitTier
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.replacementScore - left.replacementScore || right.metrics.finalOVR - left.metrics.finalOVR)
    .slice(0, 4);
}

export function buildReplacementFinderProfile({ team, sourcePlayer = null, need = null, players = [], ratingIndex = {}, mode = REPLACEMENT_MODES.direct.id }) {
  if (!team) {
    return {
      mode,
      modeLabel: getModeLabel(mode),
      summary: 'Replacement intelligence is unavailable until a team is selected.',
      candidates: []
    };
  }

  const gapProfile = buildSquadGapFinderProfile(team);
  const resolvedNeed = need || gapProfile.needs[0] || null;
  const candidates = sourcePlayer
    ? buildSourcePlayerCandidates(team, sourcePlayer, players, ratingIndex, mode, gapProfile)
    : resolvedNeed
      ? buildNeedDrivenCandidates(team, resolvedNeed, players, ratingIndex, mode, gapProfile)
      : [];
  const summary = sourcePlayer
    ? `Replacement view for ${sourcePlayer.player} against ${team.displayName || team.name}.`
    : resolvedNeed
      ? `Target list for ${resolvedNeed.title.toLowerCase()}.`
      : 'Replacement intelligence is unavailable for this context.';

  return {
    mode,
    modeLabel: getModeLabel(mode),
    summary,
    anchorLabel: sourcePlayer ? sourcePlayer.player : resolvedNeed?.title || null,
    candidates
  };
}
