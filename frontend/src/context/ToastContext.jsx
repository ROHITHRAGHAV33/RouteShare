import { createContext, useContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, variant = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-lg px-4 py-3 shadow-lg text-sm font-medium border-l-4 bg-white animate-[fadein_0.2s_ease-out] ${
              t.variant === "success"
                ? "border-emerald-500 text-emerald-900"
                : t.variant === "error"
                ? "border-red-500 text-red-900"
                : "border-navy-600 text-navy-900"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
