import Spinner from './Spinner';

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
  ...props
}) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'border border-[var(--color-clay)] text-[var(--color-clay)] bg-transparent hover:bg-[var(--color-clay-subtle)]',
  };

  const selectedVariant = variantClasses[variant] || variantClasses.primary;
  const isInteractionDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isInteractionDisabled}
      className={`btn ${selectedVariant} relative ${className}`}
      {...props}
    >
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      )}
    </button>
  );
}
