import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { RestaurantCardSkeleton } from '../components/ui/Skeleton';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import api from '../lib/api';
import { useFavourites } from '../context/FavouritesContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Favourites = () => {
  useDocumentTitle('Favourites');
  const { ids } = useFavourites();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all(ids.map((id) => api.getRestaurant(id).catch(() => null)))
      .then((results) => {
        if (active) setRestaurants(results.filter(Boolean));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ids]);

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>Favourites</h1>
          <p className="page__sub">The places you keep coming back to.</p>
        </div>
      </header>

      {loading ? (
        <div className="rcard-grid">
          {Array.from({ length: Math.max(1, ids.length) }).map((_, index) => (
            <RestaurantCardSkeleton key={index} />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon="heart"
          title="No favourites yet"
          message="Tap the heart on any restaurant to save it here for later."
          action={
            <Button as={Link} to="/restaurants" size="sm">
              Find restaurants
            </Button>
          }
        />
      ) : (
        <div className="rcard-grid">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;
