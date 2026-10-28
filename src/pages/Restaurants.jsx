import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { RestaurantCardSkeleton } from '../components/ui/Skeleton';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import FilterBar from '../components/restaurant/FilterBar';
import api from '../lib/api';
import { MAX_PRICE_FOR_ONE, AREAS } from '../data/catalog';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const PAGE_SIZE = 9;

const DEFAULT_FILTERS = {
  search: '',
  cuisines: [],
  area: '',
  vegOnly: false,
  maxPrice: MAX_PRICE_FOR_ONE,
  minRating: 0,
  hasOffer: false,
  sort: 'relevance',
  page: 1,
};

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCuisine = searchParams.get('cuisine');
  const initialOffers = searchParams.get('offers') === 'true';
  const initialSort = searchParams.get('sort') || 'relevance';

  useDocumentTitle(initialSearch ? `Search: ${initialSearch}` : 'Restaurants');

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    search: initialSearch,
    cuisines: initialCuisine ? [initialCuisine] : [],
    hasOffer: initialOffers,
    sort: initialSort,
  }));
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const debouncedSearch = useDebounce(searchInput, 350);

  /* Keep the URL in step with the search term so results are shareable. */
  useEffect(() => {
    setFilters((current) =>
      current.search === debouncedSearch ? current : { ...current, search: debouncedSearch, page: 1 },
    );
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set('search', debouncedSearch);
    else next.delete('search');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const fetchPage = useCallback(
    async (page, { append = false } = {}) => {
      const id = requestId.current + 1;
      requestId.current = id;

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');

      try {
        const response = await api.getRestaurants({
          search: filters.search,
          cuisines: filters.cuisines,
          area: filters.area,
          vegOnly: filters.vegOnly,
          maxPrice: filters.maxPrice < MAX_PRICE_FOR_ONE ? filters.maxPrice : null,
          minRating: filters.minRating,
          hasOffer: filters.hasOffer,
          sort: filters.sort,
          page,
          pageSize: PAGE_SIZE,
        });

        if (requestId.current !== id) return;
        setResults((current) => (append ? [...current, ...response.items] : response.items));
        setTotal(response.total);
        setHasMore(response.hasMore);
      } catch (requestError) {
        if (requestId.current !== id) return;
        setError(requestError.message || 'Could not load restaurants.');
      } finally {
        if (requestId.current === id) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const updateFilters = (patch) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, search: filters.search });
    setSearchInput(filters.search);
  };

  const activeChips = useMemo(() => {
    const chips = [];
    filters.cuisines.forEach((cuisine) =>
      chips.push({ key: `cuisine-${cuisine}`, label: cuisine, patch: { cuisines: filters.cuisines.filter((item) => item !== cuisine), page: 1 } }),
    );
    if (filters.area) chips.push({ key: 'area', label: filters.area, patch: { area: '', page: 1 } });
    if (filters.vegOnly) chips.push({ key: 'veg', label: 'Veg only', patch: { vegOnly: false, page: 1 } });
    if (filters.hasOffer) chips.push({ key: 'offer', label: 'Has offer', patch: { hasOffer: false, page: 1 } });
    if (filters.minRating) chips.push({ key: 'rating', label: `${filters.minRating}+ rating`, patch: { minRating: 0, page: 1 } });
    if (filters.maxPrice < MAX_PRICE_FOR_ONE)
      chips.push({ key: 'price', label: `Under ₹${filters.maxPrice}`, patch: { maxPrice: MAX_PRICE_FOR_ONE, page: 1 } });
    return chips;
  }, [filters]);

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>{filters.search ? `Results for “${filters.search}”` : 'All restaurants'}</h1>
          <p className="page__sub">
            {total} {total === 1 ? 'restaurant' : 'restaurants'} delivering to you
          </p>
        </div>
        <div className="page__head-actions">
          <div className="page__search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search restaurants or dishes"
              aria-label="Search restaurants or dishes"
            />
            {searchInput ? (
              <button type="button" onClick={() => setSearchInput('')} aria-label="Clear search">
                <Icon name="close" size={13} />
              </button>
            ) : null}
          </div>
          <select
            className="select select--inline"
            value={filters.area}
            onChange={(event) => updateFilters({ area: event.target.value, page: 1 })}
            aria-label="Filter by area"
          >
            <option value="">All areas</option>
            {AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </header>

      <FilterBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        resultCount={total}
      />

      {activeChips.length > 0 ? (
        <div className="active-chips">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="active-chips__item"
              onClick={() => updateFilters(chip.patch)}
            >
              {chip.label} <Icon name="close" size={11} />
            </button>
          ))}
          <button type="button" className="active-chips__clear" onClick={resetFilters}>
            Clear all
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="rcard-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <RestaurantCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="alert"
          title="Something went wrong"
          message={error}
          action={
            <Button size="sm" onClick={() => fetchPage(1)}>
              Retry
            </Button>
          }
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="search"
          title="No restaurants match those filters"
          message="Try removing a filter, or search for something else like “dosa” or “burger”."
          action={
            <Button size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="rcard-grid">
            {results.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          {hasMore ? (
            <div className="page__more">
              <Button variant="outline" loading={loadingMore} onClick={() => fetchPage(filters.page + 1, { append: true })}>
                Load more restaurants
              </Button>
            </div>
          ) : (
            <p className="page__end">That&apos;s all {total} restaurants. Try another cuisine?</p>
          )}
        </>
      )}
    </div>
  );
};

export default Restaurants;
