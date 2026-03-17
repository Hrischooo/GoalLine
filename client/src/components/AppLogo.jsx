import { getPlaceholderGradient } from '../utils/placeholders';

export default function AppLogo({ imageUrl = '', label = 'GoalLine', size = 'medium' }) {
  if (imageUrl) {
    return (
      <span className={`app-logo app-logo--${size}`}>
        <img alt={label} className="app-logo__image" src={imageUrl} />
      </span>
    );
  }

  return (
    <span className={`app-logo app-logo--${size}`} style={{ backgroundImage: getPlaceholderGradient(label) }}>
      <span className="app-logo__text">GL</span>
    </span>
  );
}
