import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, CornerDownLeft, Loader2, Search, Target, UserRound } from "lucide-react";
import { visibleNav } from "@/config/navigation";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { can } from "@/features/accounts/permissions";
import { fetchProperties } from "@/features/properties/api";
import { fetchClients } from "@/features/crm/api";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Lead } from "@/features/crm/api";
import { useDebounced } from "@/hooks/use-debounced";
import { cn } from "@/lib/utils";

interface Result {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  to: string;
  icon: React.ReactNode;
}

const PER_GROUP = 5;

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Mounting fresh on every open resets the query and selection.
  return open ? <Palette onClose={onClose} /> : null;
}

function Palette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState("");
  const [activeRaw, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounced(query.trim(), 250);

  const search = useQuery({
    queryKey: ["command-search", debounced],
    enabled: debounced.length >= 2,
    staleTime: 15_000,
    queryFn: async () => {
      const [props, leads, clients] = await Promise.allSettled([
        can(user, "property") ? fetchProperties({ search: debounced }) : Promise.resolve(null),
        can(user, "lead")
          ? apiClient.get<Paginated<Lead>>("/leads/", { params: { search: debounced } }).then((r) => r.data)
          : Promise.resolve(null),
        can(user, "client") ? fetchClients({ search: debounced }) : Promise.resolve(null),
      ]);
      const out: Result[] = [];
      if (props.status === "fulfilled" && props.value)
        out.push(
          ...props.value.results.slice(0, PER_GROUP).map((p) => ({
            id: `p-${p.id}`,
            group: "Properties",
            title: p.title,
            subtitle: p.location,
            to: `/properties/${p.id}`,
            icon: <Building2 />,
          })),
        );
      if (leads.status === "fulfilled" && leads.value)
        out.push(
          ...leads.value.results.slice(0, PER_GROUP).map((l) => ({
            id: `l-${l.id}`,
            group: "Leads",
            title: l.name,
            subtitle: [l.status_label, l.phone].filter(Boolean).join(" · "),
            to: `/leads/${l.id}`,
            icon: <Target />,
          })),
        );
      if (clients.status === "fulfilled" && clients.value)
        out.push(
          ...clients.value.results.slice(0, PER_GROUP).map((c) => ({
            id: `c-${c.id}`,
            group: "Clients",
            title: c.name,
            subtitle: c.phone || c.email,
            to: `/clients/${c.id}`,
            icon: <UserRound />,
          })),
        );
      return out;
    },
  });

  const pages: Result[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleNav(user)
      .flatMap((g) => g.items)
      .filter((i) => !q || i.label.toLowerCase().includes(q))
      .slice(0, q ? 5 : 8)
      .map((i) => ({ id: `nav-${i.path}`, group: "Go to", title: i.label, to: i.path, icon: <i.icon /> }));
  }, [query, user]);

  const results = useMemo(() => [...pages, ...(debounced.length >= 2 ? search.data ?? [] : [])], [pages, search.data, debounced]);

  const active = Math.min(activeRaw, Math.max(0, results.length - 1));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(r: Result) {
    navigate(r.to);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  let lastGroup = "";
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative w-full max-w-xl overflow-hidden rounded border border-line bg-surface shadow-pop animate-in fade-in-0 zoom-in-[0.98]"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          {search.isFetching ? (
            <Loader2 className="size-4 animate-spin text-ink-subtle" />
          ) : (
            <Search className="size-4 text-ink-subtle" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search properties, leads, clients, or jump to a page"
            className="h-12 flex-1 bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          />
          <kbd className="rounded-sm border border-line px-1.5 py-0.5 text-2xs font-semibold text-ink-subtle">Esc</kbd>
        </div>
        <div ref={listRef} id="command-results" role="listbox" className="scrollbar-thin max-h-[50vh] overflow-y-auto py-1.5">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-subtle">
              {debounced.length >= 2 && !search.isFetching ? `Nothing matches "${debounced}".` : "Type at least two characters to search records."}
            </p>
          ) : (
            results.map((r, i) => {
              const header = r.group !== lastGroup ? r.group : null;
              lastGroup = r.group;
              return (
                <div key={r.id}>
                  {header && <p className="px-4 pb-1 pt-2.5 text-2xs font-bold uppercase tracking-[0.08em] text-ink-faint">{header}</p>}
                  <button
                    type="button"
                    id={`cmd-${r.id}`}
                    role="option"
                    aria-selected={i === active}
                    data-index={i}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(r)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2 text-left [&_svg]:size-4",
                      i === active ? "bg-brand-50" : "hover:bg-surface-hover",
                    )}
                  >
                    <span className={i === active ? "text-brand" : "text-ink-subtle"}>{r.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{r.title}</span>
                      {r.subtitle && <span className="block truncate text-xs text-ink-subtle">{r.subtitle}</span>}
                    </span>
                    {i === active ? <CornerDownLeft className="text-ink-subtle" /> : <ArrowRight className="text-transparent" />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
