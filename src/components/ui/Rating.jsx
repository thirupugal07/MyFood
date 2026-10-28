import Icon from './Icon';

const Rating = ({ value = 0, count, size = 12, showStar = true, className = '' }) => {
  const tone = value >= 4.2 ? 'rating--high' : value >= 3.5 ? 'rating--mid' : 'rating--low';
  return (
    <span className={`rating ${tone} ${className}`.trim()}>
      {showStar ? <Icon name="star" size={size} /> : null}
      <span className="rating__value">{value.toFixed(1)}</span>
      {count != null ? <span className="rating__count">({count.toLocaleString('en-IN')})</span> : null}
    </span>
  );
};

export default Rating;
