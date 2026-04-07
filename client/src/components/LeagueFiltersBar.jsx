import SectionHeader from './SectionHeader';

const ROLE_CONFIDENCE_OPTIONS = [
  { value: 'all', label: 'Any Confidence' },
  { value: 'strong', label: 'Strong' },
  { value: 'medium', label: 'Medium' },
  { value: 'hybrid', label: 'Hybrid' }
];

export default function LeagueFiltersBar({ filters, options, onChange, onReset, rankingViews, sortOptions }) {
  return (
    <section className="league-block">
      <SectionHeader
        actions={
          <button className="secondary-button" type="button" onClick={onReset}>
            Reset filters
          </button>
        }
        className="league-block__header"
        kicker="Explorer Controls"
        title="Filter And Rank"
      />

      <div className="league-ranking-chips" role="tablist" aria-label="League ranking views">
        {rankingViews.map((view) => (
          <button
            className={`league-ranking-chip${filters.rankingView === view.id ? ' league-ranking-chip--active' : ''}`}
            key={view.id}
            onClick={() => onChange('rankingView', view.id)}
            type="button"
          >
            {view.label}
          </button>
        ))}
      </div>

      <div className="league-filters-grid">
        <label className="league-filter-field league-filter-field--search">
          <span>Search</span>
          <input
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search player or club"
            type="text"
            value={filters.search}
          />
        </label>

        <label className="league-filter-field">
          <span>Club</span>
          <select onChange={(event) => onChange('club', event.target.value)} value={filters.club}>
            {options.clubs.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="league-filter-field">
          <span>Exact Position</span>
          <select onChange={(event) => onChange('exactPosition', event.target.value)} value={filters.exactPosition}>
            {options.exactPositions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="league-filter-field">
          <span>Position Group</span>
          <select onChange={(event) => onChange('exactPositionGroup', event.target.value)} value={filters.exactPositionGroup}>
            {options.positionGroups.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="league-filter-field">
          <span>Nation</span>
          <select onChange={(event) => onChange('nation', event.target.value)} value={filters.nation}>
            {options.nations.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="league-filter-field">
          <span>Primary Role</span>
          <select onChange={(event) => onChange('primaryRole', event.target.value)} value={filters.primaryRole}>
            {options.primaryRoles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="league-filter-field">
          <span>Secondary Role</span>
          <select onChange={(event) => onChange('secondaryRole', event.target.value)} value={filters.secondaryRole}>
            {options.secondaryRoles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="league-filter-field">
          <span>Role Confidence</span>
          <select onChange={(event) => onChange('roleConfidence', event.target.value)} value={filters.roleConfidence}>
            {ROLE_CONFIDENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="league-filter-field">
          <span>Age Min</span>
          <input min="0" onChange={(event) => onChange('ageMin', event.target.value)} placeholder="Any" type="number" value={filters.ageMin} />
        </label>

        <label className="league-filter-field">
          <span>Age Max</span>
          <input min="0" onChange={(event) => onChange('ageMax', event.target.value)} placeholder="Any" type="number" value={filters.ageMax} />
        </label>

        <label className="league-filter-field league-filter-field--wide">
          <span>Sort By</span>
          <select onChange={(event) => onChange('sortKey', event.target.value)} value={filters.sortKey}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
