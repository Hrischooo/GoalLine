import InfoTooltip from './InfoTooltip';
import PlayerHoverPreview from './PlayerHoverPreview';

export default function StatLeaderCard({ card }) {
  return (
    <article className={`home-leader-card home-leader-card--${card.tone}`}>
      <div className="home-leader-card__top">
        <div className="home-leader-card__signal">
          <div className="home-leader-card__icon" aria-hidden="true">
            {card.symbol}
          </div>

          <div className="home-leader-card__value">
            <span>{card.title}</span>
            <div>
              <strong>{card.value}</strong>
              <small>{card.metricLabel}</small>
            </div>
          </div>
        </div>

        <div className="home-leader-card__actions">
          <span className={`home-leader-card__confidence home-leader-card__confidence--${card.confidence.id}`}>{card.confidence.label}</span>
          <InfoTooltip
            content={
              <>
                <p>{card.detail}</p>
                <p>{`Eligibility: ${card.eligibilityLabel}.`}</p>
              </>
            }
            label={card.title}
          />
        </div>
      </div>

      <div className="home-leader-card__body">
        <PlayerHoverPreview metrics={card.record.metrics} player={card.record.player}>
          <div className="home-leader-card__identity">
            <strong>{card.playerName}</strong>
            <span>{card.club}</span>
          </div>
        </PlayerHoverPreview>

        <div className="home-leader-card__tags">
          <span className="home-leader-card__tag">{card.roleSummary}</span>
          <span className="home-leader-card__tag home-leader-card__tag--subtle">{card.supportLabel}</span>
        </div>

        <p className="home-leader-card__summary">{card.summary}</p>
      </div>

      <div className="home-leader-card__footer">
        <span>{card.trustLine}</span>
        <strong>{card.percentileLine}</strong>
      </div>
    </article>
  );
}
