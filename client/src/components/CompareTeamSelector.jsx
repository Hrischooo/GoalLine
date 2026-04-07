import { useEffect, useMemo, useRef, useState } from 'react';
import ClubBadge from './ClubBadge';
import { normalizeString, scoreResult } from '../utils/search';

const MAX_RESULTS = 8;

function TeamResult({ active, onHover, onSelect, option, query }) {
  const lowerName = option.name.toLowerCase();
  const lowerQuery = String(query || '').toLowerCase().trim();
  const matchIndex = lowerQuery ? lowerName.indexOf(lowerQuery) : -1;
  const label =
    matchIndex >= 0
      ? [
          option.name.slice(0, matchIndex),
          <mark key={`${option.id}-mark`}>{option.name.slice(matchIndex, matchIndex + lowerQuery.length)}</mark>,
          option.name.slice(matchIndex + lowerQuery.length)
        ]
      : option.name;

  return (
    <button className={`compare-selector__result${active ? ' compare-selector__result--active' : ''}`} onClick={onSelect} onMouseEnter={onHover} type="button">
      <ClubBadge name={option.name} size="small" />
      <div>
        <strong>{label}</strong>
        <span>
          {option.league} / {option.formation} / {option.rating} OVR
        </span>
      </div>
    </button>
  );
}

export default function CompareTeamSelector({ label, onSelect, options, selectedTeam, selectedValue }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [leagueFilter, setLeagueFilter] = useState('all');
  const containerRef = useRef(null);
  const normalizedQuery = normalizeString(query);
  const selectedOption = useMemo(() => options.find((option) => option.id === selectedValue) || null, [options, selectedValue]);

  useEffect(() => {
    setQuery(selectedTeam?.displayName || selectedTeam?.name || '');
  }, [selectedTeam]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const leagueOptions = useMemo(
    () =>
      Array.from(new Map(options.map((option) => [option.league, option.league])).values())
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right)),
    [options]
  );

  const filteredOptions = useMemo(
    () => options.filter((option) => leagueFilter === 'all' || option.league === leagueFilter),
    [leagueFilter, options]
  );

  const popularOptions = useMemo(
    () => [...filteredOptions].sort((left, right) => right.popularity - left.popularity || left.name.localeCompare(right.name)).slice(0, 6),
    [filteredOptions]
  );

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return filteredOptions
      .map((option) => ({
        ...option,
        score: scoreResult(option, normalizedQuery)
      }))
      .filter((option) => option.score > 0)
      .sort((left, right) => right.score - left.score || right.popularity - left.popularity || left.name.localeCompare(right.name))
      .slice(0, MAX_RESULTS);
  }, [filteredOptions, normalizedQuery]);

  const visibleOptions = normalizedQuery ? searchResults : popularOptions;

  useEffect(() => {
    setActiveIndex(visibleOptions.length ? 0 : -1);
  }, [visibleOptions.length, isOpen]);

  function handleSelectOption(option) {
    onSelect(option.id);
    setQuery(option.name);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!visibleOptions.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % visibleOptions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current <= 0 ? visibleOptions.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Enter') {
      const nextOption = visibleOptions[activeIndex] || visibleOptions[0];

      if (nextOption) {
        event.preventDefault();
        handleSelectOption(nextOption);
      }
    }
  }

  return (
    <div className="compare-selector" ref={containerRef}>
      <div className="compare-selector__header">
        <span>{label}</span>
        {selectedTeam ? (
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

      {selectedTeam ? (
        <div className="compare-selector__selected">
          <ClubBadge name={selectedTeam.displayName || selectedTeam.name} size="small" />
          <div className="compare-selector__selected-copy">
            <div>
              <strong>{selectedTeam.displayName || selectedTeam.name}</strong>
              <span>
                {selectedTeam.league} / {selectedTeam.preferred_formation || 'N/A'} / {Math.round(selectedTeam.teamRating || selectedTeam.avgRating || 0)} OVR
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <label className="compare-selector__field">
        <span>Search teams</span>
        <input
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by team, league, manager, or shape"
          type="text"
          value={query}
        />
      </label>

      <div className="compare-selector__filters">
        <label className="compare-selector__filter">
          <span>League</span>
          <select className="compare-selector__select" onChange={(event) => setLeagueFilter(event.target.value)} value={leagueFilter}>
            <option value="all">All Leagues</option>
            {leagueOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isOpen ? (
        <div className="compare-selector__menu">
          <div className="compare-selector__section">
            <div className="compare-selector__section-title">{normalizedQuery ? 'Search Results' : 'Popular Teams'}</div>
            <div className="compare-selector__results compare-selector__results--sectioned">
              {visibleOptions.length ? (
                visibleOptions.map((option, index) => (
                  <TeamResult
                    active={activeIndex === index}
                    key={option.id}
                    onHover={() => setActiveIndex(index)}
                    onSelect={() => handleSelectOption(option)}
                    option={option}
                    query={query}
                  />
                ))
              ) : (
                <div className="compare-selector__empty">No teams match this search.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
