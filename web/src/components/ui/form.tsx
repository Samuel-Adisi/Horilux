import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded border border-line-strong bg-field px-3 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-subtle aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(control, "h-9", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 3, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(control, "py-2 leading-relaxed", className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, "h-9 appearance-none pr-8", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
    </div>
  );
});

export function Label({ htmlFor, children, optional }: { htmlFor?: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline gap-1.5 text-xs font-semibold text-ink-muted">
      {children}
      {optional && (
        <>
          {" "}
          <span className="font-normal text-ink-subtle">(optional)</span>
        </>
      )}
    </label>
  );
}

/**
 * Label + control + hint/error. The render-prop hands the control an id and
 * aria wiring so errors are announced by screen readers.
 */
export function Field({
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  className?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className={className}>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": error || hint ? msgId : undefined })}
      {error ? (
        <p id={msgId} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="mt-1 text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-brand" : "bg-line-strong",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-white shadow-raise transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700">
      {message}
    </div>
  );
}
