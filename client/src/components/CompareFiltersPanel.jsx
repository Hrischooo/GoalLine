import { useMemo, useState } from 'react';
import {
  EXACT_POSITION_OPTIONS,
  PLAYER_COMPARE_PRESETS,
  PLAYER_COMPARISON_LENSES,
  SCORE_FLOOR_OPTIONS,
  TEAM_COMPARE_FOCUS_OPTIONS,
  TEAM_COMPARE_PRESETS,
  TEAM_GAP_OPTIONS,
  TEAM_LINE_OPTIONS,
  TEAM_ROLE_COVERAGE_OPTIONS,
  TEAM_STYLE_OPTIONS
} from '../utils/compareFiltersConfig';

function FilterSection({ children, isOpen, onToggle, title, subtitle }) {
  return (
    <article className={`compare-filter-card${isOpen ? ' compare-filter-card--open' : ''}`}>
      <button className="compare-filter-card__toggle" onClick={onToggle} type="button">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span>{isOpen ? 'Hide' : 'Open'}</span>
      </button>
      {isOpen ? <div className="compare-filter-card__body">{children}</div> : null}
    </article>
  );
}

function SelectField({ label, onChange, options = [], value }) {
  return (
    <label className="compare-filter-field">
      <span>{label}</span>
      <select className="compare-filter-select" onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function RangeField({ label, maxValue, minValue, onChange, placeholders = ['Min', 'Max'] }) {
  return (
    <div className="compare-filter-field">
      <span>{label}</span>
      <div className="compare-filter-range">
        <input
          inputMode="numeric"
          onChange={(event) => onChange({ min: event.target.value, max: maxValue })}
          placeholder={placeholders[0]}
          type="text"
          value={minValue}
        />
        <input
          inputMode="numeric"
          onChange={(event) => onChange({ min: minValue, max: event.target.value })}
          placeholder={placeholders[1]}
          type="text"
          value={maxValue}
        />
      </div>
    </div>
  );
}

function ChipButton({ active, children, onClick }) {
  return (
    <button className={`compare-filter-chip${active ? ' compare-filter-chip--active' : ''}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function ToggleChip({ active, label, onClick }) {
  return (
    <button className={`compare-filter-toggle${active ? ' compare-filter-toggle--active' : ''}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}

function SegmentedPillGroup({ onChange, options = [], value }) {
  return (
    <div className="compare-filter-segmented">
      {options.map((option) => (
        <button
          className={`compare-filter-segmented__button${value === option.value ? ' compare-filter-segmented__button--active' : ''}`}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function PresetRow({ activePresetId, description, onSelectPreset, presets = [], referenceLabel }) {
  return (
    <div className="compare-filter-presets">
      <div className="compare-filter-presets__copy">
        <span>Smart presets</span>
        <small>{referenceLabel ? `Anchored to ${referenceLabel}. ${description}` : description}</small>
      </div>
      <div className="compare-filter-chip-row">
        {presets.map((preset) => (
          <ChipButton active={activePresetId === preset.id} key={preset.id} onClick={() => onSelectPreset(activePresetId === preset.id ? 'none' : preset.id)}>
            {preset.label}
          </ChipButton>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="compare-filter-summary">
      {items.map((item) => (
        <span className="compare-filter-summary__chip" key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

function PlayerFilters({
  controls,
  filters,
  meta,
  onControlsChange,
  onFiltersChange,
  onReset,
  onSelectPreset,
  presetId,
  referenceLabel
}) {
  const [openSections, setOpenSections] = useState({
    basics: true,
    tactical: false,
    controls: false
  });

  const summary = useMemo(() => {
    const items = [];

    if (filters.league !== 'all') {
      items.push(meta.leagueOptions.find((option) => option.value === filters.league)?.label || 'League');
    }

    if (filters.club !== 'all') {
      items.push(meta.clubOptions.find((option) => option.value === filters.club)?.label || 'Club');
    }

    if (filters.positions.length) {
      items.push(filters.positions.join(' / '));
    }

    if (filters.primaryRole !== 'all') {
      items.push(filters.primaryRole);
    }

    if (filters.archetype !== 'all') {
      items.push(filters.archetype);
    }

    if (filters.reliability !== 'all') {
      items.push(meta.reliabilityOptions.find((option) => option.value === filters.reliability)?.label || filters.reliability);
    }

    if (presetId && presetId !== 'none') {
      items.push(`Preset: ${PLAYER_COMPARE_PRESETS.find((preset) => preset.id === presetId)?.label || presetId}`);
    }

    return items.slice(0, 6);
  }, [filters, meta, presetId]);

  return (
    <>
      <div className="compare-filters__header">
        <div>
          <p className="home-kicker">Compare Filters</p>
          <h2>Players</h2>
          <p className="compare-subtitle">Tighten the player pool, then shape how the side-by-side view reads.</p>
        </div>
        <button className="compare-filters__reset" onClick={onReset} type="button">
          Reset Filters
        </button>
      </div>

      <PresetRow
        activePresetId={presetId}
        description="Quick match scaffolds for Player B without replacing manual scouting filters."
        onSelectPreset={onSelectPreset}
        presets={PLAYER_COMPARE_PRESETS}
        referenceLabel={referenceLabel}
      />

      <SummaryRow items={summary} />

      <div className="compare-filter-stack">
        <FilterSection
          isOpen={openSections.basics}
          onToggle={() => setOpenSections((current) => ({ ...current, basics: !current.basics }))}
          subtitle="League, club, exact position, and sample controls."
          title="Basic Filters"
        >
          <div className="compare-filter-grid compare-filter-grid--three">
            <SelectField label="League" onChange={(league) => onFiltersChange({ league, club: 'all' })} options={meta.leagueOptions} value={filters.league} />
            <SelectField label="Club" onChange={(club) => onFiltersChange({ club })} options={meta.clubOptions} value={filters.club} />
            <SelectField label="Reliability" onChange={(reliability) => onFiltersChange({ reliability })} options={meta.reliabilityOptions} value={filters.reliability} />
          </div>

          <div className="compare-filter-field">
            <span>Exact Position</span>
            <div className="compare-filter-chip-row">
              {EXACT_POSITION_OPTIONS.map((option) => {
                const active = filters.positions.includes(option.value);

                return (
                  <ChipButton
                    active={active}
                    key={option.value}
                    onClick={() =>
                      onFiltersChange({
                        positions: active ? filters.positions.filter((entry) => entry !== option.value) : [...filters.positions, option.value]
                      })
                    }
                  >
                    {option.label}
                  </ChipButton>
                );
              })}
            </div>
          </div>

          <div className="compare-filter-grid compare-filter-grid--three">
            <RangeField
              label="Age"
              maxValue={filters.ageMax}
              minValue={filters.ageMin}
              onChange={({ min, max }) => onFiltersChange({ ageMin: min, ageMax: max })}
            />
            <RangeField
              label="OVR"
              maxValue={filters.ovrMax}
              minValue={filters.ovrMin}
              onChange={({ min, max }) => onFiltersChange({ ovrMin: min, ovrMax: max })}
            />
            <label className="compare-filter-field">
              <span>Minutes / Reliability</span>
              <input
                inputMode="numeric"
                onChange={(event) => onFiltersChange({ minutesMin: event.target.value })}
                placeholder="Min minutes"
                type="text"
                value={filters.minutesMin}
              />
            </label>
          </div>
        </FilterSection>

        <FilterSection
          isOpen={openSections.tactical}
          onToggle={() => setOpenSections((current) => ({ ...current, tactical: !current.tactical }))}
          subtitle="Role fit, archetype, and category floors."
          title="Tactical Filters"
        >
          <div className="compare-filter-grid compare-filter-grid--three">
            <SelectField label="Primary Role" onChange={(primaryRole) => onFiltersChange({ primaryRole })} options={meta.primaryRoleOptions} value={filters.primaryRole} />
            <SelectField
              label="Secondary Role"
              onChange={(secondaryRole) => onFiltersChange({ secondaryRole })}
              options={meta.secondaryRoleOptions}
              value={filters.secondaryRole}
            />
            <SelectField label="Archetype" onChange={(archetype) => onFiltersChange({ archetype })} options={meta.archetypeOptions} value={filters.archetype} />
          </div>

          <div className="compare-filter-grid compare-filter-grid--four">
            <SelectField label="Attack" onChange={(attackMin) => onFiltersChange({ attackMin: Number(attackMin) })} options={SCORE_FLOOR_OPTIONS} value={String(filters.attackMin)} />
            <SelectField
              label="Creativity"
              onChange={(creativityMin) => onFiltersChange({ creativityMin: Number(creativityMin) })}
              options={SCORE_FLOOR_OPTIONS}
              value={String(filters.creativityMin)}
            />
            <SelectField
              label="Possession"
              onChange={(possessionMin) => onFiltersChange({ possessionMin: Number(possessionMin) })}
              options={SCORE_FLOOR_OPTIONS}
              value={String(filters.possessionMin)}
            />
            <SelectField
              label="Defending"
              onChange={(defendingMin) => onFiltersChange({ defendingMin: Number(defendingMin) })}
              options={SCORE_FLOOR_OPTIONS}
              value={String(filters.defendingMin)}
            />
          </div>
        </FilterSection>

        <FilterSection
          isOpen={openSections.controls}
          onToggle={() => setOpenSections((current) => ({ ...current, controls: !current.controls }))}
          subtitle="Presentation controls for a calmer scouting read."
          title="Compare Controls"
        >
          <div className="compare-filter-toggle-row">
            <ToggleChip active={controls.showOnlyDifferences} label="Only Differences" onClick={() => onControlsChange({ showOnlyDifferences: !controls.showOnlyDifferences })} />
            <ToggleChip active={controls.showOnlyKeyCategories} label="Key Categories" onClick={() => onControlsChange({ showOnlyKeyCategories: !controls.showOnlyKeyCategories })} />
            <ToggleChip
              active={controls.highlightBiggestAdvantage}
              label="Highlight Biggest Edge"
              onClick={() => onControlsChange({ highlightBiggestAdvantage: !controls.highlightBiggestAdvantage })}
            />
          </div>

          <label className="compare-filter-field">
            <span>Comparison Lens</span>
            <SegmentedPillGroup onChange={(comparisonLens) => onControlsChange({ comparisonLens })} options={PLAYER_COMPARISON_LENSES} value={controls.comparisonLens} />
          </label>
        </FilterSection>
      </div>
    </>
  );
}

function TeamFilters({ controls, filters, meta, onControlsChange, onFiltersChange, onReset, onSelectPreset, presetId, referenceLabel }) {
  const [openSections, setOpenSections] = useState({
    basics: true,
    tactical: false,
    recruitment: false,
    controls: false
  });

  const summary = useMemo(() => {
    const items = [];

    if (filters.league !== 'all') {
      items.push(meta.leagueOptions.find((option) => option.value === filters.league)?.label || 'League');
    }

    if (filters.styleTag !== 'all') {
      items.push(TEAM_STYLE_OPTIONS.find((option) => option.value === filters.styleTag)?.label || filters.styleTag);
    }

    if (filters.preferredFormation !== 'all') {
      items.push(filters.preferredFormation);
    }

    if (filters.strongestLine !== 'all') {
      items.push(`Strongest: ${filters.strongestLine}`);
    }

    if (filters.roleCoverage !== 'all') {
      items.push(TEAM_ROLE_COVERAGE_OPTIONS.find((option) => option.value === filters.roleCoverage)?.label || filters.roleCoverage);
    }

    if (presetId && presetId !== 'none') {
      items.push(`Preset: ${TEAM_COMPARE_PRESETS.find((preset) => preset.id === presetId)?.label || presetId}`);
    }

    return items.slice(0, 6);
  }, [filters, meta, presetId]);

  return (
    <>
      <div className="compare-filters__header">
        <div>
          <p className="home-kicker">Compare Filters</p>
          <h2>Teams</h2>
          <p className="compare-subtitle">Control the team pool by shape, style, and recruitment pressure before you compare squads.</p>
        </div>
        <button className="compare-filters__reset" onClick={onReset} type="button">
          Reset Filters
        </button>
      </div>

      <PresetRow
        activePresetId={presetId}
        description="Shortcuts for peer-team comparison without bloating the main controls."
        onSelectPreset={onSelectPreset}
        presets={TEAM_COMPARE_PRESETS}
        referenceLabel={referenceLabel}
      />

      <SummaryRow items={summary} />

      <div className="compare-filter-stack">
        <FilterSection
          isOpen={openSections.basics}
          onToggle={() => setOpenSections((current) => ({ ...current, basics: !current.basics }))}
          subtitle="League context and overall squad level."
          title="Basic Filters"
        >
          <div className="compare-filter-grid compare-filter-grid--three">
            <SelectField label="League" onChange={(league) => onFiltersChange({ league })} options={meta.leagueOptions} value={filters.league} />
            <RangeField
              label="Team Rating"
              maxValue={filters.ratingMax}
              minValue={filters.ratingMin}
              onChange={({ min, max }) => onFiltersChange({ ratingMin: min, ratingMax: max })}
            />
          </div>
        </FilterSection>

        <FilterSection
          isOpen={openSections.tactical}
          onToggle={() => setOpenSections((current) => ({ ...current, tactical: !current.tactical }))}
          subtitle="Formation context, style identity, and structural strengths."
          title="Tactical Filters"
        >
          <div className="compare-filter-grid compare-filter-grid--three">
            <SelectField
              label="Preferred Formation"
              onChange={(preferredFormation) => onFiltersChange({ preferredFormation })}
              options={meta.preferredFormationOptions}
              value={filters.preferredFormation}
            />
            <SelectField
              label="Auto Best Formation"
              onChange={(detectedFormation) => onFiltersChange({ detectedFormation })}
              options={meta.detectedFormationOptions}
              value={filters.detectedFormation}
            />
            <SelectField label="Tactical Identity" onChange={(styleTag) => onFiltersChange({ styleTag })} options={meta.styleOptions} value={filters.styleTag} />
          </div>

          <div className="compare-filter-grid compare-filter-grid--three">
            <SelectField
              label="Strongest Line"
              onChange={(strongestLine) => onFiltersChange({ strongestLine })}
              options={meta.lineOptions}
              value={filters.strongestLine}
            />
            <SelectField
              label="Weakest Line"
              onChange={(weakestLine) => onFiltersChange({ weakestLine })}
              options={meta.lineOptions}
              value={filters.weakestLine}
            />
          </div>
        </FilterSection>

        <FilterSection
          isOpen={openSections.recruitment}
          onToggle={() => setOpenSections((current) => ({ ...current, recruitment: !current.recruitment }))}
          subtitle="Depth, urgency, and role-coverage health."
          title="Recruitment Filters"
        >
          <div className="compare-filter-grid compare-filter-grid--three">
            <label className="compare-filter-field">
              <span>Depth / Stability</span>
              <input
                inputMode="numeric"
                onChange={(event) => onFiltersChange({ depthMin: event.target.value })}
                placeholder="Min depth score"
                type="text"
                value={filters.depthMin}
              />
            </label>
            <SelectField label="Squad Gap" onChange={(gapSeverity) => onFiltersChange({ gapSeverity })} options={meta.gapOptions} value={filters.gapSeverity} />
            <SelectField
              label="Role Coverage"
              onChange={(roleCoverage) => onFiltersChange({ roleCoverage })}
              options={meta.roleCoverageOptions}
              value={filters.roleCoverage}
            />
          </div>
        </FilterSection>

        <FilterSection
          isOpen={openSections.controls}
          onToggle={() => setOpenSections((current) => ({ ...current, controls: !current.controls }))}
          subtitle="Compact read controls for structural differences."
          title="Compare Controls"
        >
          <div className="compare-filter-toggle-row">
            <ToggleChip active={controls.showOnlyDifferences} label="Only Differences" onClick={() => onControlsChange({ showOnlyDifferences: !controls.showOnlyDifferences })} />
            <ToggleChip
              active={controls.highlightBiggestAdvantage}
              label="Highlight Biggest Edge"
              onClick={() => onControlsChange({ highlightBiggestAdvantage: !controls.highlightBiggestAdvantage })}
            />
          </div>

          <label className="compare-filter-field">
            <span>Compare Focus</span>
            <SegmentedPillGroup onChange={(focusArea) => onControlsChange({ focusArea })} options={TEAM_COMPARE_FOCUS_OPTIONS} value={controls.focusArea} />
          </label>
        </FilterSection>
      </div>
    </>
  );
}

export default function CompareFiltersPanel(props) {
  const {
    mode,
    playerControls,
    playerFilters,
    playerMeta,
    playerPresetId,
    playerReferenceLabel,
    onPlayerControlsChange,
    onPlayerFiltersChange,
    onResetPlayerFilters,
    onResetTeamFilters,
    onSelectPlayerPreset,
    onSelectTeamPreset,
    teamControls,
    teamFilters,
    teamMeta,
    teamPresetId,
    teamReferenceLabel
  } = props;

  return (
    <section className="compare-section compare-filters-panel">
      {mode === 'players' ? (
        <PlayerFilters
          controls={playerControls}
          filters={playerFilters}
          meta={playerMeta}
          onControlsChange={onPlayerControlsChange}
          onFiltersChange={onPlayerFiltersChange}
          onReset={onResetPlayerFilters}
          onSelectPreset={onSelectPlayerPreset}
          presetId={playerPresetId}
          referenceLabel={playerReferenceLabel}
        />
      ) : (
        <TeamFilters
          controls={teamControls}
          filters={teamFilters}
          meta={teamMeta}
          onControlsChange={props.onTeamControlsChange}
          onFiltersChange={props.onTeamFiltersChange}
          onReset={onResetTeamFilters}
          onSelectPreset={onSelectTeamPreset}
          presetId={teamPresetId}
          referenceLabel={teamReferenceLabel}
        />
      )}
    </section>
  );
}
