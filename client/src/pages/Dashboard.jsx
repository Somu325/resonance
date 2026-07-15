import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from '../components/Button';
import FileOrTextInput from '../components/FileOrTextInput';

function Dashboard() {
  const [resumeText, setResumeText] = useState('');
  const [resumeSource, setResumeSource] = useState('paste'); // 'paste' | 'pdf' | 'docx'
  const [jdText, setJdText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!resumeText.trim() || !jdText.trim()) {
      showToast('Please provide both a resume and a job description.', 'error');
      return;
    }

    setAnalyzing(true);

    try {
      const response = await api.post('/analysis', {
        resumeText,
        jdText,
        resumeSource,
      });

      if (response.data && response.data._id) {
        navigate(`/results/${response.data._id}`);
      } else {
        throw new Error('Analysis completed but did not return a valid ID');
      }
    } catch (error) {
      console.error('Analysis submission failed:', error);
      const errMsg = error.response?.data?.message || (error.request ? 'Connection to server failed. Please check your internet connection.' : 'AI service is temporarily unavailable, please try again');
      showToast(errMsg, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      {/* Editorial Navigation */}
      <header className="nav-header">
        <Link to="/" className="nav-logo">
          Resonance
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link active">
            Compare
          </Link>
          <Link to="/history" className="nav-link">
            History
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

      {/* Main Working Area */}
      <main className="layout-container fade-in-slide" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <span className="label-caps" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>Signal Matching</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Align Your Frequencies
          </h2>
          <p style={{ opacity: 0.7, maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
            Paste or upload your resume and the target job description to compute alignment,
            view match metrics, and extract professional resonance.
          </p>
        </div>

        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Two-column Input Grid (stacked on mobile, side-by-side on desktop via index.css) */}
          <div className="grid-cols-2">
            {/* Resume Input Column */}
            <FileOrTextInput
              label="Source Resume"
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setResumeSource('paste');
              }}
              onTextExtracted={(text, source) => {
                setResumeText(text);
                setResumeSource(source);
              }}
              placeholder="Paste your professional experience, education, and skills here..."
              required
              maxLength={20000}
              id="resume-textarea"
              rows={12}
            />

            {/* Job Description Input Column */}
            <FileOrTextInput
              label="Target Job Description"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              onTextExtracted={(text) => setJdText(text)}
              placeholder="Paste the full job post requirements, responsibilities, and qualifications..."
              required
              maxLength={20000}
              id="jd-textarea"
              rows={12}
            />
          </div>

          {/* Action Trigger */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem', gap: '1rem' }}>
            <Button
              type="submit"
              loading={analyzing}
              disabled={!resumeText.trim() || !jdText.trim()}
              style={{ padding: '1rem 3rem', fontSize: '1.05rem', minWidth: '280px' }}
            >
              Analyze Alignment
            </Button>
            <p className="label-caps" style={{ fontSize: '0.65rem', opacity: 0.5 }}>
              Powered by Advanced Natural Language Processing
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Dashboard;