import React from 'react';

/**
 * AuthBackground component providing a light, tactile paper background
 * with a subtle grid watermark and geometric wave accents.
 */
function AuthBackground({ children }) {
  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-paper)',
        padding: '2rem 1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background grid pattern */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.04,
          pointerEvents: 'none',
          backgroundImage: `
            radial-gradient(var(--color-ink) 1.5px, transparent 1.5px),
            linear-gradient(to right, var(--color-ink) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-ink) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 144px 144px, 144px 144px',
        }}
      />
      
      {/* Editorial signal elements */}
      <svg 
        style={{
          position: 'absolute',
          bottom: '-40px',
          left: '-40px',
          width: '320px',
          height: '320px',
          color: 'var(--color-moss)',
          opacity: 0.08,
          pointerEvents: 'none'
        }}
        viewBox="0 0 100 100"
      >
        <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M0,62 Q25,32 50,62 T100,62" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      
      <svg 
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '320px',
          height: '320px',
          color: 'var(--color-clay)',
          opacity: 0.06,
          pointerEvents: 'none'
        }}
        viewBox="0 0 100 100"
      >
        <path d="M0,45 Q25,75 50,45 T100,45" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

export default AuthBackground;