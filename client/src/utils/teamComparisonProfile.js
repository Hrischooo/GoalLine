import { getTeamDisplayName } from './dataset';
import { toNumber } from './playerMetrics';
import { buildSquadGapFinderProfile } from './squadGapFinder';
import { buildTeamProfile } from './teamProfile';

const IMPORTANT_ROLE_GROUPS = [
  {
    key: 'advanced_creator',
    label: 'Advanced creator',
    roleKeys: ['AdvancedPlaymaker', 'Creative10', 'CentralPlaymaker'],
    positions: ['CAM', 'CM'],
    scorePlayer: (metrics = {}, radar = {}) =>
      0.36 * toNumber(metrics.creativityScore) +
      0.18 * toNumber(metrics.possessionScore) +
      0.16 * toNumber(radar.final_third_delivery?.value || radar.creativity?.value) +
      0.14 * toNumber(radar.progression?.value) +
      0.16 * toNumber(metrics.finalOVR)
  },
  {
    key: 'deep_controller',
    label: 'Deep controller',
    roleKeys: ['DeepLyingPlaymaker', 'CentralPlaymaker', 'Anchor'],
    positions: ['DM', 'CM'],
    scorePlayer: (metrics = {}, radar = {}) =>
      0.32 * toNumber(metrics.possessionScore) +
      0.2 * toNumber(metrics.creativityScore) +
      0.16 * toNumber(metrics.defendingScore) +
      0.16 * toNumber(radar.ball_security?.value || radar.security?.value) +
      0.16 * toNumber(radar.progression?.value || radar.possession_control?.value)
  },
  {
    key: 'ball_winning_dm',
    label: 'Ball-winning DM',
    roleKeys: ['BallWinningMidfielder', 'Anchor'],
    positions: ['DM', 'CM'],
    scorePlayer: (metrics = {}, radar = {}) =>
      0.4 * toNumber(metrics.defendingScore) +
      0.18 * toNumber(metrics.possessionScore) +
      0.24 * toNumber(radar.ball_winning?.value || radar.defending?.value) +
      0.18 * toNumber(radar.positioning?.value || radar.security?.value)
  },
  {
    key: 'attacking_full_back',
    label: 'Attacking full-back',
    roleKeys: ['WingBack', 'FullBack'],
    positions: ['LB', 'RB', 'LWB', 'RWB'],
    scorePlayer: (metrics = {}, radar = {}) =>
      0.28 * toNumber(metrics.attackScore) +
      0.22 * toNumber(metrics.creativityScore) +
      0.18 * toNumber(metrics.possessionScore) +
      0.18 * toNumber(radar.carrying?.value || radar.carry_threat?.value) +
      0.14 * toNumber(radar.delivery?.value || radar.progression?.value)
  },
  {
    key: 'aerial_cb',
    label: 'Aerial CB',
    roleKeys: ['Stopper', 'NoNonsenseDefender', 'BallPlayingDefender'],
    positions: ['CB'],
    scorePlayer: (metrics = {}, radar = {}) =>
      0.34 * toNumber(metrics.defendingScore) +
      0.18 * toNumber(metrics.possessionScore) +
      0.28 * toNumber(radar.aerial?.value) +
      0.2 * toNumber(radar.defending?.value || radar.physical_dueling?.value)
  },
  {
    key: 'direct_winger',
    label: 'Direct winger',
    roleKeys: ['Winger', 'InsideForward'],
    positions: ['LW', 'RW'],
    scorePlayer: (metrics = {}, radar = {}) =>
      0.32 * toNumber(metrics.attackScore) +
      0.18 * toNumber(metrics.creativityScore) +
      0.24 * toNumber(radar.carry_threat?.value || radar.dribbling?.value) +
      0.12 * toNumber(radar.shot_threat?.value) +
      0.14 * toNumber(metrics.finalOVR)
  },
  {
    key: 'secure_buildup_6',
    label: 'Secure buildup 6',
    roleKeys: ['DeepLyingPlaymaker', 'Anchor'],
    positions: ['DM'],
    scorePlayer: (metrics = {}, radar = {}) =>
      0.3 * toNumber(metrics.possessionScore) +
      0.18 * toNumber(metrics.creativityScore) +
      0.16 * toNumber(metrics.defendingScore) +
      0.2 * toNumber(radar.ball_security?.value || radar.security?.value) +
      0.16 * toNumber(radar.progression?.value || radar.distribution?.value)
  },
  {
    key: 'complete_forward',
    label: 'Complete forward',
    roleKeys: ['AdvancedForward', 'DeepLyingForward', 'TargetForward'],
    positions: ['ST', 'CF'],
    scorePlayer: (metrics = {}, radar = {}) =>
      0.34 * toNumber(metrics.attackScore) +
      0.18 * toNumber(metrics.creativityScore) +
      0.16 * toNumber(metrics.possessionScore) +
      0.18 * toNumber(radar.shot_threat?.value || radar.box_presence?.value) +
      0.14 * toNumber(radar.link_play?.value || radar.aerial?.value)
  }
];

