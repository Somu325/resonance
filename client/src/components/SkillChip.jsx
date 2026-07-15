export default function SkillChip({
  label,
  variant = 'matched',
  className = '',
  ...props
}) {
  const variantStyles = {
    matched: {
      backgroundColor: 'var(--color-moss-subtle)',
      borderColor: 'var(--color-moss-border)',
      color: 'var(--color-moss)',
    },
    missing: {
      backgroundColor: 'var(--color-clay-subtle)',
      borderColor: 'var(--color-clay-border)',
      color: 'var(--color-clay)',
    },
  };

  const selectedStyle = variantStyles[variant] || variantStyles.matched;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.6rem',
        fontSize: '0.725rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: '500',
        borderRadius: '6px',
        border: '1px solid',
        transition: 'var(--transition-smooth)',
        ...selectedStyle
      }}
      {...props}
    >
      {label}
    </span>
  );
}
