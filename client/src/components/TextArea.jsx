export default function TextArea({
  label,
  value = '',
  onChange,
  error,
  placeholder,
  required = false,
  maxLength,
  className = '',
  id,
  rows = 5,
  style,
  ...props
}) {
  const inputId = id || `textarea-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  const charCount = value?.length || 0;
  const isNearLimit = maxLength && (maxLength - charCount) <= 100;

  return (
    <div 
      className={`flex flex-col w-full ${className}`} 
      style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="font-body text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink)] opacity-80"
          style={{ display: 'block', marginBottom: '0.5rem' }}
        >
          {label}
          {required && <span className="text-[var(--color-clay)] ml-0.5" style={{ color: 'var(--color-clay)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <textarea
          id={inputId}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          rows={rows}
          className={`w-full px-4 py-3 font-body text-sm bg-[var(--color-paper)] text-[var(--color-ink)] border rounded-lg transition-all duration-250 focus:outline-none focus:bg-white resize-vertical`}
          style={{ flex: 1, width: '100%', height: '100%', minHeight: '120px' }}
          {...props}
        />
        {!value && placeholder && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '16px',
              right: '16px',
              pointerEvents: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'var(--color-ink)',
              opacity: 0.4,
              lineHeight: '1.4',
            }}
          >
            {placeholder}
          </div>
        )}
      </div>
      <div 
        className="flex justify-between items-start"
        style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}
      >
        <div className="flex-1" style={{ flex: 1, marginRight: '1rem' }}>
          {error && (
            <p className="font-mono text-[11px] text-[var(--color-clay)]" style={{ color: 'var(--color-clay)' }}>
              {error}
            </p>
          )}
        </div>
        {maxLength && (
          <span
            className={`font-mono text-[10px] whitespace-nowrap self-start ${
              isNearLimit 
                ? 'text-[var(--color-clay)] font-semibold' 
                : 'text-[var(--color-ink)] opacity-50'
            }`}
          >
            {charCount} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
