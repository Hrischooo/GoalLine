import { useEffect, useMemo, useState } from 'react';
import ClubBadge from './ClubBadge';
import SegmentedControl from './SegmentedControl';
import TeamComparisonDepth from './TeamComparisonDepth';
import TeamComparisonOverview from './TeamComparisonOverview';
import TeamComparisonRecruitment from './TeamComparisonRecruitment';
import TeamComparisonTactical from './TeamComparisonTactical';
import { buildTeamComparisonInsights } from '../utils/teamComparisonInsights';
import { buildTeamComparisonProfile } from '../utils/teamComparisonProfile';

const SECTION_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'tactical', label: 'Tactical Profile' },
  { id: 'depth', label: 'Squad & Depth' },
  { id: 'recruitment', label: 'Recruitment View' }
];

function TeamHeroCard({ label, onOpenTeam, profile }) {
  return (
    <article className="compare-team-hero-card">
      <div className="compare-team-hero-card__top">
        <ClubBadge name={profile.identity.name} size="large" />
        <div>
          <p className="home-kicker">{label}</p>
          <h2>{profile.identity.name}</h2>
          <p className="compare-team-note">
            {profile.identity.league} / {profile.identity.manager || 'Manager N/A'}
          </p>
        </div>
      </div>

      <div className="compare-team-grid">
        <div className="compare-team-mini-stat">
          <span>Team Rating</span>
          <strong>{profile.strength.teamRating}</strong>
        </div>
        <div className="compare-team-mini-stat">
          <span>Best XI</span>
          <strong>{profile.strength.bestXIRating}</strong>
        </div>
        <div className="compare-team-mini-stat">
          <span>Auto Best</span>
          <strong>{profile.identity.detectedFormation}</strong>
        </div>
        <div className="compare-team-mini-stat">
          <span>Depth Score</span>
          <strong>{profile.strength.depthScore}</strong>
        </div>
      </div>

      <button className="secondary-button compare-team-hero-card__button" onClick={onOpenTeam} type="button">
        Open team page
      </button>
    </article>
  );
}

export default function TeamComparisonDashboard({ controls, leftTeam, onNavigate, rightTeam, teams = [] }) {
  const [activeTab, setActiveTab] = useState('overview');
  const leftProfile = useMemo(() => buildTeamComparisonProfile(leftTeam, teams), [leftTeam, teams]);
  const rightProfile = useMemo(() => buildTeamComparisonProfile(rightTeam, teams), [rightTeam, teams]);
  const insights = useMemo(() => buildTeamComparisonInsights(leftProfile, rightProfile), [leftProfile, rightProfile]);
  const heroInsights = useMemo(() => {
    if (controls.focusArea === 'tactical') {
      return insights.tactical;
    }

    if (controls.focusArea === 'depth') {
      return insights.depth;
    }

    if (controls.focusArea === 'recruitment') {
      return insights.recruitment;
    }

    return insights.headline;
  }, [controls.focusArea, insights]);

  useEffect(() => {
    if (controls.focusArea === 'balanced') {
      setActiveTab('overview');
      return;
    }

    setActiveTab(controls.focusArea);
  }, [controls.focusArea]);

  return (
    <>
      <section className="compare-team-hero">
        <TeamHeroCard label="Team A" onOpenTeam={() => onNavigate(`/teams/${encodeURIComponent(leftTeam.id)}`)} profile={leftProfile} />

        <div className="compare-team-hero__center">
          <p className="home-kicker">Scout Read</p>
          <h2>Mirror the current XI, the depth behind it, and the next recruitment pressure points.</h2>
          <p className="compare-team-note">
            {controls.showOnlyDifferences ? 'Showing the clearest structural edges only.' : 'Full structural read is active.'}
          </p>
          <div className="compare-insight-list">
            {heroInsights.slice(0, controls.showOnlyDifferences ? 2 : 3).map((insight) => (
              <p className="compare-insight-item" key={insight}>
                {insight}
              </p>
            ))}
          </div>
        </div>

        <TeamHeroCard label="Team B" onOpenTeam={() => onNavigate(`/teams/${encodeURIComponent(rightTeam.id)}`)} profile={rightProfile} />
      </section>

      <SegmentedControl
        activeId={activeTab}
        ariaLabel="Team comparison sections"
        className="compare-subtabs"
        compact
        onChange={setActiveTab}
        options={SECTION_TABS}
      />

      {activeTab === 'overview' ? <TeamComparisonOverview controls={controls} insights={insights.overview} leftProfile={leftProfile} rightProfile={rightProfile} /> : null}
      {activeTab === 'tactical' ? <TeamComparisonTactical controls={controls} insights={insights.tactical} leftProfile={leftProfile} rightProfile={rightProfile} /> : null}
      {activeTab === 'depth' ? <TeamComparisonDepth controls={controls} insights={insights.depth} leftProfile={leftProfile} rightProfile={rightProfile} /> : null}
      {activeTab === 'recruitment' ? (
        <TeamComparisonRecruitment controls={controls} insights={insights.recruitment} leftProfile={leftProfile} rightProfile={rightProfile} />
      ) : null}
    </>
  );
}
