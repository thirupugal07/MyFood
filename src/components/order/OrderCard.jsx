import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { STATUS_META } from '../../lib/orderStatus';

const OrderCard = ({ order, onReorder }) => {
  const meta = STATUS_META[order.status] || STATUS_META.placed;

  return (
    <article className="order-card">
      <header className="order-card__head">
        <div className="order-card__restaurant">
          <img src={order.restaurantImage} alt={order.restaurantName} loading="lazy" />
          <div>
            <h3>{order.restaurantName}</h3>
            <p>{order.restaurantArea} · {formatDateTime(order.placedAt)}</p>
          </div>
        </div>
        <span className={`status-pill status-pill--${meta.tone}`}>
          <Icon name={meta.icon} size={11} /> {meta.label}
        </span>
      </header>

      <div className="order-card__items">
        {order.items.slice(0, 3).map((line) => (
          <span key={line.itemId} className="order-card__item">
            {line.qty}× {line.name}
          </span>
        ))}
        {order.items.length > 3 ? (
          <span className="order-card__item order-card__item--more">
            +{order.items.length - 3} more
          </span>
        ) : null}
      </div>

      <footer className="order-card__foot">
        <div>
          <p className="order-card__number">#{order.orderNumber}</p>
          <p className="order-card__total">{formatCurrency(order.bill.total)}</p>
        </div>
        <div className="order-card__actions">
          <Button as={Link} to={`/orders/${order.id}`} size="sm" variant="outline">
            View details
          </Button>
          {onReorder ? (
            <Button size="sm" onClick={() => onReorder(order)}>
              <Icon name="refresh" size={13} /> Reorder
            </Button>
          ) : null}
        </div>
      </footer>
    </article>
  );
};

export default OrderCard;
