import Button from './Button';

export default function EmptyState({
  message,
  actionLabel,
  onAction,
  className = '',
  ...props
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2.5rem 2rem',
        border: '1px dashed var(--color-mist)',
        borderRadius: '12px',
        backgroundColor: 'rgba(250, 248, 243, 0.5)',
      }}
      {...props}
    >
      <div style={{ color: 'var(--color-moss)', marginBottom: '0.75rem' }}>
        <svg style={{ width: '2.5rem', height: '2.5rem', opacity: 0.7, margin: '0 auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p 
        className="font-body" 
        style={{ 
          fontSize: '0.9rem', 
          color: 'var(--color-ink)', 
          opacity: 0.7, 
          maxWidth: '380px', 
          marginBottom: '1.5rem', 
          lineHeight: '1.5' 
        }}
      >
        {message}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
