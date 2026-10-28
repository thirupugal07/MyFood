import Icon from './Icon';

const Badge = ({ children, tone = 'neutral', icon = null, className = '' }) => (
  <span className={`badge badge--${tone} ${className}`.trim()}>
    {icon ? <Icon name={icon} size={11} /> : null}
    {children}
  </span>
);

/** The little green/red square every Indian food app uses. */
export const VegBadge = ({ isVeg, withLabel = false }) => (
  <span className={`veg-badge ${isVeg ? 'veg-badge--veg' : 'veg-badge--nonveg'}`}>
    <span className="veg-badge__dot" />
    {withLabel ? <span className="veg-badge__label">{isVeg ? 'Veg' : 'Non-veg'}</span> : null}
  </span>
);

export default Badge;
