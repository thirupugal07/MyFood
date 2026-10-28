import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { ListRowSkeleton } from '../components/ui/Skeleton';
import OrderCard from '../components/order/OrderCard';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { isActiveOrder } from '../lib/orderStatus';

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'past', label: 'Past orders' },
  { id: 'all', label: 'All' },
];

const Orders = () => {
  useDocumentTitle('My orders');
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = useAuth();
  const { restoreCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('active');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.getOrders(token);
      setOrders(list);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not load your orders.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    if (tab === 'active') return orders.filter((order) => isActiveOrder(order.status));
    if (tab === 'past') return orders.filter((order) => !isActiveOrder(order.status));
    return orders;
  }, [orders, tab]);

  const handleReorder = (order) => {
    restoreCart(order.items, {
      id: order.restaurantId,
      name: order.restaurantName,
      image: order.restaurantImage,
      area: order.restaurantArea,
      deliveryTimeMin: order.deliveryTimeMin,
    });
    toast.success(`Items from ${order.restaurantName} added back to your cart.`);
    navigate('/cart');
  };

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>My orders</h1>
          <p className="page__sub">Track live orders and reorder your favourites in one tap.</p>
        </div>
        <Button size="sm" variant="ghost" onClick={load} loading={loading}>
          <Icon name="refresh" size={14} /> Refresh
        </Button>
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`tabs__item ${tab === item.id ? 'is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            <span className="tabs__count">
              {item.id === 'active'
                ? orders.filter((order) => isActiveOrder(order.status)).length
                : item.id === 'past'
                  ? orders.filter((order) => !isActiveOrder(order.status)).length
                  : orders.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="orders-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="panel">
              <ListRowSkeleton />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="alert"
          title="Could not load orders"
          message={error}
          action={
            <Button size="sm" onClick={load}>
              Retry
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="receipt"
          title={tab === 'active' ? 'No active orders' : 'No orders here yet'}
          message="When you place an order it will show up here with live tracking."
          action={
            <Button as={Link} to="/restaurants" size="sm">
              Order something
            </Button>
          }
        />
      ) : (
        <div className="orders-list">
          {visible.map((order) => (
            <OrderCard key={order.id} order={order} onReorder={handleReorder} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
