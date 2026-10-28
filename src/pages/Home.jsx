import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import { RestaurantCardSkeleton } from '../components/ui/Skeleton';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import CategoryTile from '../components/restaurant/CategoryTile';
import BrandStrip from '../components/restaurant/BrandStrip';
import OfferCard from '../components/restaurant/OfferCard';
import EmptyState from '../components/ui/EmptyState';
import api from '../lib/api';
import { BRANDS, COUPONS } from '../data/catalog';
import { useToast } from '../context/ToastContext';
import { useDeliveryLocation } from '../context/LocationContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useInterval } from '../hooks/useInterval';

const Home = () => {
  useDocumentTitle('');
  const navigate = useNavigate();
  const toast = useToast();
  const { area } = useDeliveryLocation();

  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slide, setSlide] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getCategories(), api.getBanners(), api.getFeaturedRestaurants(8)])
      .then(([categoryList, bannerList, restaurants]) => {
        if (!active) return;
        setCategories(categoryList);
        setBanners(bannerList);
        setFeatured(restaurants);
        setError('');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || 'Could not load the home page.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useInterval(
    () => setSlide((current) => (current + 1) % Math.max(1, banners.length)),
    banners.length > 1 ? 5000 : null,
  );

  const submitSearch = (event) => {
    event.preventDefault();
    const term = search.trim();
    navigate(term ? `/restaurants?search=${encodeURIComponent(term)}` : '/restaurants');
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Coupon ${code} copied. Paste it at checkout.`);
    } catch {
      toast.info(`Coupon code: ${code}`);
    }
  };

  const activeBanner = banners[slide];

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <span className="hero__eyebrow">
              <Icon name="bike" size={13} /> Delivering across Chennai in 30 minutes
            </span>
            <h1>
              Hungry? Order from the <span>best kitchens</span> near {area}.
            </h1>
            <p className="hero__sub">
              21 restaurants, 120+ dishes, live order tracking and free delivery above ₹149.
            </p>

            <form className="hero__search" onSubmit={submitSearch} role="search">
              <Icon name="search" size={18} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Try “Ambur biriyani” or “cheesecake”"
                aria-label="Search for food or restaurants"
              />
              <Button type="submit" size="md">
                Find food
              </Button>
            </form>

            <div className="hero__stats">
              <div>
                <strong>21</strong>
                <span>Restaurants</span>
              </div>
              <div>
                <strong>30 min</strong>
                <span>Avg delivery</span>
              </div>
              <div>
                <strong>4.1★</strong>
                <span>Avg rating</span>
              </div>
            </div>
          </div>

          <div className="hero__media">
            {loading ? (
              <div className="hero__media-skeleton" />
            ) : activeBanner ? (
              <Link to="/offers" className="hero__slide">
                <img src={activeBanner.image} alt={activeBanner.title} />
                <div className="hero__slide-caption">
                  <p className="hero__slide-title">{activeBanner.title}</p>
                  <p className="hero__slide-sub">{activeBanner.subtitle}</p>
                </div>
              </Link>
            ) : null}

            {banners.length > 1 ? (
              <div className="hero__dots">
                {banners.map((banner, index) => (
                  <button
                    key={banner.id}
                    type="button"
                    className={`hero__dot ${index === slide ? 'is-active' : ''}`}
                    onClick={() => setSlide(index)}
                    aria-label={`Show offer ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Top brands for you</h2>
          <Link to="/restaurants" className="section__link">
            See all <Icon name="chevronRight" size={12} />
          </Link>
        </div>
        <BrandStrip brands={BRANDS} />
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>What are you craving?</h2>
          <Link to="/restaurants" className="section__link">
            All restaurants <Icon name="chevronRight" size={12} />
          </Link>
        </div>
        <div className="cat-grid">
          {loading
            ? Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="cat-tile cat-tile--skeleton" />
              ))
            : categories.map((category) => (
                <CategoryTile key={category.id} category={category} />
              ))}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Popular near {area}</h2>
          <Link to="/restaurants?sort=rating" className="section__link">
            Top rated <Icon name="chevronRight" size={12} />
          </Link>
        </div>

        {error ? (
          <EmptyState
            icon="alert"
            title="Could not load restaurants"
            message={error}
            action={
              <Button size="sm" onClick={() => window.location.reload()}>
                Try again
              </Button>
            }
          />
        ) : (
          <div className="rcard-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <RestaurantCardSkeleton key={index} />)
              : featured.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
          </div>
        )}
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Today&apos;s offers</h2>
          <Link to="/offers" className="section__link">
            All offers <Icon name="chevronRight" size={12} />
          </Link>
        </div>
        <div className="offer-grid">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="offer-card offer-card--skeleton" />
              ))
            : banners.slice(0, 3).map((banner) => (
                <OfferCard key={banner.id} banner={banner} onCopy={copyCode} />
              ))}
        </div>
      </section>

      <section className="container section">
        <div className="how">
          <div className="how__item">
            <span className="how__icon">
              <Icon name="search" size={20} />
            </span>
            <h3>Pick a restaurant</h3>
            <p>Browse by cuisine, rating or what is closest to you.</p>
          </div>
          <div className="how__item">
            <span className="how__icon">
              <Icon name="cart" size={20} />
            </span>
            <h3>Build your cart</h3>
            <p>Add dishes, apply a coupon and watch the bill update live.</p>
          </div>
          <div className="how__item">
            <span className="how__icon">
              <Icon name="bike" size={20} />
            </span>
            <h3>Track it live</h3>
            <p>Follow every step from the kitchen to your door.</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="coupon-strip">
          <div>
            <h3>
              <Icon name="gift" size={16} /> Coupons you can use right now
            </h3>
            <p>Tap a code to copy it, then paste it at checkout.</p>
          </div>
          <div className="coupon-strip__codes">
            {COUPONS.map((coupon) => (
              <button key={coupon.code} type="button" onClick={() => copyCode(coupon.code)}>
                <strong>{coupon.code}</strong>
                <span>{coupon.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
