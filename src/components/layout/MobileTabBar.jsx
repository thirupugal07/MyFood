import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useCart } from '../../context/CartContext';

const MobileTabBar = () => {
  const { itemCount, openDrawer } = useCart();

  return (
    <nav className="tabbar" aria-label="Quick navigation">
      <NavLink to="/" className={({ isActive }) => `tabbar__item ${isActive ? 'is-active' : ''}`} end>
        <Icon name="home" size={19} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/restaurants" className={({ isActive }) => `tabbar__item ${isActive ? 'is-active' : ''}`}>
        <Icon name="search" size={19} />
        <span>Browse</span>
      </NavLink>
      <button type="button" className="tabbar__item" onClick={openDrawer}>
        <span className="tabbar__cart">
          <Icon name="cart" size={19} />
          {itemCount > 0 ? <span className="tabbar__badge">{itemCount}</span> : null}
        </span>
        <span>Cart</span>
      </button>
      <NavLink to="/orders" className={({ isActive }) => `tabbar__item ${isActive ? 'is-active' : ''}`}>
        <Icon name="receipt" size={19} />
        <span>Orders</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `tabbar__item ${isActive ? 'is-active' : ''}`}>
        <Icon name="user" size={19} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileTabBar;
