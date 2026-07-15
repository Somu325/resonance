export default function Card({
  children,
  hover = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
