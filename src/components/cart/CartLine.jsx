import Icon from '../ui/Icon';
import QuantityStepper from '../ui/QuantityStepper';
import { VegBadge } from '../ui/Badge';
import { formatCurrency } from '../../lib/format';

const CartLine = ({ line, onIncrement, onDecrement, onRemove, editable = true }) => (
  <div className="cart-line">
    <VegBadge isVeg={line.isVeg} />
    <div className="cart-line__body">
      <p className="cart-line__name">{line.name}</p>
      <p className="cart-line__price">{formatCurrency(line.price)}</p>
    </div>
    {editable ? (
      <div className="cart-line__controls">
        <QuantityStepper
          value={line.qty}
          size="sm"
          onIncrement={() => onIncrement(line)}
          onDecrement={() => onDecrement(line)}
        />
        <button
          type="button"
          className="cart-line__remove"
          onClick={() => onRemove(line)}
          aria-label={`Remove ${line.name}`}
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    ) : (
      <span className="cart-line__qty">× {line.qty}</span>
    )}
    <p className="cart-line__amount">{formatCurrency(line.price * line.qty)}</p>
  </div>
);

export const CartLineMini = ({ line }) => (
  <span className="cart-mini">
    <span className="cart-mini__qty">{line.qty}×</span> {line.name}
  </span>
);

export default CartLine;
