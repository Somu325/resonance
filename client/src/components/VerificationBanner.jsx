import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from './Button';

export default function VerificationBanner() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-verification');
      showToast('Verification email sent successfully!', 'success');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to resend verification email.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor: 'var(--color-mist)', 
        color: 'var(--color-ink)', 
        borderLeft: '4px solid var(--color-gold)', 
        padding: '1rem 1.5rem', 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        lineHeight: '1.4'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-gold)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Please verify your email to run analyses.</span>
      </div>
      <Button 
        variant="secondary" 
        onClick={handleResend} 
        disabled={loading}
        style={{ 
          padding: '0.4rem 1rem', 
          fontSize: '0.8rem',
          minWidth: 'auto',
          backgroundColor: 'var(--color-paper)',
          borderColor: 'var(--color-gold-border)'
        }}
      >
        {loading ? 'Sending...' : 'Resend Email'}
      </Button>
    </div>
  );
}
