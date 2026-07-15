import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import SkillChip from '../components/SkillChip';
import Card from '../components/Card';
import Button from '../components/Button';

function Results() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/analysis/${id}`);
        setAnalysis(res.data);

        // Check prefers-reduced-motion media query
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
          setAnimate(true);
        } else {
          // Trigger Venn shape slide-in transition after data is loaded
          setTimeout(() => {
            setAnimate(true);
          }, 100);
        }
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError(err.response?.data?.message || (err.request ? 'Connection to server failed. Please check your internet connection.' : 'Failed to fetch match results.'));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
        <header className="nav-header">
          <Link to="/" className="nav-logo">Resonance</Link>
          <nav className="nav-links">
            <Link to="/" className="nav-link">Compare</Link>
            <Link to="/history" className="nav-link">History</Link>
            <button onClick={handleLogout} className="nav-link bg-transparent border-none cursor-pointer p-0">Sign Out</button>
          </nav>
        </header>
        <main className="layout-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Spinner size="lg" />
            <p className="label-caps" style={{ opacity: 0.6 }}>Decompressing signal frequencies...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
        <header className="nav-header">
          <Link to="/" className="nav-logo">Resonance</Link>
        </header>
        <main className="layout-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <EmptyState
              message={error || 'The requested analysis session could not be retrieved.'}
              actionLabel="Compare New Signals"
              onAction={() => navigate('/')}
            />
          </div>
        </main>
      </div>
    );
  }

  const { matchPercentage, verdict, reasons, matchedSkills, missingSkills } = analysis;

  // Determine Badge styling based on verdict contents
  const getBadgeStyle = (verdictStr = '') => {
    const v = verdictStr.toLowerCase();
    if (v.includes('qualified')) {
      return {
        bg: 'var(--color-moss-subtle)',
        border: 'var(--color-moss-border)',
        color: 'var(--color-moss)'
      };
    } else if (v.includes('almost there') || v.includes('almost')) {
      return {
        bg: 'var(--color-gold-subtle)',
        border: 'var(--color-gold-border)',
        color: 'var(--color-gold)'
      };
    } else {
      // Default to Not Yet (clay)
      return {
        bg: 'var(--color-clay-subtle)',
        border: 'var(--color-clay-border)',
        color: 'var(--color-clay)'
      };
    }
  };

  const badgeStyle = getBadgeStyle(verdict);
  const finalReasons = (reasons || []).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      {/* Navigation */}
      <header className="nav-header">
        <Link to="/" className="nav-logo">Resonance</Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Compare</Link>
          <Link to="/history" className="nav-link">History</Link>
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

      {/* Main Results Dashboard */}
      <main className="layout-container fade-in-slide" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Page title and date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-mist)', paddingBottom: '1rem' }}>
          <div>
            <span className="label-caps">[ COMPARISON RUN ]</span>
            <h2 style={{ marginTop: '0.25rem' }}>Signal Calibration Report</h2>
          </div>
          <span className="text-data" style={{ fontSize: '0.85rem', opacity: 0.6 }}>
            {new Date(analysis.createdAt).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* HERO SECTION: Overlapping Venn Dual-Shape */}
        <Card style={{ padding: '2rem' }}>
          <div className="grid-cols-2" style={{ alignItems: 'center' }}>
            {/* Left side text explanation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span className="label-caps" style={{ opacity: 0.6 }}>Overlap Quotient</span>
                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '0.5rem' }}>
                  <span className="text-data" style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: 1, color: 'var(--color-ink)' }}>
                    {matchPercentage}
                  </span>
                  <span className="text-data" style={{ fontSize: '2rem', color: 'var(--color-moss)', fontWeight: '500', marginLeft: '0.25rem' }}>
                    %
                  </span>
                </div>
              </div>
              
              <p style={{ fontSize: '0.95rem', opacity: 0.7, margin: 0, lineHeight: '1.6' }}>
                The overlap coefficient indicates how well your candidate credentials resonate with the core requirements of this role.
              </p>
            </div>

            {/* Right side Venn diagram visual */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '320px', height: '220px' }}>
                <svg viewBox="0 0 320 220" style={{ width: '100%', height: '100%' }}>
                  {/* Left Circle (Resume - Moss) */}
                  <circle
                    cx={animate ? 130 : 90}
                    cy={110}
                    r={70}
                    fill="rgba(74, 107, 79, 0.12)"
                    stroke="var(--color-moss)"
                    strokeWidth="2"
                    style={{
                      transition: 'cx 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  />
                  {/* Right Circle (JD - Clay) */}
                  <circle
                    cx={animate ? 190 : 230}
                    cy={110}
                    r={70}
                    fill="rgba(181, 85, 46, 0.12)"
                    stroke="var(--color-clay)"
                    strokeWidth="2"
                    style={{
                      transition: 'cx 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  />
                  {/* Resume Label */}
                  <text
                    x={animate ? 100 : 70}
                    y={114}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      fill: 'var(--color-moss)',
                      opacity: 0.7,
                      letterSpacing: '0.08em',
                      textAnchor: 'middle',
                      transition: 'x 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    RESUME
                  </text>
                  {/* JD Label */}
                  <text
                    x={animate ? 220 : 250}
                    y={114}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      fill: 'var(--color-clay)',
                      opacity: 0.7,
                      letterSpacing: '0.08em',
                      textAnchor: 'middle',
                      transition: 'x 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    JD
                  </text>
                </svg>
                
                {/* Score centered in the overlap */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <span
                    className="text-data"
                    style={{
                      fontSize: '2.25rem',
                      fontWeight: '800',
                      color: 'var(--color-ink)',
                      lineHeight: 1,
                      textShadow: '0 2px 4px rgba(250,248,243,0.9)'
                    }}
                  >
                    {matchPercentage}%
                  </span>
                  <span
                    className="label-caps"
                    style={{
                      fontSize: '0.5rem',
                      opacity: 0.5,
                      marginTop: '0.15rem',
                      letterSpacing: '0.1em'
                    }}
                  >
                    Overlap
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* VERDICT SECTION */}
        <Card className="grid-cols-2" style={{ alignItems: 'start', padding: '2.5rem 2rem' }}>
          {/* Left panel: Verdict Title and Pill */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.25rem' }}>
            <div>
              <span className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.6 }}>
                Alignment Verdict
              </span>
              <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: '600', color: 'var(--color-ink)', margin: 0 }}>
                {verdict}
              </h3>
            </div>
            
            <span
              className="text-data"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.4rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: `1px solid ${badgeStyle.border}`,
                backgroundColor: badgeStyle.bg,
                color: badgeStyle.color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {verdict}
            </span>
            
            <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: 0, lineHeight: '1.5' }}>
              AI analysis of qualitative skills suggests the overall frequency alignment of your resume matches the role's current demand stage.
            </p>
          </div>

          {/* Right panel: Bulleted reasons list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <span className="label-caps" style={{ opacity: 0.6 }}>Alignment Rationale</span>
            <ul style={{ 
              listStyleType: 'none', 
              paddingLeft: 0, 
              margin: 0,
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              lineHeight: '1.5'
            }}>
              {finalReasons.map((reason, index) => (
                <li key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ 
                    color: badgeStyle.color, 
                    marginTop: '0.55rem', 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: badgeStyle.color,
                    flexShrink: 0
                  }} />
                  <span style={{ opacity: 0.85 }}>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* SKILLS DETAILED BREAKDOWN */}
        <div className="grid-cols-2">
          {/* Matched Skills Card */}
          <Card>
            <div style={{ borderBottom: '1px solid var(--color-mist)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label-caps" style={{ color: 'var(--color-moss)' }}>Matched Frequencies</span>
              <span className="text-data" style={{ fontSize: '0.8rem', color: 'var(--color-moss)', fontWeight: '600' }}>
                [{matchedSkills?.length || 0}]
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {matchedSkills && matchedSkills.length > 0 ? (
                matchedSkills.map((skill, index) => (
                  <SkillChip key={index} label={skill} variant="matched" />
                ))
              ) : (
                <p style={{ fontStyle: 'italic', opacity: 0.5, fontSize: '0.9rem', color: 'var(--color-ink)' }}>
                  No direct overlapping skills detected.
                </p>
              )}
            </div>
          </Card>

          {/* Missing Skills Card */}
          <Card>
            <div style={{ borderBottom: '1px solid var(--color-mist)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label-caps" style={{ color: 'var(--color-clay)' }}>Unresolved Frequencies</span>
              <span className="text-data" style={{ fontSize: '0.8rem', color: 'var(--color-clay)', fontWeight: '600' }}>
                [{missingSkills?.length || 0}]
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {missingSkills && missingSkills.length > 0 ? (
                missingSkills.map((skill, index) => (
                  <SkillChip key={index} label={skill} variant="missing" />
                ))
              ) : (
                <p style={{ fontStyle: 'italic', opacity: 0.7, fontSize: '0.9rem', color: 'var(--color-moss)', fontWeight: '500' }}>
                  No missing skills — full match!
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            style={{ minWidth: '180px' }}
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/history')}
            variant="secondary"
            style={{ minWidth: '180px' }}
          >
            View History
          </Button>
        </div>

      </main>
    </div>
  );
}

export default Results;