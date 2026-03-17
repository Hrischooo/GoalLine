import { useEffect, useMemo, useRef, useState } from 'react';
import ClubBadge from './ClubBadge';
import PlayerAvatar from './PlayerAvatar';
import { formatTextValue } from '../utils/playerMetrics';
import { getLeagueName } from '../utils/dataset';
import { normalizeString } from '../utils/search';

const MAX_RESULTS = 8;

export default function ComparePlayerSelector({ label, options, selectedPlayer, selectedValue, onSelect }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(selectedPlayer ? `${selectedPlayer.player} / ${selectedPlayer.squad} / ${getLeagueName(selectedPlayer)}` : '');
  }, [selectedPlayer, selectedValue]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeString(query);

    if (!normalizedQuery) {
      return options.slice(0, MAX_RESULTS);
    }

    return options
      .filter((option) => normalizeString(option.searchText).includes(normalizedQuery))
      .slice(0, MAX_RESULTS);
  }, [options, query]);

  return (
    <div className="compare-selector" ref={containerRef}>
      <div className="compare-selector__header">
        <span>{label}</span>
        {selectedPlayer ? (
          <button
            className="compare-selector__clear"
            onClick={() => {
              onSelect('');
              setQuery('');
            }}
            type="button"
          >
            Clear
          </button>
        ) : null}
      </div>

      {selectedPlayer ? (
        <div className="compare-selector__selected">
          <PlayerAvatar name={selectedPlayer.player} size="small" />
          <div>
            <strong>{formatTextValue(selectedPlayer.player, 'Unknown Player')}</strong>
            <span>
              <ClubBadge name={selectedPlayer.squad} size="small" /> {formatTextValue(selectedPlayer.squad)} / {formatTextValue(getLeagueName(selectedPlayer))}
            </span>
          </div>
        </div>
      ) : null}

      <label className="compare-selector__field">
        <span>Search all players</span>
        <input
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by player, club, league, or role"
          type="text"
          value={query}
        />
      </label>

      {isOpen ? (
        <div className="compare-selector__results">
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                className={`compare-selector__result${selectedValue === option.id ? ' compare-selector__result--active' : ''}`}
                key={option.id}
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
                type="button"
              >
                <PlayerAvatar name={option.player.player} size="small" />
                <div>
                  <strong>{option.player.player}</strong>
                  <span>
                    {option.player.squad} / {getLeagueName(option.player)} / {option.player.pos}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="compare-selector__empty">No players match this search.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
