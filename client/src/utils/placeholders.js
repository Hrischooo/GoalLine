const LEAGUE_ABBREVIATIONS = {
  'premier league': 'PL',
  bundesliga: 'BL',
  'la liga': 'LL',
  'serie a': 'SA',
  'ligue 1': 'L1',
  'champions league': 'UCL',
  'europa league': 'UEL'
};

const STOP_WORDS = new Set(['fc', 'cf', 'afc', 'sc', 'club', 'de', 'the']);

const PALETTES = [
  ['#213148', '#18202f'],
  ['#2c2943', '#171f31'],
  ['#24353f', '#17232a'],
  ['#3b2a34', '#1d1824'],
  ['#2d3c2c', '#18211a']
];

function getMeaningfulParts(value = '') {
  return String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !STOP_WORDS.has(part.toLowerCase()));
}

function hashString(value = '') {
  return [...String(value)].reduce((total, char) => total + char.charCodeAt(0), 0);
}

export function getInitials(value = '', fallback = 'GL') {
  const parts = getMeaningfulParts(value);

  if (!parts.length) {
    return fallback;
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function getLeagueAbbreviation(leagueName = '', fallback = 'LG') {
  const normalizedLeague = String(leagueName).trim().toLowerCase();

  if (LEAGUE_ABBREVIATIONS[normalizedLeague]) {
    return LEAGUE_ABBREVIATIONS[normalizedLeague];
  }

  return getInitials(leagueName, fallback).slice(0, 3);
}

export function getClubAbbreviation(clubName = '', fallback = 'CL') {
  return getInitials(clubName, fallback);
}

export function getPlaceholderGradient(seed = '') {
  const palette = PALETTES[hashString(seed) % PALETTES.length];
  return `linear-gradient(145deg, ${palette[0]}, ${palette[1]})`;
}
