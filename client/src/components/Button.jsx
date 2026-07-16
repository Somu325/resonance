import Spinner from './Spinner';

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
  loadingText,
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
      className={`btn ${selectedVariant} flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {loading && (
        <Spinner size="sm" className="border-current" />
      )}
      <span>
        {loading ? (loadingText || children) : children}
      </span>
    </button>
  );
}
