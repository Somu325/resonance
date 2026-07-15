export default function Spinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[2px]',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-[4px]',
  };

  return (
    <div
      className={`animate-spin rounded-full border-[var(--color-moss)] border-t-transparent ${sizeClasses[size] || sizeClasses.md}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
