import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Settings() {
  const { user, logout, checkAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Change Email states
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Delete Account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      showToast('Please enter a new email address.', 'error');
      return;
    }

    setEmailLoading(true);
    try {
      await api.post('/auth/change-email', {
        newEmail,
        currentPassword: user.hasPassword ? currentPassword : undefined
      });
      showToast('Email updated — check your inbox to verify', 'success');
      await checkAuth();
      setNewEmail('');
      setCurrentPassword('');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to update email.';
      showToast(errMsg, 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    try {
      await api.delete('/auth/account', {
        data: {
          currentPassword: user.hasPassword ? deletePassword : undefined
        }
      });
      await logout();
      showToast('Account deleted', 'success');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to delete account.';
      showToast(errMsg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      {/* Navigation */}
      <header className="nav-header">
        <Link to="/" className="nav-logo">Resonance</Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Compare</Link>
          <Link to="/history" className="nav-link">History</Link>
          <Link to="/settings" className="nav-link active">Settings</Link>
          <button 
            onClick={handleLogout} 
            className="nav-link" 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontFamily: 'inherit',
              padding: 0
            }}
          >
            Sign Out
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="layout-container fade-in-slide" style={{ flex: 1, maxWidth: '640px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <span className="label-caps">[ Configuration ]</span>
          <h2 style={{ marginTop: '0.25rem' }}>Account Settings</h2>
        </div>

        {/* Change Email Card */}
        <Card>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Change Email Address</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="label-caps" style={{ display: 'block', marginBottom: '0.25rem', opacity: 0.6 }}>Current Email</span>
            <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--color-ink)' }}>{user?.email}</span>
          </div>

          <form onSubmit={handleChangeEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="New Email Address"
              type="email"
              placeholder="e.g. name@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />

            {user?.hasPassword && (
              <Input
                label="Confirm with Password"
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            )}

            <Button type="submit" loading={emailLoading} loadingText="Updating..." style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
              Update Email
            </Button>
          </form>
        </Card>

        {/* Delete Account Card */}
        <Card style={{ borderColor: 'var(--color-clay-border)', backgroundColor: 'var(--color-clay-subtle)' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-clay)' }}>
            Delete Account
          </h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Once you delete your account, all of your saved resume comparison results and history will be permanently deleted. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account...
            </Button>
          ) : (
            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px dashed var(--color-clay-border)', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-clay)', margin: 0 }}>
                Are you absolutely sure? Please confirm your password below to proceed.
              </p>

              {user?.hasPassword ? (
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password to confirm deletion"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              ) : (
                <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: 0 }}>
                  Since you logged in with Google/GitHub, no password is required.
                </p>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <Button variant="danger" type="submit" loading={deleteLoading} loadingText="Deleting...">
                  Permanently Delete My Account
                </Button>
                <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}
