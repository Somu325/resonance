import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthBackground from '../components/AuthBackground';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const validate = () => {
    let isValid = true;
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    } else {
      setEmailError('');
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.message || (err.request ? 'Connection to server failed. Please check your internet connection.' : 'Login failed. Please check your credentials.');
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <div className="fade-in-slide" style={{ width: '100%', maxWidth: '400px' }}>
        <Card style={{ padding: '2.5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
              Resonance
            </h1>
            <p className="label-caps">[ Resume Signal Matcher ]</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              required
              placeholder="name@company.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              loading={submitting}
              variant="primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Sign In
            </Button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--color-mist)', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              New to Resonance?{' '}
              <Link 
                to="/signup" 
                className="nav-link"
                style={{ display: 'inline', textDecoration: 'underline', opacity: 1, fontWeight: '600' }}
              >
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </AuthBackground>
  );
}

export default Login;