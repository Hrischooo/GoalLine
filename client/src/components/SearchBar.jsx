import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import SearchDropdown from './SearchDropdown';
import { getPopularResults, normalizeString, searchEntities, searchResultsToFlatList } from '../utils/search';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 180;

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay, value]);

  return debouncedValue;
}

function getPathForResult(result) {
  return result.type === 'player' ? `/player/${result.id}` : `/league/${result.id}`;
}

export default function SearchBar({ leagueFilter, leagueOptions, leagues, onLeagueFilterChange, onNavigate, players }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const normalizedQuery = normalizeString(debouncedQuery);
  const isSearching = normalizedQuery.length >= MIN_QUERY_LENGTH;

  const groupedResults = useMemo(() => {
    if (isSearching) {
      return searchEntities({
        query: normalizedQuery,
        players,
        leagues,
        limit: 6
      });
    }

    return getPopularResults({
      players,
      leagues,
      playerLimit: 4,
      leagueLimit: 4
    });
  }, [isSearching, leagues, normalizedQuery, players]);

  const flatResults = useMemo(() => searchResultsToFlatList(groupedResults), [groupedResults]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setHighlightedIndex(flatResults.length ? 0 : -1);
  }, [flatResults, isOpen]);

  useEffect(() => {
    function handlePointerDown(event) {
      const isInsideTrigger = containerRef.current?.contains(event.target);
      const isInsideDropdown = dropdownRef.current?.contains(event.target);

      if (!isInsideTrigger && !isInsideDropdown) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current) {
      setDropdownStyle(null);
      return undefined;
    }

    function updateDropdownPosition() {
      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const viewportPadding = 12;
      const top = rect.bottom + 8;
      const maxHeight = Math.max(window.innerHeight - top - viewportPadding, 180);

      setDropdownStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: `${maxHeight}px`,
        zIndex: 2000
      });
    }

    updateDropdownPosition();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            updateDropdownPosition();
          })
        : null;

    if (resizeObserver && containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen, query]);

  function handleSelectResult(result) {
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
    onNavigate(getPathForResult(result));
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (!flatResults.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) => (current + 1) % flatResults.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) => (current <= 0 ? flatResults.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Enter') {
      const nextResult = flatResults[highlightedIndex] || flatResults[0];

      if (nextResult) {
        event.preventDefault();
        handleSelectResult(nextResult);
      }
    }
  }

  return (
    <div className="search-bar" ref={containerRef}>
      <div className="search-bar__controls">
        <label className="search-bar__field search-bar__field--filter" htmlFor="global-league-filter">
          <span className="search-bar__label">League</span>
          <select
            className="search-bar__select"
            id="global-league-filter"
            onChange={(event) => onLeagueFilterChange(event.target.value)}
            value={leagueFilter}
          >
            {leagueOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="search-bar__field search-bar__field--input" htmlFor="global-search-input">
          <span className="search-bar__label">Global Search</span>
          <input
            aria-label="Search player or league"
            autoComplete="off"
            className="search-bar__input"
            id="global-search-input"
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search player or league..."
            type="text"
            value={query}
          />
        </label>
      </div>

      <SearchDropdown
        dropdownRef={dropdownRef}
        dropdownStyle={dropdownStyle}
        emptyMessage={isSearching ? 'No matching players or leagues found' : 'No popular players or leagues available'}
        groupedResults={groupedResults}
        highlightedIndex={highlightedIndex}
        isOpen={isOpen}
        leaguesLabel={isSearching ? 'Leagues' : 'Popular Leagues'}
        onHoverResult={setHighlightedIndex}
        onSelectResult={handleSelectResult}
        playersLabel={isSearching ? 'Players' : 'Popular Players'}
      />
    </div>
  );
}
