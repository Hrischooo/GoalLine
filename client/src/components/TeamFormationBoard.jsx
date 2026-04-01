import LineupPlayerNode from './LineupPlayerNode';
import { getFormationSlotLayout } from '../utils/formationSlotLayout';

export default function TeamFormationBoard({ formation, onOpenPlayer, variant = 'full', xi = [] }) {
  const laidOutSlots = getFormationSlotLayout(formation, xi || []);

  return (
    <div className={`formation-pitch formation-pitch--${variant}`} aria-label={`${formation || 'Team'} formation board`}>
      <div className="formation-pitch__surface">
        <div className="formation-pitch__markings" aria-hidden="true">
          <span className="formation-pitch__outer" />
          <span className="formation-pitch__halfway" />
          <span className="formation-pitch__center-circle" />
          <span className="formation-pitch__center-spot" />
          <span className="formation-pitch__box formation-pitch__box--top" />
          <span className="formation-pitch__box formation-pitch__box--bottom" />
          <span className="formation-pitch__six-yard formation-pitch__six-yard--top" />
          <span className="formation-pitch__six-yard formation-pitch__six-yard--bottom" />
          <span className="formation-pitch__arc formation-pitch__arc--top" />
          <span className="formation-pitch__arc formation-pitch__arc--bottom" />
        </div>

        {laidOutSlots.map((slot) => (
          <LineupPlayerNode key={slot.slotId} onOpenPlayer={onOpenPlayer} slot={slot} variant={variant} />
        ))}
      </div>
    </div>
  );
}
