import { Link } from 'react-router-dom';

const BrandStrip = ({ brands }) => (
  <div className="brands" role="list">
    {brands.map((brand) => (
      <Link
        key={brand.id}
        to={`/restaurants?search=${encodeURIComponent(brand.name)}`}
        className="brands__item"
        role="listitem"
      >
        <img src={brand.image} alt={brand.name} loading="lazy" />
        <span>{brand.name}</span>
      </Link>
    ))}
  </div>
);

export default BrandStrip;
