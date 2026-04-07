import { formatStatValue } from '../utils/playerMetrics';
import SectionHeader from './SectionHeader';

function RoleColumn({ accent, roles = [], title }) {
  return (
    <article className={`compare-role-fit__column compare-role-fit__column--${accent}`}>
      <div className="compare-role-fit__column-header">
        <h3>{title}</h3>
      </div>

      <div className="compare-role-fit__rows">
        {roles.map((role) => (
          <div className="compare-role-fit__row" key={`${title}-${role.key}`}>
            <div className="compare-role-fit__row-header">
              <span>{role.label}</span>
              <strong>{formatStatValue(role.score, '0')}</strong>
            </div>
            <div className="compare-role-fit__track">
              <div className="compare-role-fit__fill" style={{ width: `${Math.max(0, Math.min(role.score, 100))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function CompareRoleFitSection({ leftMetrics, rightMetrics }) {
  return (
    <section className="compare-section">
      <SectionHeader className="compare-section__header" kicker="Role Breakdown" title="Top Role Fit Scores" />

      <div className="compare-role-fit">
        <RoleColumn accent="left" roles={leftMetrics.topTacticalRoles} title={leftMetrics.primaryTacticalRoleLabel} />
        <RoleColumn accent="right" roles={rightMetrics.topTacticalRoles} title={rightMetrics.primaryTacticalRoleLabel} />
      </div>
    </section>
  );
}
