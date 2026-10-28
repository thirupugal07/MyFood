import { useState } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/format';

const BillSummary = ({
  bill,
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
  showCouponInput = true,
  title = 'Bill details',
}) => {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const apply = async (event) => {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setChecking(true);
    setError('');
    try {
      const validated = await api.validateCoupon(trimmed, bill.subtotal);
      onApplyCoupon(validated);
      toast.success(`Coupon ${validated.code} applied — you saved ${formatCurrency(
        validated.type === 'delivery' ? bill.deliveryFee : Math.min(
          validated.type === 'percent' ? (bill.subtotal * validated.value) / 100 : validated.value,
          validated.maxDiscount || Infinity,
        ),
      )}.`);
      setCode('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <section className="bill">
      <h3 className="bill__title">{title}</h3>

      {showCouponInput ? (
        coupon ? (
          <div className="bill__coupon-applied">
            <div>
              <p className="bill__coupon-code">
                <Icon name="tag" size={13} /> {coupon.code}
              </p>
              <p className="bill__coupon-desc">{coupon.label}</p>
            </div>
            <button type="button" className="bill__coupon-remove" onClick={onRemoveCoupon}>
              Remove
            </button>
          </div>
        ) : (
          <form className="bill__coupon" onSubmit={apply}>
            <div className="bill__coupon-field">
              <Icon name="tag" size={14} />
              <input
                type="text"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter coupon code"
                aria-label="Coupon code"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" loading={checking} disabled={!code.trim()}>
              Apply
            </Button>
          </form>
        )
      ) : null}

      {error ? <p className="bill__error">{error}</p> : null}

      <dl className="bill__rows">
        <div>
          <dt>Item total</dt>
          <dd>{formatCurrency(bill.subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery fee</dt>
          <dd>
            {bill.deliveryFee === 0 ? (
              <span className="bill__free">FREE</span>
            ) : (
              formatCurrency(bill.deliveryFee)
            )}
          </dd>
        </div>
        {bill.deliveryDiscount > 0 ? (
          <div className="bill__row--discount">
            <dt>Delivery discount</dt>
            <dd>− {formatCurrency(bill.deliveryDiscount)}</dd>
          </div>
        ) : null}
        <div>
          <dt>Packaging charges</dt>
          <dd>{formatCurrency(bill.packagingFee)}</dd>
        </div>
        <div>
          <dt>Taxes (5% GST)</dt>
          <dd>{formatCurrency(bill.tax)}</dd>
        </div>
        {bill.discount > 0 ? (
          <div className="bill__row--discount">
            <dt>Coupon discount</dt>
            <dd>− {formatCurrency(bill.discount)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="bill__total">
        <span>To pay</span>
        <strong>{formatCurrency(bill.total)}</strong>
      </div>

      {!bill.freeDelivery && bill.subtotal > 0 ? (
        <p className="bill__hint">
          <Icon name="bike" size={13} /> Add {formatCurrency(bill.amountToFreeDelivery)} more for free
          delivery.
        </p>
      ) : null}
    </section>
  );
};

export default BillSummary;
