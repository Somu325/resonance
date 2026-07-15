import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [status, setStatus] = useState('pending'); // 'pending' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        await checkAuth();
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link might be invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'var(--color-paper)',
        padding: '1.5rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {status === 'pending' && (
          <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <Spinner size="lg" />
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Calibrating credentials</h3>
                <p style={{ opacity: 0.7, fontSize: '0.95rem' }}>Verifying your email signal signature...</p>
              </div>
            </div>
          </Card>
        )}

        {status === 'success' && (
          <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ color: 'var(--color-moss)' }}>
                <svg style={{ width: '3.5rem', height: '3.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-ink)' }}>Email Verified</h3>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Your account is fully verified. You are ready to analyze and compare resume credentials.
                </p>
                <Button variant="primary" onClick={() => navigate('/')} style={{ width: '100%' }}>
                  Proceed to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        )}

        {status === 'error' && (
          <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ color: 'var(--color-clay)' }}>
                <svg style={{ width: '3.5rem', height: '3.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-ink)' }}>Verification Failed</h3>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  {message}
                </p>
                <Button variant="primary" onClick={() => navigate('/')} style={{ width: '100%' }}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
