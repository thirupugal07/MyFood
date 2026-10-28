import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  email as emailValidator,
  phone as phoneValidator,
  required,
  validateForm,
} from '../lib/validation';

const Signup = () => {
  useDocumentTitle('Create account');
  const navigate = useNavigate();
  const toast = useToast();
  const { signup } = useAuth();

  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const setField = (field) => (event) => {
    setValues({ ...values, [field]: event.target.value });
    setErrors({ ...errors, [field]: undefined });
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validateForm(values, {
      name: [required('Name')],
      email: [required('Email'), emailValidator],
      phone: [required('Mobile number'), phoneValidator],
      password: [(value) => (String(value).length >= 8 ? null : 'Use at least 8 characters')],
    });
    if (values.password !== values.confirm) found.confirm = 'Passwords do not match';
    if (!accepted) found.terms = 'Please accept the terms to continue';

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setLoading(true);
    setFormError('');
    try {
      const user = await signup({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone,
        password: values.password,
      });
      toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(error.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <Link to="/" className="auth__brand">
          <img src="/images/myfoodlogo.png" alt="" />
          <span>MyFood</span>
        </Link>

        <h1 className="auth__title">Create your account</h1>
        <p className="auth__sub">It takes 30 seconds. Your cart and favourites carry over.</p>

        {formError ? (
          <div className="auth__alert" role="alert">
            <Icon name="alert" size={14} /> {formError}
          </div>
        ) : null}

        <form className="auth__form" onSubmit={submit} noValidate>
          <Input label="Full name" value={values.name} onChange={setField('name')} error={errors.name} placeholder="Thirupugal S" required />
          <Input label="Email address" type="email" autoComplete="email" value={values.email} onChange={setField('email')} error={errors.email} placeholder="you@example.com" required />
          <Input label="Mobile number" inputMode="tel" value={values.phone} onChange={setField('phone')} error={errors.phone} placeholder="98765 43210" required />
          <Input label="Password" type="password" autoComplete="new-password" value={values.password} onChange={setField('password')} error={errors.password} hint="At least 8 characters." required />
          <Input label="Confirm password" type="password" autoComplete="new-password" value={values.confirm} onChange={setField('confirm')} error={errors.confirm} required />

          <label className="checkbox checkbox--sm">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => {
                setAccepted(event.target.checked);
                setErrors({ ...errors, terms: undefined });
              }}
            />
            <span>
              I agree to the <a href="#top">terms of service</a> and <a href="#top">privacy policy</a>.
            </span>
          </label>
          {errors.terms ? <p className="field__error">{errors.terms}</p> : null}

          <Button type="submit" block size="lg" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="auth__switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <aside className="auth__aside">
        <div className="auth__aside-content">
          <h2>Why join MyFood?</h2>
          <ul>
            <li>
              <Icon name="checkCircle" size={15} /> Save addresses for one-tap checkout
            </li>
            <li>
              <Icon name="checkCircle" size={15} /> Track every order in real time
            </li>
            <li>
              <Icon name="checkCircle" size={15} /> Exclusive coupons for members
            </li>
            <li>
              <Icon name="checkCircle" size={15} /> Reorder past meals in one tap
            </li>
          </ul>
          <img src="/images/offer/1684849019473.webp" alt="" className="auth__aside-img" />
        </div>
      </aside>
    </div>
  );
};

export default Signup;
