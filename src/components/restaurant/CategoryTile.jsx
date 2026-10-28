import { Link } from 'react-router-dom';

const CategoryTile = ({ category }) => (
  <Link to={`/restaurants?cuisine=${encodeURIComponent(category.name)}`} className="cat-tile">
    <span className="cat-tile__media">
      <img src={category.image} alt={category.name} loading="lazy" />
    </span>
    <span className="cat-tile__name">{category.name}</span>
    {category.tagline ? <span className="cat-tile__tagline">{category.tagline}</span> : null}
  </Link>
);

export default CategoryTile;
