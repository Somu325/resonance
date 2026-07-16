import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthBackground from '../components/AuthBackground';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const GitHubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
  >
    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.887H12.24z" />
  </svg>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      console.error('Signup error:', err);
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
            <p className="label-caps">Create your account</p>
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

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-mist)' }}></div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-mist)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={() => window.location.href = `${API_URL}/auth/github`}
              style={{ flex: 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <GitHubIcon />
                <span>GitHub</span>
              </div>
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.href = `${API_URL}/auth/google`}
              style={{ flex: 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <GoogleIcon />
                <span>Google</span>
              </div>
            </Button>
          </div>

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