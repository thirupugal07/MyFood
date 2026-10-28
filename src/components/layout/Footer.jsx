import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

const COLUMNS = [
  {
    title: 'About MyFood',
    links: ['Who we are', 'Blog', 'Work with us', 'Investor relations', 'Contact us'],
  },
  {
    title: 'For restaurants',
    links: ['Partner with us', 'Apps for you', 'Restaurant dashboard'],
  },
  {
    title: 'Learn more',
    links: ['Privacy', 'Security', 'Terms', 'Sitemap'],
  },
];

const Footer = () => (
  <footer className="footer">
    <div className="container footer__inner">
      <div className="footer__brand">
        <Link to="/" className="footer__logo">
          <img src="/images/myfoodlogo.png" alt="MyFood" />
          <span>MyFood</span>
        </Link>
        <p className="footer__tagline">
          Fresh food from the restaurants you love, delivered hot across Chennai.
        </p>
        <div className="footer__stores">
          <a href="#top" className="footer__store">
            <img src="/images/appstore.webp" alt="Download on the App Store" />
          </a>
          <a href="#top" className="footer__store">
            <img src="/images/googleplay.webp" alt="Get it on Google Play" />
          </a>
        </div>
      </div>

      <div className="footer__columns">
        {COLUMNS.map((column) => (
          <div key={column.title} className="footer__column">
            <h3>{column.title}</h3>
            <ul>
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#top">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__social">
        <h3>Follow us</h3>
        <div className="footer__social-icons">
          {['facebook', 'instagram', 'twitter', 'youtube'].map((network) => (
            <a key={network} href="#top" aria-label={network} className="footer__social-link">
              <Icon name="info" size={16} />
            </a>
          ))}
        </div>
        <p className="footer__note">
          <Icon name="shield" size={13} /> Payments are encrypted and secure.
        </p>
      </div>
    </div>

    <div className="container footer__bottom">
      <p>© {new Date().getFullYear()} MyFood. Built as a React demo project.</p>
      <p>Made in Chennai · India</p>
    </div>
  </footer>
);

export default Footer;