export const TEAM_COMPARISON_STYLE_METRICS = [
  { key: 'creativity', label: 'Creativity', description: 'Chance creation and advanced playmaking across the XI.' },
  { key: 'possessionControl', label: 'Possession control', description: 'Control and circulation through buildup and midfield.' },
  { key: 'progression', label: 'Progression', description: 'Ability to move play through lines and into attack.' },
  { key: 'defensiveStability', label: 'Defensive stability', description: 'Protection, line security, and overall defensive base.' },
  { key: 'wideThreat', label: 'Wide threat', description: 'Production and carrying support from the outside lanes.' },
  { key: 'centralThreat', label: 'Central threat', description: 'Central chance creation and striker support.' },
  { key: 'aerialStrength', label: 'Aerial strength', description: 'Duel presence in both boxes and across the spine.' },
  { key: 'ballSecurity', label: 'Ball security', description: 'Retention and safe circulation in key buildup zones.' },
  { key: 'directness', label: 'Directness', description: 'How quickly the structure leans toward vertical attacking output.' },
  { key: 'lineupBalance', label: 'Lineup balance', description: 'Balance between lines and tactical coherence of the XI.' }
];

const LINE_POSITION_GROUPS = {
  attack: new Set(['LW', 'RW', 'ST', 'CF']),
  midfield: new Set(['DM', 'CM', 'CAM', 'LM', 'RM', 'LWB', 'RWB']),
  defense: new Set(['LB', 'RB', 'CB', 'LWB', 'RWB']),
  goalkeeper: new Set(['GK'])
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + toNumber(value), 0) / values.length;
}

function averageTop(entries = [], limit = 2, accessor = (value) => value) {
  return average(entries.slice(0, limit).map(accessor));
}

function getPlayerName(player) {
  return player?.player || 'Unknown Player';
}

function getRadarLookup(player) {
  return player?.metrics?.scoutingMetricMap || {};
}

function getRadarValue(player, key) {
  return toNumber(getRadarLookup(player)?.[key]?.value);
}

function getLineFromPosition(position = '') {
  const normalizedPosition = String(position || '').toUpperCase();

  if (LINE_POSITION_GROUPS.goalkeeper.has(normalizedPosition)) {
    return 'goalkeeper';
  }

  if (LINE_POSITION_GROUPS.attack.has(normalizedPosition)) {
    return 'attack';
  }

  if (LINE_POSITION_GROUPS.midfield.has(normalizedPosition) && !LINE_POSITION_GROUPS.defense.has(normalizedPosition)) {
    return 'midfield';
  }

  if (LINE_POSITION_GROUPS.defense.has(normalizedPosition)) {
    return 'defense';
  }

  return 'midfield';
}

function formatLineLabel(line = '') {
  if (line === 'goalkeeper') {
    return 'Goalkeeper';
  }

  return String(line || '')
    .charAt(0)
    .toUpperCase()
    .concat(String(line || '').slice(1));
}

