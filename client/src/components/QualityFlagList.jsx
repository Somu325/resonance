import React from 'react';

export default function QualityFlagList({ flags = [] }) {
  if (!flags || flags.length === 0) {
    return (
      <div 
        style={{
          padding: '1.25rem',
          borderRadius: '8px',
          backgroundColor: 'var(--color-moss-subtle)',
          border: '1px solid var(--color-moss-border)',
          color: 'var(--color-moss)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>✓</span>
        <span>No issues flagged. Resonance alignment is structurally sound.</span>
      </div>
    );
  }

  const getSeverityStyle = (severity = '') => {
    const sev = severity.toLowerCase();
    if (sev === 'high') {
      return {
        bg: 'var(--color-clay-subtle)',
        border: 'var(--color-clay-border)',
        color: 'var(--color-clay)',
        labelBg: 'var(--color-clay)',
        labelColor: 'var(--color-paper)',
      };
    } else if (sev === 'medium') {
      return {
        bg: 'var(--color-gold-subtle)',
        border: 'var(--color-gold-border)',
        color: 'var(--color-gold)',
        labelBg: 'var(--color-gold)',
        labelColor: 'var(--color-paper)',
      };
    } else {
      // low / default
      return {
        bg: 'rgba(228, 225, 214, 0.25)',
        border: 'var(--color-mist)',
        color: 'var(--color-ink)',
        labelBg: 'var(--color-mist)',
        labelColor: 'var(--color-ink)',
      };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {flags.map((flag, idx) => {
        const style = getSeverityStyle(flag.severity);
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${style.border}`,
              backgroundColor: style.bg,
              color: style.color,
              fontFamily: 'var(--font-body)',
              fontSize: '0.925rem',
              lineHeight: '1.4',
            }}
          >
            <span
              className="text-data"
              style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
                backgroundColor: style.labelBg,
                color: style.labelColor,
                letterSpacing: '0.05em',
                flexShrink: 0,
                marginTop: '0.1rem',
              }}
            >
              {flag.severity || 'low'}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span 
                className="label-caps" 
                style={{ 
                  fontSize: '0.65rem', 
                  opacity: 0.6, 
                  letterSpacing: '0.1em',
                  color: 'inherit',
                }}
              >
                Section: {flag.section}
              </span>
              <span style={{ fontWeight: '500' }}>{flag.issue}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
