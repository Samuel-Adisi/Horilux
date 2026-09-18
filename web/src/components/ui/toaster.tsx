import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToastStore } from "@/lib/toast";
import { cn } from "@/lib/utils";

const icons = {
  success: <CheckCircle2 className="size-4 text-forest" />,
  error: <XCircle className="size-4 text-danger" />,
  info: <Info className="size-4 text-brand" />,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:right-5 sm:w-[360px]"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "error" ? "alert" : "status"}
          className={cn(
            "pointer-events-auto flex w-full items-start gap-2.5 rounded border border-line bg-surface px-3.5 py-3 shadow-pop animate-in fade-in-0 slide-in-from-bottom-2",
            t.tone === "error" && "border-l-2 border-l-danger",
            t.tone === "success" && "border-l-2 border-l-forest",
          )}
        >
          <span className="mt-0.5">{icons[t.tone]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            {t.description && <p className="mt-0.5 text-sm text-ink-muted">{t.description}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="rounded p-0.5 text-ink-subtle hover:bg-surface-hover hover:text-ink"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
