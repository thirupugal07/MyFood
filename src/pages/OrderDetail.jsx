import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { PageLoader } from '../components/ui/Spinner';
import OrderTracker from '../components/order/OrderTracker';
import StatusPill from '../components/order/StatusPill';
import api from '../lib/api';
import { PAYMENT_METHODS } from '../data/catalog';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCurrency, formatDateTime } from '../lib/format';
import { canCancelOrder } from '../lib/orderStatus';

const OrderDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = useAuth();
  const { restoreCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isNew = searchParams.get('new') === '1';
  useDocumentTitle(order ? `Order #${order.orderNumber}` : 'Order');

  const load = useCallback(async () => {
    try {
      const data = await api.getOrder(token, id);
      setOrder(data);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not load this order.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
    /* Poll while the order is live - a websocket would replace this in production. */
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const cancel = async () => {
    setCancelling(true);
    try {
      const updated = await api.cancelOrder(token, id, 'Cancelled from order page');
      setOrder({ ...updated, status: 'cancelled' });
      setConfirmCancel(false);
      toast.success('Order cancelled. Refund initiated if you paid online.');
    } catch (cancelError) {
      toast.error(cancelError.message || 'Could not cancel the order.');
    } finally {
      setCancelling(false);
    }
  };

  const reorder = () => {
    restoreCart(order.items, {
      id: order.restaurantId,
      name: order.restaurantName,
      image: order.restaurantImage,
      area: order.restaurantArea,
      deliveryTimeMin: order.deliveryTimeMin,
    });
    toast.success('Added back to your cart.');
    navigate('/cart');
  };

  if (loading) return <PageLoader label="Loading your order…" />;

  if (error || !order) {
    return (
      <div className="container page">
        <EmptyState
          icon="alert"
          title="Order not found"
          message={error || 'This order does not exist on your account.'}
          action={
            <Button as={Link} to="/orders" size="sm">
              Back to my orders
            </Button>
          }
        />
      </div>
    );
  }

  const paymentLabel =
    PAYMENT_METHODS.find((method) => method.id === order.paymentMethod)?.label || order.paymentMethod;

  return (
    <div className="container page">
      {isNew ? (
        <div className="success-banner">
          <span className="success-banner__icon">
            <Icon name="checkCircle" size={26} />
          </span>
          <div>
            <h2>Order confirmed!</h2>
            <p>
              {order.restaurantName} is getting started. We will keep this page updated as your food
              moves.
            </p>
          </div>
        </div>
      ) : null}

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/orders">My orders</Link>
        <Icon name="chevronRight" size={10} />
        <span>#{order.orderNumber}</span>
      </nav>

      <header className="page__head">
        <div>
          <h1>Order #{order.orderNumber}</h1>
          <p className="page__sub">
            Placed {formatDateTime(order.placedAt)} · {order.items.length}{' '}
            {order.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="page__head-actions">
          <StatusPill status={order.status} />
          {canCancelOrder(order.status) ? (
            <Button size="sm" variant="danger" onClick={() => setConfirmCancel(true)}>
              Cancel order
            </Button>
          ) : null}
        </div>
      </header>

      <div className="order-detail">
        <div className="order-detail__main">
          <section className="panel">
            <div className="panel__head">
              <h2>Live tracking</h2>
              <span className="panel__hint">Updates automatically</span>
            </div>
            <OrderTracker timeline={order.timeline} cancelled={order.status === 'cancelled'} />
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2>Items from {order.restaurantName}</h2>
              <Button as={Link} to={`/restaurant/${order.restaurantId}`} size="sm" variant="ghost">
                View restaurant
              </Button>
            </div>
            <ul className="order-items">
              {order.items.map((line) => (
                <li key={line.itemId}>
                  <span className={line.isVeg ? 'dot dot--veg' : 'dot dot--nonveg'} />
                  <span className="order-items__name">
                    {line.name} <small>× {line.qty}</small>
                  </span>
                  <span>{formatCurrency(line.price * line.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="order-items__actions">
              <Button size="sm" variant="outline" onClick={reorder}>
                <Icon name="refresh" size={13} /> Reorder these items
              </Button>
            </div>
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2>Bill details</h2>
            </div>
            <dl className="bill__rows">
              <div>
                <dt>Item total</dt>
                <dd>{formatCurrency(order.bill.subtotal)}</dd>
              </div>
              <div>
                <dt>Delivery fee</dt>
                <dd>{order.bill.deliveryFee === 0 ? 'FREE' : formatCurrency(order.bill.deliveryFee)}</dd>
              </div>
              <div>
                <dt>Packaging</dt>
                <dd>{formatCurrency(order.bill.packagingFee)}</dd>
              </div>
              <div>
                <dt>Taxes</dt>
                <dd>{formatCurrency(order.bill.tax)}</dd>
              </div>
              {order.bill.discount > 0 ? (
                <div className="bill__row--discount">
                  <dt>Coupon {order.couponCode ? `(${order.couponCode})` : ''}</dt>
                  <dd>− {formatCurrency(order.bill.discount)}</dd>
                </div>
              ) : null}
            </dl>
            <div className="bill__total">
              <span>Paid via {paymentLabel}</span>
              <strong>{formatCurrency(order.bill.total)}</strong>
            </div>
          </section>
        </div>

        <aside className="order-detail__aside">
          <section className="panel">
            <h2 className="panel__title-sm">Delivering to</h2>
            <p className="order-detail__address">
              <strong>{order.address.label}</strong>
              <br />
              {order.address.line1}
              {order.address.line2 ? (
                <>
                  <br />
                  {order.address.line2}
                </>
              ) : null}
              <br />
              {order.address.area}, {order.address.city} — {order.address.pincode}
            </p>
            <p className="order-detail__phone">
              <Icon name="phone" size={12} /> {order.address.phone}
            </p>
          </section>

          <section className="panel">
            <h2 className="panel__title-sm">Need help?</h2>
            <p className="panel__note">
              Call the MyFood helpline on 1800-000-000 or chat with support from the app. Our team is
              available 7 am to 1 am.
            </p>
            <Button as={Link} to="/orders" size="sm" variant="ghost" block>
              Back to my orders
            </Button>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message="The restaurant may already have started cooking. If you paid online, the refund takes 3-5 working days."
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep my order"
        tone="danger"
        loading={cancelling}
        onConfirm={cancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
};

export default OrderDetail;
