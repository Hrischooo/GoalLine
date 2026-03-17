import { getClubAbbreviation, getPlaceholderGradient } from '../utils/placeholders';

export default function ClubBadge({ imageUrl = '', name = '', size = 'medium' }) {
  const abbreviation = getClubAbbreviation(name);

  if (imageUrl) {
    return (
      <span className={`asset-badge asset-badge--club asset-badge--${size}`}>
        <img alt={name || 'Club'} className="asset-badge__image" src={imageUrl} />
      </span>
    );
  }

  return (
    <span
      aria-label={`${name || 'Club'} placeholder badge`}
      className={`asset-badge asset-badge--club asset-badge--${size}`}
      style={{ backgroundImage: getPlaceholderGradient(name) }}
    >
      <span className="asset-badge__text">{abbreviation}</span>
    </span>
  );
}
