import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFavourites } from '../../context/FavouritesContext';
import { useDeliveryLocation } from '../../context/LocationContext';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { AREAS } from '../../data/catalog';
import { initials } from '../../lib/format';

const Header = () => {
  const navigate = useNavigate();
  const { itemCount, openDrawer } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { count: favouriteCount } = useFavourites();
  const { area, setArea } = useDeliveryLocation();

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const accountRef = useRef(null);

  useOnClickOutside(accountRef, () => setAccountOpen(false), accountOpen);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [navigate]);

  const navLinks = useMemo(
    () => [
      { to: '/restaurants', label: 'Restaurants' },
      { to: '/offers', label: 'Offers' },
      { to: '/orders', label: 'My orders' },
    ],
    [],
  );

  const submitSearch = (event) => {
    event.preventDefault();
    const term = search.trim();
    navigate(term ? `/restaurants?search=${encodeURIComponent(term)}` : '/restaurants');
    setMenuOpen(false);
  };

  return (
    <>
      <header className="hdr">
        <div className="container hdr__inner">
          <Link to="/" className="hdr__logo" aria-label="MyFood home">
            <img src="/images/myfoodlogo.png" alt="" />
            <span className="hdr__wordmark">MyFood</span>
          </Link>

          <button type="button" className="hdr__loc" onClick={() => setLocationOpen(true)}>
            <Icon name="pin" size={16} />
            <span className="hdr__loc-text">
              <span className="hdr__loc-label">Deliver to</span>
              <strong>{area}</strong>
            </span>
            <Icon name="chevronDown" size={12} />
          </button>

          <form className="hdr__search" onSubmit={submitSearch} role="search">
            <Icon name="search" size={16} className="hdr__search-icon" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for biriyani, pizza, a restaurant…"
              aria-label="Search restaurants and dishes"
            />
            <Button type="submit" size="sm" variant="primary" className="hdr__search-btn">
              Search
            </Button>
          </form>

          <nav className="hdr__nav" aria-label="Main">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `hdr__nav-link ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hdr__actions">
            <button
              type="button"
              className="hdr__icon-btn"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              <Icon name={isDark ? 'sun' : 'moon'} size={18} />
            </button>

            <Link to="/favourites" className="hdr__icon-btn" aria-label="Favourites" title="Favourites">
              <Icon name="heart" size={18} />
              {favouriteCount > 0 ? <span className="hdr__dot">{favouriteCount}</span> : null}
            </Link>

            <button type="button" className="hdr__icon-btn hdr__cart" onClick={openDrawer} aria-label={`Cart, ${itemCount} items`}>
              <Icon name="cart" size={18} />
              {itemCount > 0 ? <span className="hdr__badge">{itemCount}</span> : null}
            </button>

            <div className="hdr__account" ref={accountRef}>
              <button
                type="button"
                className="hdr__avatar"
                onClick={() => setAccountOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                {isAuthenticated ? <span>{initials(user.name)}</span> : <Icon name="user" size={17} />}
              </button>

              {accountOpen ? (
                <div className="hdr__menu" role="menu">
                  {isAuthenticated ? (
                    <>
                      <div className="hdr__menu-head">
                        <p className="hdr__menu-name">{user.name}</p>
                        <p className="hdr__menu-email">{user.email}</p>
                      </div>
                      <Link to="/profile" className="hdr__menu-item" role="menuitem">
                        <Icon name="user" size={15} /> Profile & addresses
                      </Link>
                      <Link to="/orders" className="hdr__menu-item" role="menuitem">
                        <Icon name="receipt" size={15} /> My orders
                      </Link>
                      <Link to="/favourites" className="hdr__menu-item" role="menuitem">
                        <Icon name="heart" size={15} /> Favourites
                      </Link>
                      <button
                        type="button"
                        className="hdr__menu-item hdr__menu-item--danger"
                        role="menuitem"
                        onClick={() => {
                          logout();
                          setAccountOpen(false);
                          navigate('/');
                        }}
                      >
                        <Icon name="logout" size={15} /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="hdr__menu-head">
                        <p className="hdr__menu-name">Welcome to MyFood</p>
                        <p className="hdr__menu-email">Sign in to order and track deliveries.</p>
                      </div>
                      <Link to="/login" className="hdr__menu-item" role="menuitem">
                        <Icon name="user" size={15} /> Sign in
                      </Link>
                      <Link to="/signup" className="hdr__menu-item" role="menuitem">
                        <Icon name="sparkles" size={15} /> Create account
                      </Link>
                    </>
                  )}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="hdr__icon-btn hdr__burger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="hdr__mobile">
            <form className="hdr__mobile-search" onSubmit={submitSearch} role="search">
              <Icon name="search" size={16} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search restaurants or dishes"
                aria-label="Search restaurants and dishes"
              />
            </form>
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className="hdr__mobile-link" onClick={() => setMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <Link to="/favourites" className="hdr__mobile-link" onClick={() => setMenuOpen(false)}>
              Favourites {favouriteCount ? `(${favouriteCount})` : ''}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="hdr__mobile-link" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button
                  type="button"
                  className="hdr__mobile-link hdr__mobile-link--danger"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    navigate('/');
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="hdr__mobile-link" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
            )}
          </div>
        ) : null}
      </header>

      <Modal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        title="Where should we deliver?"
        description="Pick the area you want food delivered to. You can change it any time."
        size="sm"
      >
        <div className="loc-list">
          {AREAS.map((option) => (
            <button
              key={option}
              type="button"
              className={`loc-list__item ${option === area ? 'is-active' : ''}`}
              onClick={() => {
                setArea(option);
                setLocationOpen(false);
              }}
            >
              <Icon name="pin" size={15} />
              <span>{option}</span>
              <span className="loc-list__city">Chennai</span>
              {option === area ? <Icon name="check" size={15} className="loc-list__check" /> : null}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default Header;
