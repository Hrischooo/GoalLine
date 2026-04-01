import { computeDisplayMetrics, toNumber } from './playerMetrics';

export const FORMATION_TEMPLATES = {
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

export const POSITION_FIT_SCORES = {
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

export function parseListedPositions(player) {
  return String(player?.pos || '')
    .split(/[\/,;]+/)
    .map((part) => String(part || '').trim().toUpperCase())
    .filter(Boolean)
    .map((position) => (position === 'AM' ? 'CAM' : position));
}

export function getPositionFitScore(player, slot) {
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

export function getRoleFitScore(metrics, slot) {
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

export function enrichPlayer(player, ratingIndex) {
  const metrics = computeDisplayMetrics(player, ratingIndex);

  return {
    ...player,
    metrics,
    listedPositions: parseListedPositions(player),
    finalOVR: toNumber(metrics.finalOVR),
    minutesPlayed: toNumber(metrics.minutesPlayed || toNumber(player.matches_played) * toNumber(player.avg_mins_per_match))
  };
}

export function getSlotCandidateScore(player, slot) {
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
