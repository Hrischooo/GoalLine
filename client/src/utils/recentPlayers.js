const STORAGE_KEY = 'goalline_recent_players';
const MAX_RECENT_PLAYERS = 8;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getRecentPlayers() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function rememberRecentPlayer(playerEntry) {
  if (!canUseStorage() || !playerEntry?.id) {
    return;
  }

  const nextEntry = {
    id: playerEntry.id,
    name: playerEntry.name || '',
    squad: playerEntry.squad || '',
    league: playerEntry.league || '',
    pos: playerEntry.pos || ''
  };

  const existing = getRecentPlayers().filter((entry) => entry?.id && entry.id !== nextEntry.id);
  const nextList = [nextEntry, ...existing].slice(0, MAX_RECENT_PLAYERS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  } catch (error) {
    // Ignore storage failures and keep the UX functional.
  }
}
