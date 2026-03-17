import { getInitials, getPlaceholderGradient } from '../utils/placeholders';

export default function PlayerAvatar({ imageUrl = '', name = '', size = 'medium' }) {
  const initials = getInitials(name, 'GL');

  if (imageUrl) {
    return (
      <span className={`asset-avatar asset-avatar--${size}`}>
        <img alt={name || 'Player'} className="asset-avatar__image" src={imageUrl} />
      </span>
    );
  }

  return (
    <span
      aria-label={`${name || 'Player'} placeholder avatar`}
      className={`asset-avatar asset-avatar--${size}`}
      style={{ backgroundImage: getPlaceholderGradient(name) }}
    >
      <span className="asset-avatar__text">{initials}</span>
    </span>
  );
}
