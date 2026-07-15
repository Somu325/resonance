export default function Toast({ message, type = 'success', onClose }) {
  const typeClasses = {
    success: 'bg-[var(--color-paper)] border border-[var(--color-moss-border)] text-[var(--color-moss)]',
    error: 'bg-[var(--color-paper)] border border-[var(--color-clay-border)] text-[var(--color-clay)]',
  };

  const iconSvg = {
    success: (
      <svg className="w-4 h-4 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between px-4 py-3.5 rounded-xl shadow-[0_4px_16px_rgba(31,35,32,0.08)] font-body text-sm ${typeClasses[type] || typeClasses.success}`}
      role="alert"
    >
      <div className="flex items-center">
        {iconSvg[type]}
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-current opacity-60 hover:opacity-100 p-1 hover:bg-black/5 rounded transition-all cursor-pointer"
        aria-label="Close"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