function formatPriority(priority = '') {
  const normalized = String(priority || '').toLowerCase();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Medium';
}

function getLeaguePeers(team = {}, allTeams = []) {
  return allTeams.filter((candidate) => candidate?.league && team?.league && candidate.league === team.league);
}

function getRelativeLabel(percentile) {
  if (percentile >= 68) {
    return 'Above average';
  }

  if (percentile <= 34) {
    return 'Below average';
  }

  return 'Average';
}

function buildComparisonMetricSnapshot(team = {}) {
  const teamProfile = buildTeamProfile(team);
  const styleMetrics = buildStyleMetrics(team, teamProfile);
  const squadHealth = buildSquadHealth(team, teamProfile);

  return {
    teamRating: Math.round(toNumber(team.teamRating || team.avgRating)),
    attack: Math.round(toNumber(team.lineRatings?.attack)),
    creativity: styleMetrics.creativity,
    possessionControl: styleMetrics.possessionControl,
    defensiveStability: styleMetrics.defensiveStability,
    depthScore: squadHealth.depthScore,
    lineupBalance: styleMetrics.lineupBalance
  };
}

function buildLeagueMetricContext(team = {}, allTeams = [], metricMap = {}) {
  const leaguePeers = getLeaguePeers(team, allTeams);

  if (leaguePeers.length < 3) {
    return {
      sampleSize: leaguePeers.length,
      metrics: {}
    };
  }

  const peerSnapshots = new Map(leaguePeers.map((peer) => [peer.id, buildComparisonMetricSnapshot(peer)]));

  const metrics = Object.fromEntries(
    Object.entries(metricMap).map(([key, value]) => {
      const sorted = [...leaguePeers]
        .map((peer) => ({
          id: peer.id,
          value: toNumber(peerSnapshots.get(peer.id)?.[key])
        }))
        .sort((left, right) => right.value - left.value);
      const rank = sorted.findIndex((entry) => entry.id === team.id) + 1;
      const belowCount = sorted.filter((entry) => entry.value < toNumber(value)).length;
      const percentile = Math.round((belowCount / sorted.length) * 100);

      return [
        key,
        {
          value: Math.round(toNumber(value)),
          percentile,
          rank,
          fieldSize: sorted.length,
          label: getRelativeLabel(percentile)
        }
      ];
    })
  );

  return {
    sampleSize: leaguePeers.length,
    metrics
  };
}

function buildLineDepth(teamProfile = {}) {
  const grouped = {
    attack: [],
    midfield: [],
    defense: [],
    goalkeeper: []
  };

  Object.values(teamProfile.positionDepthMap || {}).forEach((row) => {
    const line = getLineFromPosition(row.position);
    grouped[line].push(row);
  });

  return Object.entries(grouped).map(([line, rows]) => {
    const starterAverage = average(rows.map((row) => row.starterRating));
    const backupAverage = average(rows.map((row) => row.backupRating));
    const dropoffAverage = average(rows.map((row) => row.dropoff));
    const coverageRatio = rows.length ? rows.filter((row) => row.backup).length / rows.length : 0;
    const stabilityScore = clamp(
      Math.round(0.5 * starterAverage + 0.25 * backupAverage + 0.25 * coverageRatio * 100 - Math.max(0, dropoffAverage - 5) * 2.4),
      35,
      95
    );

    return {
      line,
      label: formatLineLabel(line),
      rows,
      starterAverage: Math.round(starterAverage),
      backupAverage: Math.round(backupAverage),
      dropoffAverage: Number(dropoffAverage.toFixed(1)),
      coverageRatio: Number(coverageRatio.toFixed(2)),
      stabilityScore
    };
  });
}

