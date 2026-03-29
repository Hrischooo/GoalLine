export function normalizeString(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createRouteId(value = '') {
  return normalizeString(value).replace(/\s+/g, '-').replace(/\//g, '-');
}

function tokenize(value = '') {
  return normalizeString(value).split(' ').filter(Boolean);
}

function getMetadataFields(result) {
  if (result.metadataFieldsNormalized) {
    return result.metadataFieldsNormalized;
  }

  if (result.type === 'player') {
    return [result.team, result.position, result.nationality, result.league].map((field) => normalizeString(field)).filter(Boolean);
  }

  if (result.type === 'team') {
    return [result.league, result.country, result.manager, result.formation].map((field) => normalizeString(field)).filter(Boolean);
  }

  return [result.country, result.season, result.division].map((field) => normalizeString(field)).filter(Boolean);
}

export function scoreResult(result, query) {
  const normalizedQuery = normalizeString(query);

  if (!normalizedQuery) {
    return 0;
  }

  const normalizedName = result.nameNormalized || normalizeString(result.name);
  const nameTokens = result.nameTokens || tokenize(result.name);
  const metadataFields = getMetadataFields(result);
  const metadataText = metadataFields.join(' ');
  const queryTokens = tokenize(normalizedQuery);
  let score = 0;

  // Score bands stay separated so strong name matches always outrank broader metadata contains matches.
  if (normalizedName.startsWith(normalizedQuery)) {
    score = Math.max(score, 1000 - Math.min(normalizedName.length, 120));
  }

  if (nameTokens.includes(normalizedQuery)) {
    score = Math.max(score, 850);
  }

  if (normalizedName.includes(normalizedQuery)) {
    score = Math.max(score, 720 - normalizedName.indexOf(normalizedQuery));
  }

  if (queryTokens.length > 1 && queryTokens.every((token) => normalizedName.includes(token))) {
    score = Math.max(score, 690);
  }

  if (metadataFields.some((field) => field.startsWith(normalizedQuery))) {
    score = Math.max(score, 560);
  }

  if (metadataFields.some((field) => tokenize(field).includes(normalizedQuery))) {
    score = Math.max(score, 500);
  }

  if (metadataText.includes(normalizedQuery)) {
    score = Math.max(score, 420);
  }

  if (!score && queryTokens.length > 1) {
    const combined = result.searchTextNormalized || `${normalizedName} ${metadataText}`.trim();

    if (queryTokens.every((token) => combined.includes(token))) {
      score = 360;
    }
  }

  return score + Math.min(result.popularity || 0, 999) / 1000;
}

function compareResults(left, right) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  if ((right.popularity || 0) !== (left.popularity || 0)) {
    return (right.popularity || 0) - (left.popularity || 0);
  }

  return left.name.localeCompare(right.name);
}

function decorateResults(items, type, query, limit) {
  return items
    .map((item) => ({
      ...item,
      type,
      score: scoreResult({ ...item, type }, query)
    }))
    .filter((item) => item.score > 0)
    .sort(compareResults)
    .slice(0, limit);
}

export function searchEntities({ query, players = [], teams = [], leagues = [], limit = 6 }) {
  const normalizedQuery = normalizeString(query);

  if (normalizedQuery.length < 2) {
    return {
      players: [],
      teams: [],
      leagues: []
    };
  }

  return {
    players: decorateResults(players, 'player', normalizedQuery, limit),
    teams: decorateResults(teams, 'team', normalizedQuery, limit),
    leagues: decorateResults(leagues, 'league', normalizedQuery, limit)
  };
}

export function getPopularResults({ players = [], teams = [], leagues = [], playerLimit = 4, teamLimit = 4, leagueLimit = 4 }) {
  const byPopularity = (left, right) => {
    if ((right.popularity || 0) !== (left.popularity || 0)) {
      return (right.popularity || 0) - (left.popularity || 0);
    }

    return left.name.localeCompare(right.name);
  };

  return {
    players: [...players]
      .map((item) => ({ ...item, type: 'player', score: item.popularity || 0 }))
      .sort(byPopularity)
      .slice(0, playerLimit),
    teams: [...teams]
      .map((item) => ({ ...item, type: 'team', score: item.popularity || 0 }))
      .sort(byPopularity)
      .slice(0, teamLimit),
    leagues: [...leagues]
      .map((item) => ({ ...item, type: 'league', score: item.popularity || 0 }))
      .sort(byPopularity)
      .slice(0, leagueLimit)
  };
}

export function searchResultsToFlatList(groupedResults) {
  return [...(groupedResults.players || []), ...(groupedResults.teams || []), ...(groupedResults.leagues || [])];
}
