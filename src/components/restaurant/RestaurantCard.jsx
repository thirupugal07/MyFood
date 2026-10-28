import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import Rating from '../ui/Rating';
import { VegBadge } from '../ui/Badge';
import { useFavourites } from '../../context/FavouritesContext';
import { formatDistance } from '../../lib/format';

const RestaurantCard = ({ restaurant, variant = 'grid' }) => {
  const { isFavourite, toggleFavourite } = useFavourites();
  const favourite = isFavourite(restaurant.id);
  const hasVeg = restaurant.menu.some((item) => item.isVeg);

  const toggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavourite(restaurant.id);
  };

  return (
    <article className={`rcard rcard--${variant}`}>
      <Link to={`/restaurant/${restaurant.id}`} className="rcard__link">
        <div className="rcard__media">
          <img src={restaurant.image} alt={restaurant.name} loading="lazy" />
          {restaurant.offer ? (
            <span className="rcard__offer">
              <Icon name="tag" size={11} /> {restaurant.offer.label}
            </span>
          ) : null}
          {!restaurant.isOpen ? <span className="rcard__closed">Closed now</span> : null}
          <button
            type="button"
            className={`rcard__fav ${favourite ? 'is-active' : ''}`}
            onClick={toggle}
            aria-label={favourite ? `Remove ${restaurant.name} from favourites` : `Save ${restaurant.name} to favourites`}
            aria-pressed={favourite}
          >
            <Icon name={favourite ? 'heartFilled' : 'heart'} size={15} />
          </button>
          {restaurant.isPromoted ? <span className="rcard__promoted">Promoted</span> : null}
        </div>

        <div className="rcard__body">
          <div className="rcard__top">
            <h3 className="rcard__name">{restaurant.name}</h3>
            <Rating value={restaurant.rating} size={11} />
          </div>
          <p className="rcard__cuisines">{restaurant.cuisines.join(' · ')}</p>
          <div className="rcard__meta">
            <span>
              <Icon name="clock" size={12} /> {restaurant.deliveryTimeMin} min
            </span>
            <span className="rcard__dot" />
            <span>{formatDistance(restaurant.distanceKm)}</span>
            <span className="rcard__dot" />
            <span>₹{restaurant.priceForOne} for one</span>
          </div>
          <div className="rcard__foot">
            <span className="rcard__area">
              <Icon name="pin" size={11} /> {restaurant.area}
            </span>
            {hasVeg ? <VegBadge isVeg withLabel={false} /> : null}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default RestaurantCard;
