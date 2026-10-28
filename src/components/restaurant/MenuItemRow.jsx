import Icon from '../ui/Icon';
import Button from '../ui/Button';
import QuantityStepper from '../ui/QuantityStepper';
import { VegBadge } from '../ui/Badge';
import { formatCurrency } from '../../lib/format';

const MenuItemRow = ({ item, quantity = 0, onAdd, onIncrement, onDecrement }) => (
  <article className={`menu-item ${item.isAvailable ? '' : 'menu-item--unavailable'}`.trim()}>
    <div className="menu-item__content">
      <div className="menu-item__flags">
        <VegBadge isVeg={item.isVeg} />
        {item.isBestseller ? (
          <span className="menu-item__tag">
            <Icon name="star" size={9} /> Bestseller
          </span>
        ) : null}
        {item.isSpicy ? (
          <span className="menu-item__tag menu-item__tag--spicy">
            <Icon name="alert" size={9} /> Spicy
          </span>
        ) : null}
      </div>
      <h4 className="menu-item__name">{item.name}</h4>
      <p className="menu-item__price">{formatCurrency(item.price)}</p>
      <p className="menu-item__desc">{item.description}</p>
      {!item.isAvailable ? <p className="menu-item__sold">Currently unavailable</p> : null}
    </div>

    <div className="menu-item__media">
      <img src={item.image} alt={item.name} loading="lazy" />
      {item.isAvailable ? (
        quantity > 0 ? (
          <div className="menu-item__stepper">
            <QuantityStepper
              value={quantity}
              size="sm"
              onIncrement={() => onIncrement(item)}
              onDecrement={() => onDecrement(item)}
            />
          </div>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="menu-item__add"
            onClick={() => onAdd(item)}
          >
            Add
          </Button>
        )
      ) : null}
    </div>
  </article>
);

export default MenuItemRow;
