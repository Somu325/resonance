import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      {/* Simple Header */}
      <header className="nav-header">
        <span className="nav-logo">Resonance</span>
      </header>

      {/* Main Container */}
      <main className="layout-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <EmptyState
            message="The page you are looking for does not exist or has been moved."
            actionLabel="Back to Dashboard"
            onAction={() => navigate('/')}
          />
        </div>
      </main>
    </div>
  );
}
export { NotFound };
