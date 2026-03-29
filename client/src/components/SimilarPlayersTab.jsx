import { useEffect, useMemo, useState } from 'react';
import SimilarPlayerCard from './SimilarPlayerCard';
import SimilarPlayersControls from './SimilarPlayersControls';
import { getSimilarPlayersForPlayer, getSimilarPlayerBuckets, debugSimilarPlayers, SIMILARITY_MODES } from '../utils/similarPlayers';

export default function SimilarPlayersTab({ currentPlayer, leagueFilter, players, ratingIndex, onOpenPlayer }) {
  const [mode, setMode] = useState(SIMILARITY_MODES.similarStyle.id);
  const [filters, setFilters] = useState({
    sameLeagueOnly: false,
    similarAgeOnly: false,
    samePrimaryRoleOnly: false
  });

  const results = useMemo(
    () => getSimilarPlayersForPlayer(currentPlayer, players, ratingIndex, mode, { ...filters, leagueFilter }),
    [currentPlayer, filters, leagueFilter, mode, players, ratingIndex]
  );
  const buckets = useMemo(
    () => getSimilarPlayerBuckets(currentPlayer, players, ratingIndex, { ...filters, leagueFilter }),
    [currentPlayer, filters, leagueFilter, players, ratingIndex]
  );

  useEffect(() => {
    setMode(SIMILARITY_MODES.similarStyle.id);
    setFilters({
      sameLeagueOnly: false,
      similarAgeOnly: false,
      samePrimaryRoleOnly: false
    });
  }, [currentPlayer?.player]);

  useEffect(() => {
    debugSimilarPlayers(currentPlayer, mode, { ...filters, leagueFilter }, results);
  }, [currentPlayer, filters, leagueFilter, mode, results]);

  function handleFilterChange(key, checked) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: checked
    }));
  }

  return (
    <section className="similar-tab">
      <div className="similar-tab__header">
        <div>
          <p className="analysis-kicker">Scouting Matches</p>
          <h2>Similar Players</h2>
          <p className="insight-card__summary">Find role-aware alternatives, upgrades, younger options, and same-level matches from the current dataset.</p>
        </div>
      </div>

      <SimilarPlayersControls
        filters={filters}
        mode={mode}
        onFilterChange={handleFilterChange}
        onModeChange={setMode}
      />

      {buckets.length ? (
        <div className="similar-bucket-grid">
          {buckets.map((bucket) => (
            <button
              className={`similar-bucket-card${mode === bucket.mode ? ' similar-bucket-card--active' : ''}`}
              key={bucket.key}
              onClick={() => setMode(bucket.mode)}
              type="button"
            >
              <div className="similar-bucket-card__top">
                <span>{bucket.tag}</span>
                <strong>{bucket.count}</strong>
              </div>
              <h3>{bucket.label}</h3>
              <p>{bucket.topResult?.player?.player || 'No lead match'}</p>
              <small>{bucket.topResult?.recommendationHeadline || 'No recommendation available.'}</small>
            </button>
          ))}
        </div>
      ) : null}

      {results.length ? (
        <div className="similar-player-list">
          {results.map((result) => (
            <SimilarPlayerCard key={result.player.player} onOpenPlayer={onOpenPlayer} result={result} />
          ))}
        </div>
      ) : (
        <div className="similar-empty-state">
          <h3>No matches found</h3>
          <p>Try Broad mode or relax one of the filters to widen the search pool.</p>
        </div>
      )}
    </section>
  );
}
