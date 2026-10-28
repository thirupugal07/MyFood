import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Rating from '../components/ui/Rating';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { ListRowSkeleton } from '../components/ui/Skeleton';
import MenuItemRow from '../components/restaurant/MenuItemRow';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCurrency, formatDistance } from '../lib/format';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { addItem, replaceCart, increment, decrement, getQuantity, itemCount, bill, restaurant: cartRestaurant } = useCart();
  const { isFavourite, toggleFavourite } = useFavourites();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [section, setSection] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [conflict, setConflict] = useState(null);

  useDocumentTitle(restaurant ? restaurant.name : 'Restaurant');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api
      .getRestaurant(id)
      .then((data) => {
        if (!active) return;
        setRestaurant(data);
        setSection('All');
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Restaurant not found.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const sections = useMemo(() => {
    if (!restaurant) return [];
    return ['All', ...Array.from(new Set(restaurant.menu.map((item) => item.section)))];
  }, [restaurant]);

  const visibleItems = useMemo(() => {
    if (!restaurant) return [];
    const term = menuSearch.trim().toLowerCase();
    return restaurant.menu.filter((item) => {
      if (section !== 'All' && item.section !== section) return false;
      if (vegOnly && !item.isVeg) return false;
      if (term && !`${item.name} ${item.description}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [restaurant, section, vegOnly, menuSearch]);

  const handleAdd = (item, force = false) => {
    if (!restaurant) return;
    if (force) {
      replaceCart(item, restaurant);
      toast.success(`${item.name} added. Cart restarted with ${restaurant.name}.`);
      setConflict(null);
      return;
    }
    const result = addItem(item, restaurant);
    if (result.conflict) {
      setConflict({ item });
      return;
    }
    toast.success(`${item.name} added to cart.`);
  };

  const favourite = restaurant ? isFavourite(restaurant.id) : false;

  if (loading) {
    return (
      <div className="container page">
        <div className="rdetail-skeleton">
          <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
          <div className="rdetail-skeleton__body">
            <div className="skeleton" style={{ height: 28, width: '50%' }} />
            <div className="skeleton" style={{ height: 16, width: '35%' }} />
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container page">
        <EmptyState
          icon="alert"
          title="We could not find that restaurant"
          message={error || 'It may have closed down or the link is wrong.'}
          action={
            <Button onClick={() => navigate('/restaurants')} size="sm">
              Browse restaurants
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container page rdetail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <Icon name="chevronRight" size={10} />
        <Link to="/restaurants">Restaurants</Link>
        <Icon name="chevronRight" size={10} />
        <span>{restaurant.name}</span>
      </nav>

      <header className="rdetail__head">
        <div className="rdetail__media">
          <img src={restaurant.image} alt={restaurant.name} />
        </div>
        <div className="rdetail__info">
          <div className="rdetail__title-row">
            <h1>{restaurant.name}</h1>
            <button
              type="button"
              className={`rdetail__fav ${favourite ? 'is-active' : ''}`}
              onClick={() => toggleFavourite(restaurant.id)}
              aria-pressed={favourite}
              aria-label={favourite ? 'Remove from favourites' : 'Save to favourites'}
            >
              <Icon name={favourite ? 'heartFilled' : 'heart'} size={18} />
            </button>
          </div>
          <p className="rdetail__cuisines">{restaurant.cuisines.join(' · ')}</p>
          <div className="rdetail__meta">
            <Rating value={restaurant.rating} count={restaurant.ratingCount} />
            <span className="rdetail__sep" />
            <span>
              <Icon name="clock" size={13} /> {restaurant.deliveryTimeMin} min
            </span>
            <span className="rdetail__sep" />
            <span>{formatDistance(restaurant.distanceKm)} away</span>
            <span className="rdetail__sep" />
            <span>₹{restaurant.priceForOne} for one</span>
          </div>
          <p className="rdetail__area">
            <Icon name="pin" size={13} /> {restaurant.area}, {restaurant.city} · Open{' '}
            {restaurant.opensAt} – {restaurant.closesAt}
          </p>
          {restaurant.offer ? (
            <div className="rdetail__offer">
              <Icon name="tag" size={14} />
              <div>
                <strong>{restaurant.offer.label}</strong>
                <span>Use code {restaurant.offer.code} at checkout</span>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div className="rdetail__toolbar">
        <div className="rdetail__tabs" role="tablist" aria-label="Menu sections">
          {sections.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={section === item}
              className={`chip ${section === item ? 'is-active' : ''}`}
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="rdetail__tools">
          <label className="switch">
            <input type="checkbox" checked={vegOnly} onChange={(event) => setVegOnly(event.target.checked)} />
            <span className="switch__track" />
            <span className="switch__label">Veg only</span>
          </label>
          <div className="rdetail__menu-search">
            <Icon name="search" size={14} />
            <input
              type="search"
              value={menuSearch}
              onChange={(event) => setMenuSearch(event.target.value)}
              placeholder="Search in menu"
              aria-label="Search in menu"
            />
          </div>
        </div>
      </div>

      <div className="rdetail__body">
        <div className="rdetail__menu">
          {visibleItems.length === 0 ? (
            <EmptyState
              icon="search"
              compact
              title="No dishes match"
              message="Try clearing the search or turning off the veg filter."
            />
          ) : (
            visibleItems.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                quantity={getQuantity(item.id)}
                onAdd={(menuItem) => handleAdd(menuItem)}
                onIncrement={(menuItem) => increment(menuItem.id)}
                onDecrement={(menuItem) => decrement(menuItem.id)}
              />
            ))
          )}
        </div>

        <aside className="rdetail__aside">
          <div className="rdetail__aside-card">
            <h3>Why order here?</h3>
            <ul>
              <li>
                <Icon name="checkCircle" size={14} /> {restaurant.rating}★ from{' '}
                {restaurant.ratingCount.toLocaleString('en-IN')} ratings
              </li>
              <li>
                <Icon name="bike" size={14} /> Delivered in about {restaurant.deliveryTimeMin} minutes
              </li>
              <li>
                <Icon name="shield" size={14} /> Contactless delivery available
              </li>
              {restaurant.offer ? (
                <li>
                  <Icon name="tag" size={14} /> {restaurant.offer.label}
                </li>
              ) : null}
            </ul>
          </div>

          {cartRestaurant && cartRestaurant.id === restaurant.id ? (
            <div className="rdetail__aside-card rdetail__aside-card--cart">
              <h3>In your cart</h3>
              <p className="rdetail__aside-total">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} · {formatCurrency(bill.total)}
              </p>
              <Button block onClick={() => navigate('/cart')}>
                View cart <Icon name="chevronRight" size={13} />
              </Button>
            </div>
          ) : null}
        </aside>
      </div>

      {itemCount > 0 && cartRestaurant?.id === restaurant.id ? (
        <div className="cart-bar">
          <div>
            <p>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} · {formatCurrency(bill.subtotal)}
            </p>
            <span>{cartRestaurant.name}</span>
          </div>
          <Button onClick={() => navigate('/cart')} size="md">
            View cart <Icon name="chevronRight" size={14} />
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(conflict)}
        title="Start a new cart?"
        message={
          conflict
            ? `Your cart already has items from ${cartRestaurant?.name}. Adding ${conflict.item.name} will clear it and start a fresh cart with ${restaurant.name}.`
            : ''
        }
        confirmLabel="Start new cart"
        cancelLabel="Keep existing"
        onConfirm={() => conflict && handleAdd(conflict.item, true)}
        onCancel={() => setConflict(null)}
      />
    </div>
  );
};

export default RestaurantDetail;
