export function Logo({ variant = 'desktop' }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Logo"
        className={variant === 'desktop' ? 'w-25 h-25' : 'w-14 h-12'}
      />
      <span className={`text-white font-bold ${variant === 'desktop' ? 'text-2xl' : 'text-lg'}`}>
        TRADEX
      </span>
    </div>
  );
}