import { useState } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { CUISINES, MAX_PRICE_FOR_ONE } from '../../data/catalog';

const SORTS = [
  { value: 'relevance', label: 'Recommended' },
  { value: 'rating', label: 'Top rated' },
  { value: 'delivery', label: 'Fastest delivery' },
  { value: 'price-low', label: 'Cost: low to high' },
  { value: 'price-high', label: 'Cost: high to low' },
];

const RATINGS = [
  { value: 0, label: 'Any rating' },
  { value: 4.5, label: '4.5+' },
  { value: 4, label: '4.0+' },
  { value: 3.5, label: '3.5+' },
];

const FilterBar = ({ filters, onChange, onReset, resultCount }) => {
  const [open, setOpen] = useState(false);

  const toggleCuisine = (cuisine) => {
    const next = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter((item) => item !== cuisine)
      : [...filters.cuisines, cuisine];
    onChange({ cuisines: next, page: 1 });
  };

  const activeCount =
    filters.cuisines.length +
    (filters.minRating ? 1 : 0) +
    (filters.vegOnly ? 1 : 0) +
    (filters.hasOffer ? 1 : 0) +
    (filters.maxPrice < MAX_PRICE_FOR_ONE ? 1 : 0) +
    (filters.area ? 1 : 0);

  return (
    <div className="filters">
      <div className="filters__bar">
        <button
          type="button"
          className={`filters__toggle ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <Icon name="sliders" size={15} /> Filters
          {activeCount > 0 ? <span className="filters__count">{activeCount}</span> : null}
        </button>

        <div className="filters__sorts" role="tablist" aria-label="Sort restaurants">
          {SORTS.map((sort) => (
            <button
              key={sort.value}
              type="button"
              role="tab"
              aria-selected={filters.sort === sort.value}
              className={`chip ${filters.sort === sort.value ? 'is-active' : ''}`}
              onClick={() => onChange({ sort: sort.value, page: 1 })}
            >
              {sort.label}
            </button>
          ))}
        </div>

        <p className="filters__count-text">
          {resultCount} {resultCount === 1 ? 'restaurant' : 'restaurants'}
        </p>
      </div>

      {open ? (
        <div className="filters__panel">
          <div className="filters__group">
            <h4>Rating</h4>
            <div className="filters__chips">
              {RATINGS.map((rating) => (
                <button
                  key={rating.value}
                  type="button"
                  className={`chip ${filters.minRating === rating.value ? 'is-active' : ''}`}
                  onClick={() => onChange({ minRating: rating.value, page: 1 })}
                >
                  {rating.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filters__group">
            <h4>Cost for one</h4>
            <input
              type="range"
              min={100}
              max={MAX_PRICE_FOR_ONE}
              step={50}
              value={filters.maxPrice}
              onChange={(event) => onChange({ maxPrice: Number(event.target.value), page: 1 })}
              aria-label="Maximum cost for one"
            />
            <p className="filters__range">Up to ₹{filters.maxPrice}</p>
          </div>

          <div className="filters__group">
            <h4>Preferences</h4>
            <div className="filters__chips">
              <button
                type="button"
                className={`chip ${filters.vegOnly ? 'is-active' : ''}`}
                onClick={() => onChange({ vegOnly: !filters.vegOnly, page: 1 })}
              >
                Pure veg options
              </button>
              <button
                type="button"
                className={`chip ${filters.hasOffer ? 'is-active' : ''}`}
                onClick={() => onChange({ hasOffer: !filters.hasOffer, page: 1 })}
              >
                Has an offer
              </button>
            </div>
          </div>

          <div className="filters__group filters__group--wide">
            <h4>Cuisines</h4>
            <div className="filters__chips filters__chips--wrap">
              {CUISINES.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  className={`chip ${filters.cuisines.includes(cuisine) ? 'is-active' : ''}`}
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          <div className="filters__actions">
            <Button variant="ghost" size="sm" onClick={onReset}>
              <Icon name="refresh" size={14} /> Reset all
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Show results
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FilterBar;
