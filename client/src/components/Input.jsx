export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  className = '',
  id,
  ...props
}) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          className="label-caps"
          style={{ display: 'block', marginBottom: '0.4rem', opacity: 0.8 }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-clay)', marginLeft: '0.125rem' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input-field"
        style={error ? { borderColor: 'var(--color-clay)' } : {}}
        {...props}
      />
      {error && (
        <p className="text-data" style={{ fontSize: '0.75rem', color: 'var(--color-clay)', marginTop: '0.4rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
