import { Link, useNavigate } from 'react-router-dom';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import EmptyState from '../ui/EmptyState';
import CartLine from './CartLine';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../lib/format';

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    isDrawerOpen,
    closeDrawer,
    items,
    restaurant,
    bill,
    increment,
    decrement,
    removeItem,
    clearCart,
    itemCount,
  } = useCart();

  const goTo = (path) => {
    closeDrawer();
    navigate(path);
  };

  return (
    <Drawer
      open={isDrawerOpen}
      onClose={closeDrawer}
      title={restaurant ? restaurant.name : 'Your cart'}
      subtitle={restaurant ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} · ${restaurant.area}` : undefined}
      footer={
        items.length > 0 ? (
          <div className="drawer-cart__foot">
            <div className="drawer-cart__total">
              <span>Total</span>
              <strong>{formatCurrency(bill.total)}</strong>
            </div>
            <Button block onClick={() => goTo('/checkout')}>
              Checkout <Icon name="chevronRight" size={14} />
            </Button>
            <Button block variant="ghost" onClick={() => goTo('/cart')}>
              View full cart
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          message="Add a biriyani, a burger or a cold coffee — anything you like."
          action={
            <Button onClick={() => goTo('/restaurants')} size="sm">
              Browse restaurants
            </Button>
          }
        />
      ) : (
        <div className="drawer-cart">
          <div className="drawer-cart__lines">
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

          <Link to={`/restaurant/${restaurant.id}`} className="drawer-cart__add" onClick={closeDrawer}>
            <Icon name="plus" size={13} /> Add more items
          </Link>

          <button type="button" className="drawer-cart__clear" onClick={clearCart}>
            <Icon name="trash" size={13} /> Clear cart
          </button>

          <div className="drawer-cart__bill">
            <div>
              <span>Item total</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            <div>
              <span>Delivery + taxes</span>
              <span>{formatCurrency(bill.deliveryFee + bill.tax + bill.packagingFee)}</span>
            </div>
            {bill.discount > 0 ? (
              <div className="is-discount">
                <span>Coupon discount</span>
                <span>− {formatCurrency(bill.discount)}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;
