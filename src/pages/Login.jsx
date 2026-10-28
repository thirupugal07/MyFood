import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { email as emailValidator, required, validateForm } from '../lib/validation';

const DEMO = { email: 'demo@myfood.app', password: 'demo1234' };

const Login = () => {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { login } = useAuth();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('next') || location.state?.from || '/';

  const submit = async (event) => {
    event.preventDefault();
    const found = validateForm(values, { email: [required('Email'), emailValidator], password: [required('Password')] });
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setLoading(true);
    setFormError('');
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Could not sign you in.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setValues(DEMO);
    setErrors({});
    setFormError('');
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <Link to="/" className="auth__brand">
          <img src="/images/myfoodlogo.png" alt="" />
          <span>MyFood</span>
        </Link>

        <h1 className="auth__title">Welcome back</h1>
        <p className="auth__sub">Sign in to track orders, save favourites and check out faster.</p>

        {formError ? (
          <div className="auth__alert" role="alert">
            <Icon name="alert" size={14} /> {formError}
          </div>
        ) : null}

        <form className="auth__form" onSubmit={submit} noValidate>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => {
              setValues({ ...values, email: event.target.value });
              setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => {
              setValues({ ...values, password: event.target.value });
              setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            placeholder="••••••••"
            required
          />

          <div className="auth__row">
            <label className="checkbox checkbox--sm">
              <input type="checkbox" defaultChecked />
              <span>Keep me signed in</span>
            </label>
            <Link to="/forgot-password" className="auth__link">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" block size="lg" loading={loading}>
            Sign in
          </Button>
        </form>

        <div className="auth__demo">
          <div>
            <p className="auth__demo-title">
              <Icon name="sparkles" size={13} /> Try the demo account
            </p>
            <p className="auth__demo-creds">
              {DEMO.email} · {DEMO.password}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={fillDemo}>
            Use demo
          </Button>
        </div>

        <p className="auth__switch">
          New to MyFood? <Link to="/signup">Create an account</Link>
        </p>
      </div>

      <aside className="auth__aside">
        <div className="auth__aside-content">
          <h2>Good food, delivered fast.</h2>
          <ul>
            <li>
              <Icon name="checkCircle" size={15} /> 21 restaurants across Chennai
            </li>
            <li>
              <Icon name="checkCircle" size={15} /> Live order tracking, step by step
            </li>
            <li>
              <Icon name="checkCircle" size={15} /> Free delivery above ₹149
            </li>
            <li>
              <Icon name="checkCircle" size={15} /> UPI, cards or cash on delivery
            </li>
          </ul>
          <img src="/images/offer/1684849019450.webp" alt="" className="auth__aside-img" />
        </div>
      </aside>
    </div>
  );
};

export default Login;
