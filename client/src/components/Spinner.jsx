export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[2px]',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-[4px]',
  };

  const hasBorderColor = className.includes('border-');
  const colorClass = hasBorderColor ? '' : 'border-[var(--color-moss)]';

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent ${colorClass} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