function buildBenchStrength(team = {}) {
  const benchCandidates = team?.bestXI?.benchCandidates || [];
  const benchRatings = benchCandidates.map((entry) => toNumber(entry?.player?.finalOVR || entry?.metrics?.finalOVR));
  const averageBenchRating = average(benchRatings);
  const topSevenAverage = averageTop(
    [...benchCandidates].sort(
      (left, right) => toNumber(right?.player?.finalOVR || right?.metrics?.finalOVR) - toNumber(left?.player?.finalOVR || left?.metrics?.finalOVR)
    ),
    7,
    (entry) => toNumber(entry?.player?.finalOVR || entry?.metrics?.finalOVR)
  );

  return {
    benchCount: benchCandidates.length,
    averageBenchRating: Number(averageBenchRating.toFixed(1)),
    topSevenAverage: Number(topSevenAverage.toFixed(1))
  };
}

function buildRoleCoverageSummary(team = {}, squadPlayers = []) {
  const groups = IMPORTANT_ROLE_GROUPS.map((definition) => {
    const matches = squadPlayers
      .map((player) => {
        const metrics = player.metrics || {};
        const radar = getRadarLookup(player);
        const primaryRole = metrics.primaryTacticalRole;
        const secondaryRole = metrics.secondaryTacticalRole;
        const exactPosition = metrics.exactPosition;
        const roleMatch =
          definition.roleKeys.includes(primaryRole) ||
          (secondaryRole && definition.roleKeys.includes(secondaryRole)) ||
          definition.positions.includes(exactPosition);

        if (!roleMatch) {
          return null;
        }

        return {
          player,
          score: definition.scorePlayer(metrics, radar)
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score);
    const depthScore = averageTop(matches, 2, (entry) => entry.score);
    const count = matches.length;
    let status = 'Missing';

    if (count >= 2 && depthScore >= 72) {
      status = 'Strong';
    } else if (count >= 1 && depthScore >= 64) {
      status = 'Adequate';
    } else if (count >= 1) {
      status = 'Thin';
    }

    return {
      key: definition.key,
      label: definition.label,
      status,
      count,
      score: Math.round(depthScore),
      examples: matches.slice(0, 3).map((entry) => ({
        name: getPlayerName(entry.player),
        position: entry.player?.metrics?.exactPosition || '',
        rating: Math.round(toNumber(entry.player?.metrics?.finalOVR))
      }))
    };
  });

  return {
    groups,
    strong: groups.filter((group) => group.status === 'Strong'),
    adequate: groups.filter((group) => group.status === 'Adequate'),
    thin: groups.filter((group) => group.status === 'Thin'),
    missing: groups.filter((group) => group.status === 'Missing')
  };
}

function buildStyleMetrics(team = {}, teamProfile = {}) {
  const xiPlayers = (teamProfile.bestXI?.xi || []).map((slot) => slot.assignedPlayer).filter(Boolean);
  const attackers = xiPlayers.filter((player) => getLineFromPosition(player?.metrics?.exactPosition) === 'attack');
  const midfielders = xiPlayers.filter((player) => getLineFromPosition(player?.metrics?.exactPosition) === 'midfield');
  const defenders = xiPlayers.filter((player) => getLineFromPosition(player?.metrics?.exactPosition) === 'defense');
  const widePlayers = xiPlayers.filter((player) => ['LW', 'RW', 'LWB', 'RWB', 'LB', 'RB'].includes(player?.metrics?.exactPosition));
  const centralPlayers = xiPlayers.filter((player) => ['DM', 'CM', 'CAM', 'ST', 'CF'].includes(player?.metrics?.exactPosition));
  const lineRatings = teamProfile.lineRatings || {};
  const lineupBalance = clamp(
    Math.round(
      0.42 * toNumber(team?.bestXI?.lineBalanceScore) +
        0.3 * toNumber(team?.bestXI?.roleCoherenceScore) +
        0.28 * toNumber(team?.bestXI?.positionCoverageScore)
    ),
    40,
    95
  );
  const creativity = clamp(
    Math.round(0.6 * average(midfielders.map((player) => player?.metrics?.creativityScore)) + 0.4 * toNumber(teamProfile.styleProfile?.centralCreativity)),
    35,
    95
  );
  const possessionControl = clamp(
    Math.round(
      0.42 * average([...midfielders, ...defenders].map((player) => player?.metrics?.possessionScore)) +
        0.28 * toNumber(teamProfile.styleProfile?.buildupSecurity) +
        0.3 * average(midfielders.map((player) => getRadarValue(player, 'possession_control') || getRadarValue(player, 'ball_security')))
    ),
    35,
    95
  );
  const progression = clamp(
    Math.round(
      0.42 * toNumber(teamProfile.styleProfile?.backProgression) +
        0.28 * average(midfielders.map((player) => getRadarValue(player, 'progression'))) +
        0.3 * average(attackers.map((player) => getRadarValue(player, 'carry_threat') || getRadarValue(player, 'progression')))
    ),
    35,
    95
  );
  const wideThreat = clamp(
    Math.round(
      0.54 * toNumber(teamProfile.styleProfile?.wideCarryThreat) +
        0.22 * average(widePlayers.map((player) => player?.metrics?.attackScore)) +
        0.24 * average(widePlayers.map((player) => getRadarValue(player, 'delivery') || getRadarValue(player, 'carry_threat')))
    ),
    35,
    95
  );
  const centralThreat = clamp(
    Math.round(
      0.4 * toNumber(teamProfile.styleProfile?.centralCreativity) +
        0.3 * toNumber(teamProfile.styleProfile?.strikerShotThreat) +
        0.3 * average(centralPlayers.map((player) => player?.metrics?.attackScore))
    ),
    35,
    95
  );
  const aerialStrength = clamp(
    Math.round(
      0.48 * toNumber(teamProfile.styleProfile?.cbAerial) +
        0.28 * average(attackers.map((player) => getRadarValue(player, 'aerial') || getRadarValue(player, 'box_presence'))) +
        0.24 * average(defenders.map((player) => getRadarValue(player, 'aerial')))
    ),
    35,
    95
  );
  const ballSecurity = clamp(
    Math.round(
      0.46 * toNumber(teamProfile.styleProfile?.buildupSecurity) +
        0.3 * average([...midfielders, ...defenders].map((player) => getRadarValue(player, 'ball_security') || getRadarValue(player, 'security'))) +
        0.24 * possessionControl
    ),
    35,
    95
  );
  const defensiveStability = clamp(
    Math.round(
      0.46 * toNumber(lineRatings.defense) +
        0.2 * toNumber(lineRatings.goalkeeper) +
        0.18 * average(midfielders.map((player) => player?.metrics?.defendingScore)) +
        0.16 * toNumber(teamProfile.styleProfile?.midfieldBallWinning)
    ),
    35,
    95
  );
  const directness = clamp(
    Math.round(
      0.34 * toNumber(teamProfile.styleProfile?.strikerShotThreat) +
        0.24 * wideThreat +
        0.18 * average(attackers.map((player) => player?.metrics?.attackScore)) +
        0.24 * (100 - possessionControl)
    ),
    35,
    95
  );

  return {
    creativity,
    possessionControl,
    progression,
    defensiveStability,
    wideThreat,
    centralThreat,
    aerialStrength,
    ballSecurity,
    directness,
    lineupBalance,
    controlBias: clamp(Math.round(0.44 * possessionControl + 0.32 * ballSecurity + 0.24 * creativity), 35, 95),
    attackingBias: clamp(Math.round(0.45 * centralThreat + 0.28 * wideThreat + 0.27 * directness), 35, 95)
  };
}

function buildSquadHealth(team = {}, teamProfile = {}) {
  const lineDepth = buildLineDepth(teamProfile);
  const benchStrength = buildBenchStrength(team);
  const weakSlots = (teamProfile.weakSlotMap || []).slice(0, 4).map((slot) => ({
    slotId: slot.slotId,
    slotLabel: slot.slotLabel,
    playerName: getPlayerName(slot.assignedPlayer),
    line: slot.line,
    weaknessScore: Math.round(slot.weaknessScore),
    slotRating: Math.round(toNumber(slot.slotAdjustedEffectiveRating)),
    fitScore: Math.round(toNumber(slot.fitScore))
  }));
  const strongestSlots = [...(teamProfile.bestXI?.xi || [])]
    .map((slot) => ({
      slotId: slot.slotId,
      slotLabel: slot.slotLabel,
      playerName: getPlayerName(slot.assignedPlayer),
      line: slot.line,
      slotRating: Math.round(toNumber(slot.slotAdjustedEffectiveRating)),
      fitScore: Math.round(toNumber(slot.fitScore))
    }))
    .sort((left, right) => right.slotRating - left.slotRating)
    .slice(0, 4);
  const fragilePositions = Object.values(teamProfile.positionDepthMap || {})
    .map((row) => ({
      position: row.position,
      starter: getPlayerName(row.starter?.player),
      backup: row.backup?.player ? getPlayerName(row.backup.player) : 'No clear backup',
      dropoff: Math.round(toNumber(row.dropoff)),
      starterRating: Math.round(toNumber(row.starterRating)),
      backupRating: Math.round(toNumber(row.backupRating)),
      fragilityScore: Math.round(
        Math.max(0, toNumber(row.dropoff) - 4) * 4.2 +
          (row.count <= 1 ? 18 : 0) +
          (toNumber(row.backupRating) < 68 ? 12 : 0) +
          (toNumber(row.backupReliability) < 0.78 ? 8 : 0)
      )
    }))
    .sort((left, right) => right.fragilityScore - left.fragilityScore)
    .slice(0, 5);
  const averageDropoff = average(Object.values(teamProfile.positionDepthMap || {}).map((row) => row.dropoff));
  const bestXIStarterAverage = average((teamProfile.bestXI?.xi || []).map((slot) => slot.slotAdjustedEffectiveRating));
  const benchStability = clamp(
    Math.round(
      0.36 * toNumber(benchStrength.topSevenAverage) +
        0.24 * average(lineDepth.map((line) => line.backupAverage)) +
        0.2 * average(lineDepth.map((line) => line.stabilityScore)) +
        0.2 * Math.max(0, 100 - averageDropoff * 4.5)
    ),
    35,
    95
  );
  const depthScore = clamp(
    Math.round(
      0.38 * benchStability +
        0.26 * average(lineDepth.map((line) => line.stabilityScore)) +
        0.22 * bestXIStarterAverage +
        0.14 * Math.max(0, 100 - fragilePositions.reduce((sum, row) => sum + row.fragilityScore, 0) / Math.max(fragilePositions.length, 1))
    ),
    35,
    95
  );
  const overreliance = fragilePositions.slice(0, 3).map((row) => ({
    title: `${row.position} depth leans heavily on ${row.starter}`,
    severity: row.fragilityScore >= 42 ? 'High' : row.fragilityScore >= 28 ? 'Medium' : 'Low',
    detail:
      row.backup === 'No clear backup'
        ? `No reliable second option exists behind the current ${row.position} starter.`
        : `${row.position} drops ${row.dropoff} OVR points from starter to backup.`
  }));

  return {
    bestXIStarterAverage: Number(bestXIStarterAverage.toFixed(1)),
    benchStrength,
    benchStability,
    depthScore,
    averageDropoff: Number(averageDropoff.toFixed(1)),
    strongestSlots,
    weakestSlots: weakSlots,
    fragilePositions,
    overreliance,
    lineDepth
  };
}

function buildRecruitmentSummary(team = {}, gapProfile = {}, roleCoverage = {}) {
  const priorities = (gapProfile.needs || []).slice(0, 4).map((need) => ({
    key: need.key,
    title: need.title,
    explanation: need.explanation,
    priority: formatPriority(need.priority),
    priorityScore: Math.round(toNumber(need.priorityScore)),
    affectedPosition: need.affectedPosition,
    affectedRole: need.affectedRole,
    supportingEvidence: (need.supportingEvidence || []).slice(0, 2)
  }));
  const roleNeeds = [
    ...roleCoverage.missing.map((group) => ({
      label: group.label,
      severity: 'High',
      reason: 'Missing from the current squad model.'
    })),
    ...roleCoverage.thin.slice(0, 3).map((group) => ({
      label: group.label,
      severity: 'Medium',
      reason: `Only ${group.count} credible option${group.count === 1 ? '' : 's'} in the squad.`
    }))
  ].slice(0, 5);

  return {
    summary: gapProfile.summary || `${getTeamDisplayName(team)} do not show a major structural recruitment flag from the current data.`,
    priorities,
    roleNeeds
  };
}

function buildIdentity(team = {}, teamProfile = {}, styleMetrics = {}) {
  const preferredFormation = team?.preferred_formation || 'N/A';
  const detectedFormation = teamProfile.formation || team?.detectedFormation || preferredFormation;
  const strongestLine = formatLineLabel(teamProfile.strongestLine || team?.strongestLine || '');
  const weakestLine = formatLineLabel(teamProfile.weakestLine || team?.weakestLine || '');
  const styleTag =
    styleMetrics.possessionControl >= 72
      ? 'control-led'
      : styleMetrics.directness >= 70
        ? 'vertical'
        : styleMetrics.wideThreat - styleMetrics.centralThreat >= 6
          ? 'wide-led'
          : styleMetrics.centralThreat - styleMetrics.wideThreat >= 6
            ? 'central-led'
            : 'balanced';

  return {
    name: getTeamDisplayName(team),
    league: team?.league || 'Unknown League',
    country: team?.country || '',
    manager: team?.manager || '',
    preferredFormation,
    detectedFormation,
    tacticalIdentitySummary: teamProfile.tacticalIdentitySummary || team?.tacticalIdentitySummary || '',
    strongestLine,
    weakestLine,
    styleTag
  };
}

export function buildTeamComparisonProfile(team = {}, allTeams = []) {
  const teamProfile = buildTeamProfile(team);
  const squadPlayers = team.squadPlayers || [];
  const styleMetrics = buildStyleMetrics(team, teamProfile);
  const squadHealth = buildSquadHealth(team, teamProfile);
  const roleCoverage = buildRoleCoverageSummary(team, squadPlayers);
  const gapProfile = buildSquadGapFinderProfile(team);
  const identity = buildIdentity(team, teamProfile, styleMetrics);
  const strength = {
    teamRating: Math.round(toNumber(team.teamRating || team.avgRating)),
    bestXIRating: Math.round(toNumber(team.bestXI?.overallTeamRating || team.teamRating || team.avgRating)),
    lineRatings: {
      attack: Math.round(toNumber(team.lineRatings?.attack)),
      midfield: Math.round(toNumber(team.lineRatings?.midfield)),
      defense: Math.round(toNumber(team.lineRatings?.defense)),
      goalkeeper: Math.round(toNumber(team.lineRatings?.goalkeeper))
    },
    depthScore: squadHealth.depthScore,
    benchStability: squadHealth.benchStability,
    formationFitScore: Math.round(toNumber(team.bestXI?.formationFitScore || team.formationFitScore)),
    roleCoherence: Math.round(toNumber(team.bestXI?.roleCoherenceScore)),
    positionCoverage: Math.round(toNumber(team.bestXI?.positionCoverageScore)),
    lineBalance: styleMetrics.lineupBalance
  };
  const recruitment = buildRecruitmentSummary(team, gapProfile, roleCoverage);

  const comparisonMetricSnapshot = buildComparisonMetricSnapshot(team);
  const leagueContext = buildLeagueMetricContext(team, allTeams, comparisonMetricSnapshot);

  return {
    id: team.id,
    team,
    identity,
    teamProfile,
    strength,
    style: styleMetrics,
    roleCoverage,
    squadHealth,
    recruitment,
    leagueContext
  };
}
