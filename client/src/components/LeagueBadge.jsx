import { getLeagueAbbreviation, getPlaceholderGradient } from '../utils/placeholders';

export default function LeagueBadge({ imageUrl = '', name = '', size = 'medium' }) {
  const abbreviation = getLeagueAbbreviation(name);

  if (imageUrl) {
    return (
      <span className={`asset-badge asset-badge--league asset-badge--${size}`}>
        <img alt={name || 'League'} className="asset-badge__image" src={imageUrl} />
      </span>
    );
  }

  return (
    <span
      aria-label={`${name || 'League'} placeholder badge`}
      className={`asset-badge asset-badge--league asset-badge--${size}`}
      style={{ backgroundImage: getPlaceholderGradient(name) }}
    >
      <span className="asset-badge__text">{abbreviation}</span>
    </span>
  );
}
