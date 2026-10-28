import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import AddressForm from '../components/ui/AddressForm';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatDate, initials } from '../lib/format';
import { isEmail, phone as phoneValidator, required, validateForm } from '../lib/validation';

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'addresses', label: 'Addresses', icon: 'pin' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'preferences', label: 'Preferences', icon: 'sliders' },
];

const Profile = () => {
  useDocumentTitle('My profile');
  const navigate = useNavigate();
  const toast = useToast();
  const { user, updateProfile, changePassword, saveAddress, deleteAddress, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { clearCart, itemCount } = useCart();
  const { count: favouriteCount, clearFavourites } = useFavourites();

  const [tab, setTab] = useState('profile');
  const [values, setValues] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [addressOpen, setAddressOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState(null);

  useEffect(() => {
    if (!user) return;
    setValues({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  if (!user) return null;

  const saveProfile = async (event) => {
    event.preventDefault();
    const found = validateForm(values, {
      name: [required('Name')],
      email: [isEmail],
      phone: [phoneValidator],
    });
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ name: values.name.trim(), email: values.email.trim(), phone: values.phone });
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error.message || 'Could not update your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveNewPassword = async (event) => {
    event.preventDefault();
    const found = {};
    if (!passwords.currentPassword) found.currentPassword = 'Enter your current password';
    if (passwords.newPassword.length < 8) found.newPassword = 'Use at least 8 characters';
    if (passwords.newPassword !== passwords.confirm) found.confirm = 'Passwords do not match';
    if (Object.keys(found).length) {
      setPasswordErrors(found);
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password updated.');
    } catch (error) {
      setPasswordErrors({ currentPassword: error.message || 'Could not update the password' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveAddress = async (address) => {
    setSavingAddress(true);
    try {
      await saveAddress(address);
      setAddressOpen(false);
      setEditingAddress(null);
      toast.success(address.id ? 'Address updated.' : 'Address added.');
    } catch (error) {
      toast.error(error.message || 'Could not save the address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deletingAddress) return;
    try {
      await deleteAddress(deletingAddress.id);
      toast.success('Address removed.');
    } catch (error) {
      toast.error(error.message || 'Could not remove the address.');
    } finally {
      setDeletingAddress(null);
    }
  };

  return (
    <div className="container page">
      <header className="profile__head">
        <div className="profile__avatar">{initials(user.name)}</div>
        <div>
          <h1>{user.name}</h1>
          <p className="page__sub">
            {user.email} · Member since {formatDate(user.createdAt)}
          </p>
        </div>
      </header>

      <div className="profile">
        <nav className="profile__nav" aria-label="Profile sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`profile__nav-item ${tab === item.id ? 'is-active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <Icon name={item.icon} size={15} /> {item.label}
            </button>
          ))}
          <button
            type="button"
            className="profile__nav-item profile__nav-item--danger"
            onClick={() => {
              logout();
              navigate('/');
              toast.info('You have been signed out.');
            }}
          >
            <Icon name="logout" size={15} /> Sign out
          </button>
        </nav>

        <div className="profile__content">
          {tab === 'profile' ? (
            <section className="panel">
              <div className="panel__head">
                <h2>Your details</h2>
              </div>
              <form className="profile__form" onSubmit={saveProfile}>
                <Input
                  label="Full name"
                  value={values.name}
                  onChange={(event) => setValues({ ...values, name: event.target.value })}
                  error={errors.name}
                  required
                />
                <Input
                  label="Email address"
                  type="email"
                  value={values.email}
                  onChange={(event) => setValues({ ...values, email: event.target.value })}
                  error={errors.email}
                  required
                />
                <Input
                  label="Mobile number"
                  value={values.phone}
                  onChange={(event) => setValues({ ...values, phone: event.target.value })}
                  error={errors.phone}
                  inputMode="tel"
                  required
                />
                <div className="profile__form-actions">
                  <Button type="submit" loading={savingProfile}>
                    Save changes
                  </Button>
                </div>
              </form>
            </section>
          ) : null}

          {tab === 'addresses' ? (
            <section className="panel">
              <div className="panel__head">
                <h2>Saved addresses</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressOpen(true);
                  }}
                >
                  <Icon name="plus" size={13} /> Add address
                </Button>
              </div>

              {(user.addresses || []).length === 0 ? (
                <EmptyState
                  compact
                  icon="pin"
                  title="No addresses saved"
                  message="Add one now so checkout takes seconds."
                  action={
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressOpen(true);
                      }}
                    >
                      Add address
                    </Button>
                  }
                />
              ) : (
                <div className="address-list address-list--manage">
                  {user.addresses.map((address) => (
                    <div key={address.id} className="address-card address-card--static">
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
                      <div className="address-card__actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddress(address);
                            setAddressOpen(true);
                          }}
                          aria-label={`Edit ${address.label} address`}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          type="button"
                          className="is-danger"
                          onClick={() => setDeletingAddress(address)}
                          aria-label={`Delete ${address.label} address`}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {tab === 'security' ? (
            <section className="panel">
              <div className="panel__head">
                <h2>Change password</h2>
              </div>
              <form className="profile__form" onSubmit={saveNewPassword}>
                <Input
                  label="Current password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(event) =>
                    setPasswords({ ...passwords, currentPassword: event.target.value })
                  }
                  error={passwordErrors.currentPassword}
                  required
                />
                <Input
                  label="New password"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                  error={passwordErrors.newPassword}
                  hint="At least 8 characters."
                  required
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
                  error={passwordErrors.confirm}
                  required
                />
                <div className="profile__form-actions">
                  <Button type="submit" loading={savingPassword}>
                    Update password
                  </Button>
                </div>
              </form>
              <p className="panel__note">
                <Icon name="shield" size={13} /> In this demo build passwords are stored in your
                browser only. Real credentials are hashed on the server.
              </p>
            </section>
          ) : null}

          {tab === 'preferences' ? (
            <section className="panel">
              <div className="panel__head">
                <h2>Preferences</h2>
              </div>

              <div className="pref-row">
                <div>
                  <p className="pref-row__title">Dark mode</p>
                  <p className="pref-row__desc">Easier on the eyes at night.</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={isDark} onChange={toggleTheme} />
                  <span className="switch__track" />
                </label>
              </div>

              <div className="pref-row">
                <div>
                  <p className="pref-row__title">Cart</p>
                  <p className="pref-row__desc">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} saved in this browser.
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={clearCart} disabled={itemCount === 0}>
                  Clear cart
                </Button>
              </div>

              <div className="pref-row">
                <div>
                  <p className="pref-row__title">Favourites</p>
                  <p className="pref-row__desc">{favouriteCount} saved restaurants.</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    clearFavourites();
                    toast.info('Favourites cleared.');
                  }}
                  disabled={favouriteCount === 0}
                >
                  Clear favourites
                </Button>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <AddressForm
        open={addressOpen}
        initial={editingAddress}
        saving={savingAddress}
        onClose={() => {
          setAddressOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
      />

      <ConfirmDialog
        open={Boolean(deletingAddress)}
        title="Delete this address?"
        message={`${deletingAddress?.label || ''} — ${deletingAddress?.line1 || ''}. You can add it again later.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDeleteAddress}
        onCancel={() => setDeletingAddress(null)}
      />
    </div>
  );
};

export default Profile;
