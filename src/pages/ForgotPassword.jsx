import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../lib/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { email as emailValidator, required, validateForm } from '../lib/validation';

const ForgotPassword = () => {
  useDocumentTitle('Reset password');
  const [values, setValues] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const found = validateForm(values, { email: [required('Email'), emailValidator] });
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setLoading(true);
    try {
      const response = await api.forgotPassword({ email: values.email.trim() });
      setMessage(response.message);
    } catch (error) {
      setErrors({ email: error.message || 'Could not send the reset link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth auth--single">
      <div className="auth__panel">
        <Link to="/" className="auth__brand">
          <img src="/images/myfoodlogo.png" alt="" />
          <span>MyFood</span>
        </Link>

        <h1 className="auth__title">Reset your password</h1>
        <p className="auth__sub">
          Enter the email on your account and we will send a reset link.
        </p>

        {message ? (
          <div className="auth__success" role="status">
            <Icon name="checkCircle" size={16} />
            <p>{message}</p>
          </div>
        ) : (
          <form className="auth__form" onSubmit={submit} noValidate>
            <Input
              label="Email address"
              type="email"
              value={values.email}
              onChange={(event) => {
                setValues({ email: event.target.value });
                setErrors({});
              }}
              error={errors.email}
              placeholder="you@example.com"
              required
            />
            <Button type="submit" block size="lg" loading={loading}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="auth__switch">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
