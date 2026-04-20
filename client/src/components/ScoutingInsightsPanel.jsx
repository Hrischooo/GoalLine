import { useEffect, useState } from 'react';
import RiskSuitabilityPanel from './RiskSuitabilityPanel';

const INSIGHT_TABS = [
  { id: 'strengths', label: 'Strengths & Weaknesses' },
  { id: 'context', label: 'League Context' },
  { id: 'risk', label: 'Risk & Suitability' }
];

function StrengthsColumn({ items = [], title, tone }) {
  const visibleItems = items.slice(0, 3);
  const fallback =
    tone === 'negative'
      ? {
          key: `${tone}-fallback`,
          title: 'No clear weakness surfaced',
          explanation: 'The current sample did not flag a major weak area, so this section stays compact rather than forcing a negative takeaway.'
        }
      : {
          key: `${tone}-fallback`,
          title: 'No standout strength surfaced',
          explanation: 'The current sample stayed close to baseline across the main categories.'
        };

  return (
    <div className={`scouting-insights__column scouting-insights__column--${tone}`}>
      <div className="scouting-insights__column-header">
        <span>{title}</span>
      </div>

      <div className={`insight-mini-list${visibleItems.length <= 1 ? ' insight-mini-list--single' : ''}`}>
        {(visibleItems.length ? visibleItems : [fallback]).map((item) => (
          <article className={`insight-mini-row insight-mini-row--${tone}`} key={item.key}>
            <div className="insight-mini-row__header">
              <strong>{item.title}</strong>
              {item.severity ? <span className={`insight-mini-row__badge insight-mini-row__badge--${tone}`}>{String(item.severity).replace(/_/g, ' ')}</span> : null}
            </div>
            <p>{item.explanation}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function StrengthsWeaknessesView({ profile }) {
  return (
    <div className="scouting-insights__body">
      <div className="insight-card__topline">
        <div className="overview-card">
          <span>Profile Shape</span>
          <strong>{profile?.profileShape || 'Balanced'}</strong>
        </div>
        <div className="overview-card">
          <span>Confidence</span>
          <strong>{profile?.confidence || 'Moderate confidence'}</strong>
        </div>
      </div>

      <div className="scouting-insights__grid">
        <StrengthsColumn items={profile?.strengths || []} title="Strengths" tone="positive" />
        <StrengthsColumn items={profile?.weaknesses || []} title="Watch Areas" tone="negative" />
      </div>

      {(profile?.developmentAreas || []).length ? (
        <div className="insight-mini-row insight-mini-row--neutral">
          <div className="insight-mini-row__header">
            <strong>{profile.developmentAreas[0].title}</strong>
          </div>
          <p>{profile.developmentAreas[0].explanation}</p>
        </div>
      ) : null}
    </div>
  );
}

function LeagueContextView({ comparison }) {
  const categoryEntries = Object.entries(comparison?.categoryDeltas || {});

  return (
    <div className="scouting-insights__body">
      <div className="insight-card__topline">
        <div className="overview-card">
          <span>Comparison Pool</span>
          <strong>{comparison?.poolLabel || 'Positional peers'}</strong>
        </div>
        <div className="overview-card">
          <span>Sample</span>
          <strong>{comparison?.sampleSize || 0} players</strong>
        </div>
      </div>

      <div className="context-strip">
        {categoryEntries.map(([key, entry]) => (
          <div className={`overview-card overview-card--${entry.direction || 'flat'}`} key={key}>
            <span>{entry.label}</span>
            <strong>{entry.value >= 0 ? '+' : ''}{entry.value}</strong>
            <small>
              {entry.descriptor} / {entry.percentile}th pct
            </small>
          </div>
        ))}
      </div>

      <div className="insight-mini-list">
        {(comparison?.insights || []).map((insight) => (
          <article className="insight-mini-row insight-mini-row--neutral" key={insight}>
            <p>{insight}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function ScoutingInsightsPanel({ comparison, playerIdentifier, riskProfile, strengthsWeaknesses, systemSuitability }) {
  const [activeTab, setActiveTab] = useState('strengths');

  useEffect(() => {
    setActiveTab('strengths');
  }, [playerIdentifier]);

  return (
    <section className="group-card insight-card scouting-insights">
      <div className="group-card__header">
        <p className="analysis-kicker">Player Intelligence</p>
        <h3>Scouting Insights</h3>
        <p className="insight-card__summary">Compact role-based intelligence across strengths, positional context, and data risk so the page stays readable.</p>
      </div>

      <div className="scouting-insights__tabs">
        {INSIGHT_TABS.map((tab) => (
          <button
            className={`scouting-insights__tab${activeTab === tab.id ? ' scouting-insights__tab--active' : ''}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'strengths' ? <StrengthsWeaknessesView profile={strengthsWeaknesses} /> : null}
      {activeTab === 'context' ? <LeagueContextView comparison={comparison} /> : null}
      {activeTab === 'risk' ? <RiskSuitabilityPanel riskProfile={riskProfile} systemSuitability={systemSuitability} /> : null}
    </section>
  );
}
