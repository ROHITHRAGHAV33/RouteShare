export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-navy-900/10 shadow-sm ${className}`}>{children}</div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-navy-900 text-white hover:bg-navy-800",
    accent: "bg-amber-500 text-navy-950 hover:bg-amber-400 font-semibold",
    outline: "border border-navy-900/20 text-navy-900 hover:bg-navy-900/5",
    danger: "bg-red-600 text-white hover:bg-red-500",
    ghost: "text-navy-700 hover:bg-navy-900/5",
  };
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-navy-900/10 text-navy-800",
    active: "bg-emerald-100 text-emerald-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    picked_up: "bg-purple-100 text-purple-800",
    delivered: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${tones[children] || tones[tone]}`}>
      {String(children).replace("_", " ")}
    </span>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-navy-800 mb-1">{label}</span>}
      <input
        className={`focus-ring w-full rounded-lg border px-3 py-2 text-sm bg-white ${
          error ? "border-red-400" : "border-navy-900/15"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-navy-800 mb-1">{label}</span>}
      <select
        className={`focus-ring w-full rounded-lg border px-3 py-2 text-sm bg-white ${
          error ? "border-red-400" : "border-navy-900/15"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`inline-block w-5 h-5 border-2 border-navy-900/20 border-t-navy-900 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-navy-900/5 flex items-center justify-center text-navy-400 font-display text-xl">
        —
      </div>
      <h3 className="font-display font-semibold text-navy-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-navy-600 mb-4 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-display font-semibold text-lg text-navy-900 mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
}
