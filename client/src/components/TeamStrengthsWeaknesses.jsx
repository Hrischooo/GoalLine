import SectionHeader from './SectionHeader';
import { formatTextValue } from '../utils/playerMetrics';

function PersonTile({ label, person }) {
  return (
    <div className="team-insight-tile">
      <span>{label}</span>
      <strong>{formatTextValue(person?.player || person?.assignedPlayer?.player, '-')}</strong>
      <small>{formatTextValue(person?.metrics?.primaryTacticalRoleLabel || person?.assignedPlayer?.metrics?.primaryTacticalRoleLabel, '')}</small>
    </div>
  );
}

export default function TeamStrengthsWeaknesses({ team }) {
  return (
    <section className="team-block">
      <SectionHeader className="team-block__header" kicker="Club Insights" title="Strengths & Leaders" />

      <div className="team-insights-grid">
        <div className="team-insights-card">
          <h3>Strengths</h3>
          <ul>
            {(team?.strengths || []).map((strength) => (
              <li key={strength}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="team-insights-card">
          <h3>Weaknesses</h3>
          <ul>
            {(team?.weaknesses || []).map((weakness) => (
              <li key={weakness}>{weakness}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="team-insights-grid team-insights-grid--leaders">
        <PersonTile label="Captain" person={team?.captain} />
        <PersonTile label="Star Player" person={team?.starPlayer} />
        <PersonTile label="Top Scorer" person={team?.topScorer} />
        <PersonTile label="Top Creator" person={team?.topCreator} />
      </div>

      <div className="team-insights-card">
        <h3>Young Talents</h3>
        <div className="team-young-talents">
          {(team?.youngTalents || []).map((player) => (
            <div className="team-young-talents__player" key={player.player}>
              <strong>{formatTextValue(player.player)}</strong>
              <span>Age {formatTextValue(player.age)} • {player.metrics?.finalOVR} OVR</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
