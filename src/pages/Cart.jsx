import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import CartLine from '../components/cart/CartLine';
import BillSummary from '../components/cart/BillSummary';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCurrency } from '../lib/format';

const Cart = () => {
  useDocumentTitle('Your cart');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    restaurant,
    bill,
    coupon,
    increment,
    decrement,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    itemCount,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          message="Looks like you have not added anything yet. Start with a biriyani?"
          action={
            <Button as={Link} to="/restaurants" size="sm">
              Browse restaurants
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>Your cart</h1>
          <p className="page__sub">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} from {restaurant.name}
          </p>
        </div>
        <button type="button" className="link-btn" onClick={clearCart}>
          <Icon name="trash" size={14} /> Clear cart
        </button>
      </header>

      <div className="cart-page">
        <section className="cart-page__main">
          <div className="cart-page__restaurant">
            <img src={restaurant.image} alt={restaurant.name} />
            <div>
              <h2>{restaurant.name}</h2>
              <p>
                {restaurant.area} · about {restaurant.deliveryTimeMin} min
              </p>
            </div>
            <Link to={`/restaurant/${restaurant.id}`} className="cart-page__add">
              Add more items
            </Link>
          </div>

          <div className="cart-page__lines">
            {items.map((line) => (
              <CartLine
                key={line.itemId}
                line={line}
                onIncrement={() => increment(line.itemId)}
                onDecrement={() => decrement(line.itemId)}
                onRemove={() => removeItem(line.itemId)}
              />
            ))}
          </div>

          <div className="cart-page__note">
            <Icon name="info" size={14} />
            <p>
              Items from one restaurant per order. To order from somewhere else, clear the cart
              first.
            </p>
          </div>
        </section>

        <aside className="cart-page__aside">
          <BillSummary
            bill={bill}
            coupon={coupon}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
          />
          <div className="cart-page__cta">
            <Button block onClick={() => navigate(isAuthenticated ? '/checkout' : '/login?next=/checkout')}>
              {isAuthenticated ? 'Proceed to checkout' : 'Sign in to checkout'}
            </Button>
            <p className="cart-page__cta-note">
              Paying {formatCurrency(bill.total)} · secure UPI, cards or cash on delivery
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
