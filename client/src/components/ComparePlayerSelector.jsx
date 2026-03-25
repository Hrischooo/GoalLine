import { useEffect, useMemo, useRef, useState } from 'react';
import ClubBadge from './ClubBadge';
import PlayerHoverPreview from './PlayerHoverPreview';
import PlayerAvatar from './PlayerAvatar';
import PlayerTextBlock from './PlayerTextBlock';
import { normalizeString, scoreResult } from '../utils/search';
import { getRecentPlayers, rememberRecentPlayer } from '../utils/recentPlayers';

const MAX_RESULTS = 8;
const SEARCH_DEBOUNCE_MS = 160;
const POSITION_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'goalkeeper', label: 'GK' },
  { value: 'defender', label: 'DF' },
  { value: 'midfielder', label: 'MF' },
  { value: 'forward', label: 'FW' }
];

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}

function HighlightedText({ text, query }) {
  const normalizedQuery = String(query || '').trim();

  if (!normalizedQuery) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = normalizedQuery.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return text;
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + normalizedQuery.length);
  const after = text.slice(matchIndex + normalizedQuery.length);

  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
}

function ResultButton({ isActive, onClick, onHover, option, query }) {
  return (
    <button className={`compare-selector__result${isActive ? ' compare-selector__result--active' : ''}`} onClick={onClick} onMouseEnter={onHover} type="button">
      <PlayerAvatar name={option.player.player} size="small" />
      <PlayerHoverPreview metrics={option.metrics} player={option.player}>
        <div>
          <PlayerTextBlock
            club={option.player.squad}
            league={option.leagueName}
            nameNode={<HighlightedText query={query} text={option.player.player} />}
            position={option.metrics?.exactPosition || option.player.pos}
            role={option.metrics?.primaryTacticalRoleLabel}
          />
        </div>
      </PlayerHoverPreview>
    </button>
  );
}

function ResultSection({ activeIndex, label, offset, options, onHover, onSelect, query }) {
  if (!options.length) {
    return null;
  }

  return (
    <div className="compare-selector__section">
      <div className="compare-selector__section-title">{label}</div>
      <div className="compare-selector__results compare-selector__results--sectioned">
        {options.map((option, index) => (
          <ResultButton
            isActive={activeIndex === offset + index}
            key={option.id}
            onClick={() => onSelect(option)}
            onHover={() => onHover(offset + index)}
            option={option}
            query={query}
          />
        ))}
      </div>
    </div>
  );
}

export default function ComparePlayerSelector({ label, options, selectedPlayer, selectedValue, onSelect }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [recentVersion, setRecentVersion] = useState(0);
  const containerRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const normalizedQuery = normalizeString(debouncedQuery);
  const selectedOption = useMemo(() => options.find((option) => option.id === selectedValue) || null, [options, selectedValue]);

  useEffect(() => {
    setQuery(selectedPlayer ? selectedPlayer.player : '');
  }, [selectedPlayer]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const leagueOptions = useMemo(
    () =>
      Array.from(new Map(options.map((option) => [option.leagueId, { value: option.leagueId, label: option.leagueName }])).values()).sort((left, right) =>
        left.label.localeCompare(right.label)
      ),
    [options]
  );

  const filteredOptions = useMemo(
    () =>
      options.filter((option) => {
        if (leagueFilter !== 'all' && option.leagueId !== leagueFilter) {
          return false;
        }

        if (positionFilter !== 'all' && option.positionFamily !== positionFilter) {
          return false;
        }

        return true;
      }),
    [leagueFilter, options, positionFilter]
  );

  const recentOptions = useMemo(() => {
    const optionMap = new Map(filteredOptions.map((option) => [option.id, option]));
    return getRecentPlayers()
      .map((entry) => optionMap.get(entry.id))
      .filter(Boolean)
      .slice(0, 5);
  }, [filteredOptions, recentVersion]);

  const topPlayers = useMemo(
    () =>
      [...filteredOptions]
        .sort((left, right) => right.popularity - left.popularity || left.player.player.localeCompare(right.player.player))
        .slice(0, 6),
    [filteredOptions]
  );

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return filteredOptions
      .map((option) => ({
        ...option,
        nameNormalized: normalizeString(option.name),
        nameTokens: normalizeString(option.name).split(' ').filter(Boolean),
        metadataFieldsNormalized: [option.team, option.position, option.nationality, option.league].map((field) => normalizeString(field)).filter(Boolean),
        searchTextNormalized: normalizeString(option.searchText),
        score: scoreResult(option, normalizedQuery)
      }))
      .filter((option) => option.score > 0)
      .sort((left, right) => right.score - left.score || right.popularity - left.popularity || left.name.localeCompare(right.name))
      .slice(0, MAX_RESULTS);
  }, [filteredOptions, normalizedQuery]);

  const sections = useMemo(() => {
    if (normalizedQuery) {
      return [{ key: 'search', label: 'Search Results', options: searchResults }];
    }

    return [
      { key: 'recent', label: 'Recently Viewed', options: recentOptions },
      { key: 'top', label: 'Top Players', options: topPlayers }
    ].filter((section) => section.options.length);
  }, [normalizedQuery, recentOptions, searchResults, topPlayers]);

  const flatResults = useMemo(() => sections.flatMap((section) => section.options), [sections]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveIndex(flatResults.length ? 0 : -1);
  }, [flatResults, isOpen]);

  function handleSelectOption(option) {
    onSelect(option.id);
    rememberRecentPlayer({
      id: option.id,
      league: option.leagueName,
      name: option.player.player,
      pos: option.player.pos,
      squad: option.player.squad
    });
    setRecentVersion((current) => current + 1);
    setQuery(option.player.player);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
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
      setActiveIndex((current) => (current + 1) % flatResults.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current <= 0 ? flatResults.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Enter') {
      const nextResult = flatResults[activeIndex] || flatResults[0];

      if (nextResult) {
        event.preventDefault();
        handleSelectOption(nextResult);
      }
    }
  }

  let currentOffset = 0;

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
          <PlayerHoverPreview metrics={selectedOption?.metrics} player={selectedPlayer}>
            <div className="compare-selector__selected-copy">
              <ClubBadge name={selectedPlayer.squad} size="small" />
              <PlayerTextBlock
                club={selectedPlayer.squad}
                league={selectedOption?.leagueName}
                name={selectedPlayer.player}
                position={selectedOption?.metrics?.exactPosition || selectedPlayer.pos}
                role={selectedOption?.metrics?.primaryTacticalRoleLabel}
              />
            </div>
          </PlayerHoverPreview>
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
          onKeyDown={handleKeyDown}
          placeholder="Search by player, club, league, or role"
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
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="compare-selector__filter">
          <span>Position</span>
          <div className="compare-selector__position-filters">
            {POSITION_FILTERS.map((option) => (
              <button
                className={`compare-selector__position-chip${positionFilter === option.value ? ' compare-selector__position-chip--active' : ''}`}
                key={option.value}
                onClick={() => setPositionFilter(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="compare-selector__menu">
          {sections.length ? (
            sections.map((section) => {
              const sectionOffset = currentOffset;
              currentOffset += section.options.length;

              return (
                <ResultSection
                  activeIndex={activeIndex}
                  key={section.key}
                  label={section.label}
                  offset={sectionOffset}
                  onHover={setActiveIndex}
                  onSelect={handleSelectOption}
                  options={section.options}
                  query={normalizedQuery}
                />
              );
            })
          ) : (
            <div className="compare-selector__empty">No players match this search.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
