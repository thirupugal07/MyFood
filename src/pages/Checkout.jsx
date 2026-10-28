import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import AddressForm from '../components/ui/AddressForm';
import BillSummary from '../components/cart/BillSummary';
import api from '../lib/api';
import { PAYMENT_METHODS } from '../data/catalog';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCurrency } from '../lib/format';

const Checkout = () => {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const toast = useToast();
  const { user, token, saveAddress } = useAuth();
  const {
    items,
    restaurant,
    bill,
    coupon,
    itemCount,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const addresses = useMemo(() => user?.addresses || [], [user]);
  const defaultAddressId = useMemo(() => {
    const preferred = addresses.find((address) => address.isDefault) || addresses[0];
    return preferred?.id || null;
  }, [addresses]);

  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddressId);
  const [payment, setPayment] = useState('upi');
  const [instructions, setInstructions] = useState('');
  const [contactless, setContactless] = useState(true);
  const [addressOpen, setAddressOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) || addresses[0] || null;

  if (items.length === 0 && !placed) return <Navigate to="/cart" replace />;

  const handleSaveAddress = async (address) => {
    setSavingAddress(true);
    try {
      const updated = await saveAddress(address);
      const created =
        updated.addresses.find((candidate) => candidate.line1 === address.line1) ||
        updated.addresses[updated.addresses.length - 1];
      setSelectedAddressId(created?.id || null);
      setAddressOpen(false);
      toast.success('Address saved.');
    } catch (error) {
      toast.error(error.message || 'Could not save the address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error('Add a delivery address to continue.');
      setAddressOpen(true);
      return;
    }
    if (payment === 'card' || payment === 'netbanking') {
      toast.info('This is a demo build — no real payment gateway is connected yet.');
    }

    setPlacing(true);
    try {
      const order = await api.placeOrder(token, {
        restaurantId: restaurant.id,
        items: items.map((line) => ({ itemId: line.itemId, qty: line.qty, name: line.name })),
        couponCode: coupon?.code || null,
        address: selectedAddress,
        paymentMethod: payment,
        instructions,
        contactless,
      });
      setPlaced(true);
      clearCart();
      toast.success('Order placed. Tracking it now!');
      navigate(`/orders/${order.id}?new=1`, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Could not place the order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/cart">Cart</Link>
        <Icon name="chevronRight" size={10} />
        <span>Checkout</span>
      </nav>

      <header className="page__head">
        <div>
          <h1>Checkout</h1>
          <p className="page__sub">Confirm your address and payment, then we start cooking.</p>
        </div>
      </header>

      <div className="checkout">
        <div className="checkout__main">
          <section className="panel">
            <div className="panel__head">
              <h2>
                <span className="panel__step">1</span> Delivery address
              </h2>
              <Button size="sm" variant="ghost" onClick={() => setAddressOpen(true)}>
                <Icon name="plus" size={13} /> Add new
              </Button>
            </div>

            {addresses.length === 0 ? (
              <EmptyState
                compact
                icon="pin"
                title="No saved addresses"
                message="Add where you want this order delivered."
                action={
                  <Button size="sm" onClick={() => setAddressOpen(true)}>
                    Add address
                  </Button>
                }
              />
            ) : (
              <div className="address-list">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`address-card ${selectedAddress?.id === address.id ? 'is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddress?.id === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                    <div>
                      <p className="address-card__label">
                        {address.label}
                        {address.isDefault ? <span>Default</span> : null}
                      </p>
                      <p className="address-card__line">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}
                      </p>
                      <p className="address-card__line">
                        {address.area}, {address.city} — {address.pincode}
                      </p>
                      <p className="address-card__phone">
                        <Icon name="phone" size={11} /> {address.phone}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2>
                <span className="panel__step">2</span> Payment method
              </h2>
            </div>
            <div className="pay-list">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`pay-card ${payment === method.id ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={payment === method.id}
                    onChange={() => setPayment(method.id)}
                  />
                  <span className="pay-card__icon">
                    <Icon name={method.icon} size={18} />
                  </span>
                  <span>
                    <strong>{method.label}</strong>
                    <small>{method.hint}</small>
                  </span>
                </label>
              ))}
            </div>
            <p className="panel__note">
              <Icon name="shield" size={13} /> Demo build — payments are simulated, nothing is
              charged.
            </p>
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2>
                <span className="panel__step">3</span> Anything else?
              </h2>
            </div>
            <label className="field">
              <span className="field__label">Cooking or delivery instructions</span>
              <textarea
                className="textarea"
                rows={2}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Less spicy, ring the bell twice, leave at the door…"
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={contactless}
                onChange={(event) => setContactless(event.target.checked)}
              />
              <span>Contactless delivery</span>
            </label>
          </section>
        </div>

        <aside className="checkout__aside">
          <div className="checkout__restaurant">
            <img src={restaurant.image} alt={restaurant.name} />
            <div>
              <h3>{restaurant.name}</h3>
              <p>
                {itemCount} {itemCount === 1 ? 'item' : 'items'} · {restaurant.area}
              </p>
            </div>
          </div>

          <ul className="checkout__items">
            {items.map((line) => (
              <li key={line.itemId}>
                <span className={line.isVeg ? 'dot dot--veg' : 'dot dot--nonveg'} />
                <span className="checkout__item-name">
                  {line.qty} × {line.name}
                </span>
                <span>{formatCurrency(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>

          <BillSummary
            bill={bill}
            coupon={coupon}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
            title="Bill details"
          />

          <Button block size="lg" loading={placing} onClick={placeOrder} disabled={!selectedAddress}>
            Place order · {formatCurrency(bill.total)}
          </Button>
          <p className="checkout__terms">
            By placing this order you agree to MyFood&apos;s terms of service.
          </p>
        </aside>
      </div>

      <AddressForm
        open={addressOpen}
        saving={savingAddress}
        onClose={() => setAddressOpen(false)}
        onSave={handleSaveAddress}
      />
    </div>
  );
};

export default Checkout;
