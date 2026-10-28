import { useEffect, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input, { Select } from './Input';
import { AREAS } from '../../data/catalog';
import { normalizePhone, pincode, phone, required, validateForm } from '../../lib/validation';

const EMPTY = {
  label: 'Home',
  line1: '',
  line2: '',
  area: '',
  city: 'Chennai',
  pincode: '',
  phone: '',
  isDefault: false,
};

const LABELS = ['Home', 'Work', 'Other'];

const AddressForm = ({ open, initial = null, saving = false, onClose, onSave }) => {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setValues({ ...EMPTY, ...(initial || {}) });
    setErrors({});
  }, [open, initial]);

  const setField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = (event) => {
    event.preventDefault();
    const found = validateForm(values, {
      line1: [required('Address line 1')],
      area: [required('Area')],
      pincode: [pincode],
      phone: [phone],
    });
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    onSave({ ...values, phone: normalizePhone(values.phone), city: values.city || 'Chennai' });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? 'Edit address' : 'Add a delivery address'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            Save address
          </Button>
        </>
      }
    >
      <form className="address-form" onSubmit={submit}>
        <div className="address-form__labels">
          {LABELS.map((label) => (
            <button
              key={label}
              type="button"
              className={`chip ${values.label === label ? 'is-active' : ''}`}
              onClick={() => setValues((current) => ({ ...current, label }))}
            >
              {label}
            </button>
          ))}
        </div>

        <Input
          label="Flat / house no, building, street"
          value={values.line1}
          onChange={setField('line1')}
          error={errors.line1}
          placeholder="12/4, Second Main Road"
          required
        />
        <Input
          label="Landmark (optional)"
          value={values.line2}
          onChange={setField('line2')}
          placeholder="Near Anna Nagar Tower Park"
        />

        <div className="address-form__row">
          <Select
            label="Area"
            value={values.area}
            onChange={setField('area')}
            error={errors.area}
            placeholder="Select area"
            options={AREAS}
            required
          />
          <Input
            label="Pincode"
            value={values.pincode}
            onChange={setField('pincode')}
            error={errors.pincode}
            inputMode="numeric"
            maxLength={6}
            placeholder="600040"
            required
          />
        </div>

        <div className="address-form__row">
          <Input
            label="City"
            value={values.city}
            onChange={setField('city')}
            disabled
            hint="We deliver inside Chennai only for now."
          />
          <Input
            label="Contact number"
            value={values.phone}
            onChange={setField('phone')}
            error={errors.phone}
            inputMode="tel"
            placeholder="98765 43210"
            required
          />
        </div>

        <label className="checkbox">
          <input type="checkbox" checked={values.isDefault} onChange={setField('isDefault')} />
          <span>Make this my default address</span>
        </label>
      </form>
    </Modal>
  );
};

export default AddressForm;
