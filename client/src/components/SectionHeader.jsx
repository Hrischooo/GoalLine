export default function SectionHeader({
  actions = null,
  className = '',
  kicker = '',
  meta = null,
  subtitle = '',
  title = '',
  titleAs = 'h2'
}) {
  const TitleTag = titleAs;

  return (
    <div className={['section-header', className].filter(Boolean).join(' ')}>
      <div className="section-header__copy">
        {kicker ? <p className="home-kicker">{kicker}</p> : null}
        <TitleTag>{title}</TitleTag>
        {subtitle ? <p className="section-header__subtitle">{subtitle}</p> : null}
      </div>

      {meta ? <div className="section-header__meta">{meta}</div> : null}
      {actions ? <div className="section-header__actions">{actions}</div> : null}
    </div>
  );
}
