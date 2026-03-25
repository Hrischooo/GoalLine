import { memo } from 'react';
import { createPortal } from 'react-dom';
import ClubBadge from './ClubBadge';
import LeagueBadge from './LeagueBadge';
import PlayerHoverPreview from './PlayerHoverPreview';
import PlayerAvatar from './PlayerAvatar';
import PlayerTextBlock from './PlayerTextBlock';

function SearchRow({ result, isHighlighted, onSelect, onHover }) {
  const metadata =
    result.type === 'player'
      ? [result.team, result.position, result.nationality, result.league].filter(Boolean).join(' \u2022 ')
      : [result.country, result.season, result.division].filter(Boolean).join(' \u2022 ');

  return (
    <li className="search-dropdown__item" role="presentation">
      <button
        aria-selected={isHighlighted}
        className={`search-dropdown__row${isHighlighted ? ' search-dropdown__row--highlighted' : ''}`}
        onClick={() => onSelect(result)}
        onMouseEnter={onHover}
        role="option"
        type="button"
      >
        <div className="search-dropdown__primary">
          {result.type === 'player' ? <PlayerAvatar name={result.name} size="small" /> : <LeagueBadge name={result.name} size="small" />}
          {result.type === 'player' ? (
            <PlayerHoverPreview metrics={result.metrics} player={result.playerRecord}>
              <div className="search-result-entity">
                <span className={`search-badge search-badge--${result.type}`}>{result.type === 'player' ? 'PLAYER' : 'LEAGUE'}</span>
                <PlayerTextBlock
                  club={result.team}
                  league={result.league}
                  name={result.name}
                  position={result.position}
                  role={result.primaryRole}
                />
              </div>
            </PlayerHoverPreview>
          ) : (
            <div className="search-result-entity">
              <span className={`search-badge search-badge--${result.type}`}>{result.type === 'player' ? 'PLAYER' : 'LEAGUE'}</span>
              <strong>{result.name}</strong>
            </div>
          )}
        </div>
        <div className="search-dropdown__meta">
          {result.type === 'player' ? <ClubBadge name={result.team} size="small" /> : null}
          <span>{metadata}</span>
        </div>
      </button>
    </li>
  );
}

function Section({ id, label, results, highlightedIndex, offset, onSelect, onHoverResult }) {
  if (!results.length) {
    return null;
  }

  return (
    <section aria-labelledby={id} className="search-dropdown__section">
      <div className="search-dropdown__section-header">
        <span id={id}>{label}</span>
      </div>
      <ul aria-labelledby={id} className="search-dropdown__list" role="group">
        {results.map((result, index) => (
          <SearchRow
            isHighlighted={highlightedIndex === offset + index}
            key={`${result.type}-${result.id}`}
            onHover={() => onHoverResult(offset + index)}
            onSelect={onSelect}
            result={result}
          />
        ))}
      </ul>
    </section>
  );
}

function SearchDropdown({
  dropdownRef,
  emptyMessage,
  highlightedIndex,
  isOpen,
  dropdownStyle,
  onHoverResult,
  onSelectResult,
  playersLabel,
  groupedResults,
  leaguesLabel
}) {
  if (!isOpen) {
    return null;
  }

  const playerCount = groupedResults.players.length;
  const hasResults = playerCount > 0 || groupedResults.leagues.length > 0;

  const content = (
    <div className="search-dropdown" role="listbox">
      {hasResults ? (
        <>
          <Section
            id="search-section-players"
            label={playersLabel}
            results={groupedResults.players}
            highlightedIndex={highlightedIndex}
            offset={0}
            onHoverResult={onHoverResult}
            onSelect={onSelectResult}
          />
          <Section
            id="search-section-leagues"
            label={leaguesLabel}
            results={groupedResults.leagues}
            highlightedIndex={highlightedIndex}
            offset={playerCount}
            onHoverResult={onHoverResult}
            onSelect={onSelectResult}
          />
        </>
      ) : (
        <div className="search-dropdown__empty">{emptyMessage}</div>
      )}
    </div>
  );

  if (!dropdownStyle) {
    return null;
  }

  return createPortal(
    <div className="search-dropdown-portal" ref={dropdownRef} style={dropdownStyle}>
      {content}
    </div>,
    document.body
  );
}

export default memo(SearchDropdown);
