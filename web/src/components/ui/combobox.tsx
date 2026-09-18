import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { useDebounced } from "@/hooks/use-debounced";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

/**
 * Searchable single-select. Pass `options` for a static list, or `onSearch`
 * + `options` driven by the parent for server-side search.
 */
export function Combobox({
  value,
  onChange,
  options,
  selectedLabel,
  placeholder = "Select…",
  onSearch,
  loading,
  disabled,
  emptyText = "No matches",
  footer,
  id,
  invalid,
  clearable,
}: {
  value: string;
  onChange: (value: string, option?: Option) => void;
  options: Option[];
  /** Label for the current value when it isn't in `options` (e.g. after a search). */
  selectedLabel?: string;
  placeholder?: string;
  onSearch?: (q: string) => void;
  loading?: boolean;
  disabled?: boolean;
  emptyText?: string;
  footer?: ReactNode;
  id?: string;
  invalid?: boolean;
  clearable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [active, setActive] = useState(0);
  const debounced = useDebounced(text, 250);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (onSearch && open) onSearch(debounced);
  }, [debounced, open, onSearch]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const filtered = onSearch
    ? options
    : options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(text.trim().toLowerCase()));

  const current = options.find((o) => o.value === value);
  const display = current?.label ?? selectedLabel ?? "";

  function openList() {
    if (disabled) return;
    setOpen(true);
    setText("");
    setActive(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function pick(o: Option) {
    onChange(o.value, o);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active]);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={openList}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded border border-line-strong bg-field px-3 text-left text-sm transition-colors hover:border-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface-sunken aria-[invalid=true]:border-danger",
          !display && "text-ink-faint",
        )}
      >
        <span className="min-w-0 flex-1 truncate text-ink">{display || <span className="text-ink-faint">{placeholder}</span>}</span>
        {clearable && value ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="rounded p-0.5 text-ink-subtle hover:text-ink"
            aria-label="Clear"
          >
            <X className="size-3.5" />
          </span>
        ) : (
          <ChevronsUpDown className="size-4 shrink-0 text-ink-subtle" />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[240px] overflow-hidden rounded border border-line bg-surface shadow-pop">
          <div className="flex items-center border-b border-line px-2.5">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Type to search"
              className="h-9 w-full bg-transparent text-sm focus:outline-none"
              role="combobox"
              aria-controls={listId}
              aria-expanded
            />
            {loading && <Loader2 className="size-4 animate-spin text-ink-subtle" />}
          </div>
          <ul id={listId} role="listbox" className="scrollbar-thin max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-ink-subtle">{loading ? "Searching…" : emptyText}</li>
            ) : (
              filtered.map((o, i) => (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={o.value === value}
                    onMouseMove={() => setActive(i)}
                    onClick={() => pick(o)}
                    className={cn("flex w-full items-center gap-2 px-3 py-1.5 text-left", i === active && "bg-surface-hover")}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{o.label}</span>
                      {o.hint && <span className="block truncate text-xs text-ink-subtle">{o.hint}</span>}
                    </span>
                    {o.value === value && <Check className="size-4 text-brand-fg" />}
                  </button>
                </li>
              ))
            )}
          </ul>
          {footer && <div className="border-t border-line p-1">{footer}</div>}
        </div>
      )}
    </div>
  );
}
