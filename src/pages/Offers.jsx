import { useEffect, useState } from 'react';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { RestaurantCardSkeleton } from '../components/ui/Skeleton';
import OfferCard from '../components/restaurant/OfferCard';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCurrency } from '../lib/format';

const Offers = () => {
  useDocumentTitle('Offers');
  const toast = useToast();
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.getBanners(),
      api.getCoupons(),
      api.getRestaurants({ hasOffer: true, pageSize: 12 }),
    ])
      .then(([bannerList, couponList, result]) => {
        if (!active) return;
        setBanners(bannerList);
        setCoupons(couponList);
        setRestaurants(result.items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Coupon ${code} copied.`);
    } catch {
      toast.info(`Coupon code: ${code}`);
    }
  };

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>Offers for you</h1>
          <p className="page__sub">Bank offers, coupon codes and restaurant deals — all in one place.</p>
        </div>
      </header>

      <section className="section">
        <div className="section__head">
          <h2>Live deals</h2>
        </div>
        <div className="offer-grid">
          {banners.map((banner) => (
            <OfferCard key={banner.id} banner={banner} onCopy={copyCode} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Coupon codes</h2>
        </div>
        <div className="coupon-grid">
          {coupons.map((coupon) => (
            <article key={coupon.code} className="coupon-card">
              <div className="coupon-card__head">
                <h3>{coupon.code}</h3>
                <button type="button" onClick={() => copyCode(coupon.code)}>
                  Copy
                </button>
              </div>
              <p className="coupon-card__label">{coupon.label}</p>
              <p className="coupon-card__desc">{coupon.description}</p>
              <p className="coupon-card__min">
                <Icon name="info" size={11} /> Minimum order {formatCurrency(coupon.minOrder)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Restaurants with offers</h2>
        </div>
        {loading ? (
          <div className="rcard-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <RestaurantCardSkeleton key={index} />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState
            compact
            icon="tag"
            title="No restaurant offers right now"
            message="Check back soon — new deals drop every weekend."
          />
        ) : (
          <div className="rcard-grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="offer-terms">
          <h3>Offer terms</h3>
          <ul>
            <li>One coupon per order. Coupons cannot be combined.</li>
            <li>Discounts apply to the item total, before taxes and delivery fees.</li>
            <li>MyFood reserves the right to withdraw any offer without prior notice.</li>
          </ul>
          <Button as="a" href="#top" size="sm" variant="ghost">
            Read full terms
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Offers;
