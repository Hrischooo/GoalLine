import { formatStatValue } from '../utils/playerMetrics';

function getRoleFitClassName(roleKey, primaryRole, secondaryRole) {
  if (roleKey === primaryRole) {
    return 'role-fit-row role-fit-row--primary';
  }

  if (roleKey === secondaryRole) {
    return 'role-fit-row role-fit-row--secondary';
  }

  return 'role-fit-row';
}

export default function RoleFitCard({ topRoles = [], primaryRole, secondaryRole }) {
  return (
    <article className="tactical-card">
      <div className="tactical-card__header">
        <h3>Role Fit</h3>
      </div>

      <div className="role-fit-list">
        {topRoles.length ? (
          topRoles.map((role) => (
            <div className={getRoleFitClassName(role.key, primaryRole, secondaryRole)} key={role.key}>
              <div className="role-fit-row__header">
                <span>{role.label}</span>
                <strong>{formatStatValue(role.score, '0')}</strong>
              </div>
              <div className="role-fit-row__track">
                <div className="role-fit-row__fill" style={{ width: `${Math.max(0, Math.min(role.score, 100))}%` }} />
              </div>
            </div>
          ))
        ) : (
          <div className="role-fit-row">
            <div className="role-fit-row__header">
              <span>No tactical role data</span>
              <strong>-</strong>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
