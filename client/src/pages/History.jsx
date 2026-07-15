import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/analysis');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError(err.response?.data?.message || (err.request ? 'Connection to server failed. Please check your internet connection.' : 'Failed to fetch match history.'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 70) return 'var(--color-moss)';
    if (pct >= 40) return 'var(--color-gold)';
    return 'var(--color-clay)';
  };

  const getBadgeStyle = (verdictStr = '') => {
    const v = verdictStr.toLowerCase();
    if (v.includes('qualified')) {
      return {
        bg: 'var(--color-moss-subtle)',
        border: 'var(--color-moss-border)',
        color: 'var(--color-moss)',
      };
    } else if (v.includes('almost there') || v.includes('almost')) {
      return {
        bg: 'var(--color-gold-subtle)',
        border: 'var(--color-gold-border)',
        color: 'var(--color-gold)',
      };
    } else {
      return {
        bg: 'var(--color-clay-subtle)',
        border: 'var(--color-clay-border)',
        color: 'var(--color-clay)',
      };
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      {/* Navigation */}
      <header className="nav-header">
        <Link to="/" className="nav-logo">
          Resonance
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Compare
          </Link>
          <Link to="/history" className="nav-link active">
            History
          </Link>
          <Link to="/settings" className="nav-link">
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="nav-link"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
            }}
          >
            Sign Out
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="layout-container fade-in-slide" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Title and stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderBottom: '1px solid var(--color-mist)',
            paddingBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span className="label-caps">History</span>
            <h2 style={{ marginTop: '0.25rem' }}>Past Comparisons</h2>
          </div>
          <span className="text-data" style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Total Comparisons: {history.length}
          </span>
        </div>

        {error && (
          <div style={{ width: '100%' }}>
            <EmptyState
              message={error}
              actionLabel="Try Re-loading"
              onAction={() => window.location.reload()}
            />
          </div>
        )}

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Spinner size="lg" />
              <p className="label-caps" style={{ opacity: 0.6 }}>Loading...</p>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div style={{ width: '100%', marginTop: '2rem' }}>
            <EmptyState
              message="No analyses yet"
              actionLabel="Run your first analysis"
              onAction={() => navigate('/')}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {history.map((item) => {
              const badgeStyle = getBadgeStyle(item.verdict);
              const percentColor = getPercentageColor(item.matchPercentage);

              return (
                <Card
                  key={item._id}
                  hover
                  onClick={() => navigate(`/results/${item._id}`)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 2rem',
                    gap: '2rem',
                    cursor: 'pointer',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Left side: Date and unique preview metadata */}
                  <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span
                        className="text-data"
                        style={{
                          fontSize: '0.825rem',
                          color: 'var(--color-ink)',
                          opacity: 0.6,
                          fontWeight: '500',
                        }}
                      >
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span style={{ height: '3px', width: '3px', borderRadius: '50%', backgroundColor: 'var(--color-mist)' }} />
                      <span className="text-data" style={{ fontSize: '0.8rem', opacity: 0.4 }}>
                        ID: {item._id.substring(item._id.length - 8)}
                      </span>
                    </div>

                    {/* Mini chip summary of matched items */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {item.matchedSkills.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="chip chip-match"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', height: 'auto' }}
                        >
                          {s}
                        </span>
                      ))}
                      {item.missingSkills.slice(0, 2).map((s, idx) => (
                        <span
                          key={idx}
                          className="chip chip-missing"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', height: 'auto' }}
                        >
                          {s}
                        </span>
                      ))}
                      {item.matchedSkills.length + item.missingSkills.length > 5 && (
                        <span className="text-data" style={{ fontSize: '0.7rem', opacity: 0.5, alignSelf: 'center', marginLeft: '0.25rem' }}>
                          +{item.matchedSkills.length + item.missingSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side: Score bar & Verdict Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Score Bar Visual */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '120px' }}>
                      <div
                        style={{
                          height: '6px',
                          width: '60px',
                          backgroundColor: 'var(--color-mist)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${item.matchPercentage}%`,
                            backgroundColor: percentColor,
                          }}
                        />
                      </div>
                      <span className="text-data" style={{ fontSize: '0.9rem', fontWeight: '700', color: percentColor }}>
                        {item.matchPercentage}%
                      </span>
                    </div>

                    {/* Colored Verdict Badge */}
                    <span
                      className="text-data"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.3rem 0.7rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '4px',
                        border: `1px solid ${badgeStyle.border}`,
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        justifyContent: 'center',
                      }}
                    >
                      {item.verdict}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default History;