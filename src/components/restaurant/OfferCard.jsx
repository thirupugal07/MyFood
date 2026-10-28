import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

const OfferCard = ({ banner, onCopy }) => (
  <article className="offer-card">
    <div className="offer-card__media">
      <img src={banner.image} alt={banner.title} loading="lazy" />
    </div>
    <div className="offer-card__body">
      <h3>{banner.title}</h3>
      <p>{banner.subtitle}</p>
      <div className="offer-card__foot">
        <button
          type="button"
          className="offer-card__code"
          onClick={() => onCopy?.(banner.code)}
          title="Copy coupon code"
        >
          {banner.code} <Icon name="tag" size={11} />
        </button>
        <Link to="/restaurants?offers=true" className="offer-card__cta">
          Order now <Icon name="chevronRight" size={11} />
        </Link>
      </div>
    </div>
  </article>
);

export default OfferCard;
