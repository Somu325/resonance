import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthBackground from '../components/AuthBackground';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
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

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      await signup(email, password);
      showToast('Account created successfully!', 'success');
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.message || (err.request ? 'Connection to server failed. Please check your internet connection.' : 'Registration failed. Please try again.');
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
            <p className="label-caps">[ Create Signal Profile ]</p>
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              error={confirmPasswordError}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              loading={submitting}
              variant="primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Register
            </Button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--color-mist)', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Already registered?{' '}
              <Link 
                to="/login" 
                className="nav-link"
                style={{ display: 'inline', textDecoration: 'underline', opacity: 1, fontWeight: '600' }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </AuthBackground>
  );
}

export default Signup;