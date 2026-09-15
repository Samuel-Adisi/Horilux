import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; title: string; description?: string };
type ToastContextValue = { toast: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md text-xs font-medium bg-blue-950/90 border-blue-500/50 text-blue-200"
          >
            <p>{t.title}</p>
            {t.description && <p className="text-blue-300/80 mt-0.5">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe fallback if ToastProvider isn't mounted yet — avoids crashing the app.
    return { toast: (t: Omit<Toast, "id">) => console.log("[toast]", t.title) };
  }
  return ctx;
}
