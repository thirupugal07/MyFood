import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileTabBar from './MobileTabBar';
import CartDrawer from '../cart/CartDrawer';

const Layout = () => {
  const { pathname } = useLocation();

  /* Scroll to the top on route change, but keep the browser's own
     scroll restoration for back/forward navigations. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="app-main">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <CartDrawer />
    </div>
  );
};

export default Layout;
