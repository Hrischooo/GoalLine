import { computeDisplayMetrics, formatStatValue, toNumber } from './playerMetrics';

const FORMATION_TEMPLATES = {
  '4-3-3': [
    { id: 'gk', label: 'GK', positions: ['GK'], line: 'goalkeeper', weight: 0.9, roleKeys: ['Goalkeeper'] },
    { id: 'lb', label: 'LB', positions: ['LB', 'LWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'lcb', label: 'LCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rcb', label: 'RCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rb', label: 'RB', positions: ['RB', 'RWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'dm', label: 'DM', positions: ['DM', 'CM'], line: 'midfield', weight: 1.02, roleKeys: ['Anchor', 'DeepLyingPlaymaker', 'BallWinningMidfielder'] },
    { id: 'lcm', label: 'LCM', positions: ['CM', 'DM', 'CAM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rcm', label: 'RCM', positions: ['CM', 'DM', 'CAM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'lw', label: 'LW', positions: ['LW', 'RW'], line: 'attack', weight: 1, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] },
    { id: 'st', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.08, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] },
    { id: 'rw', label: 'RW', positions: ['RW', 'LW'], line: 'attack', weight: 1, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] }
  ],
  '4-2-3-1': [
    { id: 'gk', label: 'GK', positions: ['GK'], line: 'goalkeeper', weight: 0.9, roleKeys: ['Goalkeeper'] },
    { id: 'lb', label: 'LB', positions: ['LB', 'LWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'lcb', label: 'LCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rcb', label: 'RCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rb', label: 'RB', positions: ['RB', 'RWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'ldm', label: 'DM', positions: ['DM', 'CM'], line: 'midfield', weight: 1.02, roleKeys: ['Anchor', 'DeepLyingPlaymaker', 'BallWinningMidfielder'] },
    { id: 'rdm', label: 'DM', positions: ['DM', 'CM'], line: 'midfield', weight: 1.02, roleKeys: ['Anchor', 'DeepLyingPlaymaker', 'BallWinningMidfielder'] },
    { id: 'cam', label: 'CAM', positions: ['CAM', 'CM', 'ST'], line: 'midfield', weight: 1.02, roleKeys: ['AdvancedPlaymaker', 'Creative10', 'ShadowStriker'] },
    { id: 'lw', label: 'LW', positions: ['LW', 'RW', 'CAM'], line: 'attack', weight: 0.98, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] },
    { id: 'rw', label: 'RW', positions: ['RW', 'LW', 'CAM'], line: 'attack', weight: 0.98, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] },
    { id: 'st', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.08, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] }
  ],
  '4-4-2': [
    { id: 'gk', label: 'GK', positions: ['GK'], line: 'goalkeeper', weight: 0.9, roleKeys: ['Goalkeeper'] },
    { id: 'lb', label: 'LB', positions: ['LB', 'LWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'lcb', label: 'LCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rcb', label: 'RCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rb', label: 'RB', positions: ['RB', 'RWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'lm', label: 'LW', positions: ['LW', 'LWB', 'CAM'], line: 'midfield', weight: 0.96, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] },
    { id: 'lcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rm', label: 'RW', positions: ['RW', 'RWB', 'CAM'], line: 'midfield', weight: 0.96, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] },
    { id: 'lst', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.04, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] },
    { id: 'rst', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.04, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] }
  ],
  '3-5-2': [
    { id: 'gk', label: 'GK', positions: ['GK'], line: 'goalkeeper', weight: 0.9, roleKeys: ['Goalkeeper'] },
    { id: 'lcb', label: 'LCB', positions: ['CB', 'LB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'cb', label: 'CB', positions: ['CB'], line: 'defense', weight: 1.02, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rcb', label: 'RCB', positions: ['CB', 'RB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'lwb', label: 'LWB', positions: ['LWB', 'LB', 'LW'], line: 'midfield', weight: 0.98, roleKeys: ['WingBack', 'FullBack', 'Winger'] },
    { id: 'ldm', label: 'DM', positions: ['DM', 'CM'], line: 'midfield', weight: 1.02, roleKeys: ['Anchor', 'DeepLyingPlaymaker', 'BallWinningMidfielder'] },
    { id: 'cm', label: 'CM', positions: ['CM', 'DM', 'CAM'], line: 'midfield', weight: 1, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rdm', label: 'DM', positions: ['DM', 'CM'], line: 'midfield', weight: 1.02, roleKeys: ['Anchor', 'DeepLyingPlaymaker', 'BallWinningMidfielder'] },
    { id: 'rwb', label: 'RWB', positions: ['RWB', 'RB', 'RW'], line: 'midfield', weight: 0.98, roleKeys: ['WingBack', 'FullBack', 'Winger'] },
    { id: 'lst', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.04, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] },
    { id: 'rst', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.04, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] }
  ],
  '3-4-3': [
    { id: 'gk', label: 'GK', positions: ['GK'], line: 'goalkeeper', weight: 0.9, roleKeys: ['Goalkeeper'] },
    { id: 'lcb', label: 'LCB', positions: ['CB', 'LB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'cb', label: 'CB', positions: ['CB'], line: 'defense', weight: 1.02, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rcb', label: 'RCB', positions: ['CB', 'RB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'lwb', label: 'LWB', positions: ['LWB', 'LB', 'LW'], line: 'midfield', weight: 0.96, roleKeys: ['WingBack', 'FullBack', 'Winger'] },
    { id: 'lcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rwb', label: 'RWB', positions: ['RWB', 'RB', 'RW'], line: 'midfield', weight: 0.96, roleKeys: ['WingBack', 'FullBack', 'Winger'] },
    { id: 'lw', label: 'LW', positions: ['LW', 'CAM'], line: 'attack', weight: 1, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] },
    { id: 'st', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.08, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] },
    { id: 'rw', label: 'RW', positions: ['RW', 'CAM'], line: 'attack', weight: 1, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] }
  ],
  '4-1-4-1': [
    { id: 'gk', label: 'GK', positions: ['GK'], line: 'goalkeeper', weight: 0.9, roleKeys: ['Goalkeeper'] },
    { id: 'lb', label: 'LB', positions: ['LB', 'LWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'lcb', label: 'LCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rcb', label: 'RCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rb', label: 'RB', positions: ['RB', 'RWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'dm', label: 'DM', positions: ['DM', 'CM'], line: 'midfield', weight: 1.02, roleKeys: ['Anchor', 'DeepLyingPlaymaker', 'BallWinningMidfielder'] },
    { id: 'lm', label: 'LW', positions: ['LW', 'CAM', 'CM'], line: 'midfield', weight: 0.96, roleKeys: ['Winger', 'WidePlaymaker', 'InsideForward'] },
    { id: 'lcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rm', label: 'RW', positions: ['RW', 'CAM', 'CM'], line: 'midfield', weight: 0.96, roleKeys: ['Winger', 'WidePlaymaker', 'InsideForward'] },
    { id: 'st', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.08, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] }
  ],
  '4-1-2-1-2': [
    { id: 'gk', label: 'GK', positions: ['GK'], line: 'goalkeeper', weight: 0.9, roleKeys: ['Goalkeeper'] },
    { id: 'lb', label: 'LB', positions: ['LB', 'LWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'lcb', label: 'LCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rcb', label: 'RCB', positions: ['CB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rb', label: 'RB', positions: ['RB', 'RWB'], line: 'defense', weight: 0.95, roleKeys: ['FullBack', 'WingBack', 'DefensiveFullBack'] },
    { id: 'dm', label: 'DM', positions: ['DM', 'CM'], line: 'midfield', weight: 1.02, roleKeys: ['Anchor', 'DeepLyingPlaymaker', 'BallWinningMidfielder'] },
    { id: 'lcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'cam', label: 'CAM', positions: ['CAM', 'CM', 'ST'], line: 'midfield', weight: 1.02, roleKeys: ['AdvancedPlaymaker', 'Creative10', 'ShadowStriker'] },
    { id: 'lst', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.04, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] },
    { id: 'rst', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.04, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] }
  ],
  '5-3-2': [
    { id: 'gk', label: 'GK', positions: ['GK'], line: 'goalkeeper', weight: 0.9, roleKeys: ['Goalkeeper'] },
    { id: 'lcb', label: 'LCB', positions: ['CB', 'LB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'cb', label: 'CB', positions: ['CB'], line: 'defense', weight: 1.02, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rcb', label: 'RCB', positions: ['CB', 'RB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'lwb', label: 'LWB', positions: ['LWB', 'LB', 'LW'], line: 'defense', weight: 0.95, roleKeys: ['WingBack', 'FullBack', 'DefensiveFullBack'] },
    { id: 'rwb', label: 'RWB', positions: ['RWB', 'RB', 'RW'], line: 'defense', weight: 0.95, roleKeys: ['WingBack', 'FullBack', 'DefensiveFullBack'] },
    { id: 'dm', label: 'DM', positions: ['DM', 'CM'], line: 'midfield', weight: 1.02, roleKeys: ['Anchor', 'DeepLyingPlaymaker', 'BallWinningMidfielder'] },
    { id: 'lcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'lst', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.04, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] },
    { id: 'rst', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.04, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] }
  ],
  '5-2-3': [
    { id: 'gk', label: 'GK', positions: ['GK'], line: 'goalkeeper', weight: 0.9, roleKeys: ['Goalkeeper'] },
    { id: 'lcb', label: 'LCB', positions: ['CB', 'LB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'cb', label: 'CB', positions: ['CB'], line: 'defense', weight: 1.02, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'rcb', label: 'RCB', positions: ['CB', 'RB'], line: 'defense', weight: 1, roleKeys: ['BallPlayingDefender', 'Stopper', 'NoNonsenseDefender'] },
    { id: 'lwb', label: 'LWB', positions: ['LWB', 'LB', 'LW'], line: 'defense', weight: 0.95, roleKeys: ['WingBack', 'FullBack', 'DefensiveFullBack'] },
    { id: 'rwb', label: 'RWB', positions: ['RWB', 'RB', 'RW'], line: 'defense', weight: 0.95, roleKeys: ['WingBack', 'FullBack', 'DefensiveFullBack'] },
    { id: 'lcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'rcm', label: 'CM', positions: ['CM', 'DM'], line: 'midfield', weight: 0.98, roleKeys: ['BoxToBox', 'CentralPlaymaker', 'SupportCM'] },
    { id: 'lw', label: 'LW', positions: ['LW', 'CAM'], line: 'attack', weight: 1, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] },
    { id: 'st', label: 'ST', positions: ['ST', 'CF'], line: 'attack', weight: 1.08, roleKeys: ['AdvancedForward', 'Poacher', 'DeepLyingForward', 'TargetForward'] },
    { id: 'rw', label: 'RW', positions: ['RW', 'CAM'], line: 'attack', weight: 1, roleKeys: ['Winger', 'InsideForward', 'WidePlaymaker'] }
  ]
};

const POSITION_FIT_SCORES = {
  exact: 1,
  primaryFallback: 0.93,
  familyFallback: 0.82,
  emergency: 0.68
};

const POSITION_FALLBACKS = {
  GK: ['GK'],
  CB: ['LB', 'RB', 'DM'],
  LB: ['LWB', 'CB', 'LW'],
  RB: ['RWB', 'CB', 'RW'],
  LWB: ['LB', 'LW'],
  RWB: ['RB', 'RW'],
  DM: ['CM', 'CB'],
  CM: ['DM', 'CAM'],
  CAM: ['CM', 'ST', 'LW', 'RW'],
  LW: ['RW', 'CAM', 'LWB', 'ST'],
  RW: ['LW', 'CAM', 'RWB', 'ST'],
  ST: ['CF', 'CAM', 'LW', 'RW'],
  CF: ['ST', 'CAM']
};

const POSITION_FAMILIES = {
  GK: 'goalkeeper',
  CB: 'defense',
  LB: 'defense',
  RB: 'defense',
  LWB: 'defense',
  RWB: 'defense',
  DM: 'midfield',
  CM: 'midfield',
  CAM: 'midfield',
  LW: 'attack',
  RW: 'attack',
  ST: 'attack',
  CF: 'attack'
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundRating(value) {
  return Math.round(clamp(value, 1, 99));
}

function parseListedPositions(player) {
  return String(player?.pos || '')
    .split(/[\/,;]+/)
    .map((part) => String(part || '').trim().toUpperCase())
    .filter(Boolean)
    .map((position) => (position === 'AM' ? 'CAM' : position));
}

function getPositionFitScore(player, slot) {
  const listedPositions = parseListedPositions(player);
  const primaryPosition = listedPositions[0] || 'CM';
  const slotPositions = slot.positions || [];

  if (slotPositions.includes(primaryPosition)) {
    return POSITION_FIT_SCORES.exact;
  }

  if (listedPositions.some((position) => slotPositions.includes(position))) {
    return POSITION_FIT_SCORES.primaryFallback;
  }

  const hasPrimaryFallback = slotPositions.some((position) => (POSITION_FALLBACKS[position] || []).includes(primaryPosition));

  if (hasPrimaryFallback) {
    return POSITION_FIT_SCORES.primaryFallback;
  }

  const playerFamily = POSITION_FAMILIES[primaryPosition] || 'midfield';
  const slotFamily = POSITION_FAMILIES[slotPositions[0]] || 'midfield';

  if (playerFamily === slotFamily) {
    return POSITION_FIT_SCORES.familyFallback;
  }

  return POSITION_FIT_SCORES.emergency;
}

function getRoleFitScore(metrics, slot) {
  const roleKeys = slot.roleKeys || [];

  if (!roleKeys.length || !metrics?.primaryTacticalRole) {
    return 0.84;
  }

  if (roleKeys.includes(metrics.primaryTacticalRole)) {
    return 1;
  }

  if (metrics.secondaryTacticalRole && roleKeys.includes(metrics.secondaryTacticalRole)) {
    return 0.92;
  }

  return 0.8;
}

function enrichPlayer(player, ratingIndex) {
  const metrics = computeDisplayMetrics(player, ratingIndex);

  return {
    ...player,
    metrics,
    listedPositions: parseListedPositions(player),
    finalOVR: toNumber(metrics.finalOVR),
    minutesPlayed: toNumber(metrics.minutesPlayed || toNumber(player.matches_played) * toNumber(player.avg_mins_per_match))
  };
}

function getSlotCandidateScore(player, slot) {
  const positionFitScore = getPositionFitScore(player, slot);
  const roleFitScore = getRoleFitScore(player.metrics, slot);
  const slotAdjustedEffectiveRating = Number((player.finalOVR * slot.weight * positionFitScore * roleFitScore).toFixed(2));

  return {
    player,
    slotId: slot.id,
    slotLabel: slot.label,
    positionFitScore: Number(positionFitScore.toFixed(2)),
    roleFitScore: Number(roleFitScore.toFixed(2)),
    slotAdjustedEffectiveRating,
    fitScore: Number((100 * positionFitScore * roleFitScore).toFixed(1))
  };
}

function pickBestXiForFormation(enrichedPlayers, formation) {
  const slots = FORMATION_TEMPLATES[formation] || [];
  const usedPlayerKeys = new Set();
  const xi = [];

  const slotOrder = [...slots].sort((left, right) => {
    const leftStrongMatches = enrichedPlayers.filter((player) => getPositionFitScore(player, left) >= POSITION_FIT_SCORES.primaryFallback).length;
    const rightStrongMatches = enrichedPlayers.filter((player) => getPositionFitScore(player, right) >= POSITION_FIT_SCORES.primaryFallback).length;
    return leftStrongMatches - rightStrongMatches;
  });

  for (const slot of slotOrder) {
    const bestCandidate = enrichedPlayers
      .filter((player) => !usedPlayerKeys.has(player.player))
      .map((player) => getSlotCandidateScore(player, slot))
      .sort((left, right) => {
        if (right.slotAdjustedEffectiveRating !== left.slotAdjustedEffectiveRating) {
          return right.slotAdjustedEffectiveRating - left.slotAdjustedEffectiveRating;
        }

        if (right.positionFitScore !== left.positionFitScore) {
          return right.positionFitScore - left.positionFitScore;
        }

        return right.player.minutesPlayed - left.player.minutesPlayed;
      })[0];

    if (!bestCandidate) {
      continue;
    }

    usedPlayerKeys.add(bestCandidate.player.player);
    xi.push({
      slotId: slot.id,
      slotLabel: slot.label,
      line: slot.line,
      positions: slot.positions,
      weight: slot.weight,
      assignedPlayer: bestCandidate.player,
      positionFitScore: bestCandidate.positionFitScore,
      roleFitScore: bestCandidate.roleFitScore,
      slotAdjustedEffectiveRating: bestCandidate.slotAdjustedEffectiveRating,
      fitScore: bestCandidate.fitScore
    });
  }

  const orderedXi = slots
    .map((slot) => xi.find((slotEntry) => slotEntry.slotId === slot.id))
    .filter(Boolean);
  const averageEffectiveRating =
    orderedXi.reduce((sum, slot) => sum + slot.slotAdjustedEffectiveRating, 0) / Math.max(orderedXi.length, 1);
  const averageFit =
    orderedXi.reduce((sum, slot) => sum + slot.positionFitScore * slot.roleFitScore, 0) / Math.max(orderedXi.length, 1);
  const coverageRatio = orderedXi.length / Math.max(slots.length, 1);
  const formationFitScore = Number((averageEffectiveRating * (0.62 + averageFit * 0.38) * coverageRatio).toFixed(2));

  return {
    formation,
    slots,
    xi: orderedXi,
    formationFitScore,
    coverageRatio,
    averageFit
  };
}

export function detectFormationForTeam(players = [], ratingIndex = {}, preferredFormation = '') {
  const enrichedPlayers = players.map((player) => enrichPlayer(player, ratingIndex));
  const candidates = Object.keys(FORMATION_TEMPLATES)
    .map((formation) => pickBestXiForFormation(enrichedPlayers, formation))
    .sort((left, right) => right.formationFitScore - left.formationFitScore);

  const bestFormation = candidates[0];
  const secondBest = candidates[1];
  const gap = bestFormation && secondBest ? bestFormation.formationFitScore - secondBest.formationFitScore : 0;
  const confidence = clamp(
    (bestFormation?.averageFit || 0) * 0.72 + (bestFormation?.coverageRatio || 0) * 0.18 + clamp(gap / 12, 0, 0.1),
    0,
    1
  );

  return {
    detectedFormation: bestFormation?.formation || preferredFormation || '4-3-3',
    formationConfidence: Number(confidence.toFixed(2)),
    formationFitScore: Number((bestFormation?.formationFitScore || 0).toFixed(2)),
    chosenXI: bestFormation?.xi || [],
    formationCandidates: candidates.slice(0, 3)
  };
}

function buildLineRatings(xi = []) {
  const grouped = {
    attack: xi.filter((slot) => slot.line === 'attack'),
    midfield: xi.filter((slot) => slot.line === 'midfield'),
    defense: xi.filter((slot) => slot.line === 'defense'),
    goalkeeper: xi.filter((slot) => slot.line === 'goalkeeper')
  };

  return Object.fromEntries(
    Object.entries(grouped).map(([line, slots]) => [
      line,
      slots.length ? roundRating(slots.reduce((sum, slot) => sum + slot.slotAdjustedEffectiveRating, 0) / slots.length) : 0
    ])
  );
}

function buildQualityFlags(xi = [], lineRatings, formationConfidence) {
  const flags = [];

  if (xi.some((slot) => slot.positionFitScore < 0.8)) {
    flags.push('out_of_position_starter');
  }

  if (Object.values(lineRatings).some((rating) => rating && rating < 62)) {
    flags.push('weak_line');
  }

  if (formationConfidence < 0.62) {
    flags.push('low_formation_confidence');
  }

  return flags;
}

function buildBenchCandidates(enrichedPlayers, xi = []) {
  const selectedNames = new Set(xi.map((slot) => slot.assignedPlayer?.player));

  return enrichedPlayers
    .filter((player) => !selectedNames.has(player.player))
    .sort((left, right) => right.finalOVR - left.finalOVR || right.minutesPlayed - left.minutesPlayed)
    .slice(0, 7)
    .map((player) => ({
      player,
      metrics: player.metrics
    }));
}

export function getBestXIForTeam(players = [], team = {}, ratingIndex = {}, options = {}) {
  const enrichedPlayers = players.map((player) => enrichPlayer(player, ratingIndex));
  const formationResult =
    options.formation && FORMATION_TEMPLATES[options.formation]
      ? pickBestXiForFormation(enrichedPlayers, options.formation)
      : detectFormationForTeam(players, ratingIndex, team.preferred_formation || team.detectedFormation || '');
  const xi = formationResult.xi || formationResult.chosenXI || [];
  const lineRatings = buildLineRatings(xi);
  const weightedAverage =
    0.3 * lineRatings.attack + 0.32 * lineRatings.midfield + 0.28 * lineRatings.defense + 0.1 * lineRatings.goalkeeper;
  const coherenceFactor =
    0.94 +
    0.03 * toNumber(formationResult.formationConfidence) +
    0.03 * (xi.reduce((sum, slot) => sum + slot.positionFitScore * slot.roleFitScore, 0) / Math.max(xi.length, 1));
  const weakLinkPenalty = Math.max(0, 68 - Math.min(...xi.map((slot) => slot.slotAdjustedEffectiveRating), 68)) * 0.08;
  const overallTeamRating = roundRating(weightedAverage * coherenceFactor - weakLinkPenalty);
  const qualityFlags = buildQualityFlags(xi, lineRatings, toNumber(formationResult.formationConfidence));

  return {
    formation: formationResult.detectedFormation || formationResult.formation || options.formation || team.detectedFormation || '4-3-3',
    xi,
    benchCandidates: buildBenchCandidates(enrichedPlayers, xi),
    overallTeamRating,
    lineRatings,
    formationConfidence: Number(toNumber(formationResult.formationConfidence).toFixed(2)),
    formationFitScore: Number(toNumber(formationResult.formationFitScore).toFixed(2)),
    qualityFlags
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

function getStrongestAndWeakestLines(lineRatings) {
  const lineEntries = Object.entries(lineRatings).filter(([, value]) => value > 0);
  const strongest = [...lineEntries].sort((left, right) => right[1] - left[1])[0];
  const weakest = [...lineEntries].sort((left, right) => left[1] - right[1])[0];

  return {
    strongestLine: strongest ? strongest[0] : 'attack',
    weakestLine: weakest ? weakest[0] : 'defense'
  };
}

function buildTacticalIdentitySummary(bestXI, squadSummary) {
  const categoryAverages = bestXI.xi.reduce(
    (accumulator, slot) => {
      const scores = slot.assignedPlayer?.metrics?.categoryScores || {};
      accumulator.attacking += toNumber(scores.attacking);
      accumulator.playmaking += toNumber(scores.playmaking);
      accumulator.possession += toNumber(scores.possession);
      accumulator.defending += toNumber(scores.defending);
      accumulator.count += 1;
      return accumulator;
    },
    { attacking: 0, playmaking: 0, possession: 0, defending: 0, count: 0 }
  );

  const divisor = Math.max(categoryAverages.count, 1);
  const attacking = categoryAverages.attacking / divisor;
  const playmaking = categoryAverages.playmaking / divisor;
  const possession = categoryAverages.possession / divisor;
  const defending = categoryAverages.defending / divisor;
  const wingerCount = bestXI.xi.filter((slot) => ['LW', 'RW', 'LWB', 'RWB'].includes(slot.slotLabel)).length;

  if (playmaking >= 72 && wingerCount >= 2) {
    return 'High chance-creation wide team';
  }

  if (possession >= 72 && squadSummary.midfieldCount >= squadSummary.attackCount) {
    return 'Possession-oriented midfield-heavy side';
  }

  if (attacking >= 70 && squadSummary.topScorerGoals >= 10) {
    return 'Direct, striker-focused attacking profile';
  }

  if (defending >= 68 && playmaking < 60) {
    return 'Defensively stable but low-creation squad';
  }

  return 'Balanced side with mixed creation and control profiles';
}

function buildStrengthsWeaknesses(bestXI) {
  const categoryEntries = ['attacking', 'playmaking', 'possession', 'defending']
    .map((categoryKey) => ({
      key: categoryKey,
      label: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
      score:
        bestXI.xi.reduce((sum, slot) => sum + toNumber(slot.assignedPlayer?.metrics?.categoryScores?.[categoryKey]), 0) /
        Math.max(bestXI.xi.length, 1)
    }))
    .sort((left, right) => right.score - left.score);

  return {
    strengths: categoryEntries.slice(0, 2).map((entry) => `${entry.label} (${formatStatValue(entry.score)})`),
    weaknesses: [...categoryEntries].reverse().slice(0, 2).map((entry) => `${entry.label} (${formatStatValue(entry.score)})`)
  };
}

export function buildTeamAnalytics(team, players = [], ratingIndex = {}) {
  const enrichedPlayers = players.map((player) => enrichPlayer(player, ratingIndex));
  const bestXI = getBestXIForTeam(players, team, ratingIndex);
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
  const keyPlayers = [...bestXI.xi]
    .sort((left, right) => right.slotAdjustedEffectiveRating - left.slotAdjustedEffectiveRating)
    .slice(0, 4)
    .map((slot) => slot.assignedPlayer);
  const depthChart = buildPositionDepth(enrichedPlayers);
  const lineSummary = getStrongestAndWeakestLines(bestXI.lineRatings);
  const strengthsWeaknesses = buildStrengthsWeaknesses(bestXI);

  return {
    squadPlayers: enrichedPlayers,
    squadSize,
    averageAge: Number(averageAge.toFixed(1)),
    averageOVR: Number(averageOVR.toFixed(1)),
    totalGoals,
    totalAssists,
    detectedFormation: bestXI.formation,
    formationConfidence: bestXI.formationConfidence,
    formationFitScore: bestXI.formationFitScore,
    bestXI,
    teamRating: bestXI.overallTeamRating,
    lineRatings: bestXI.lineRatings,
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
    tacticalIdentitySummary: buildTacticalIdentitySummary(bestXI, squadSummary),
    strengths: strengthsWeaknesses.strengths,
    weaknesses: strengthsWeaknesses.weaknesses
  };
}
