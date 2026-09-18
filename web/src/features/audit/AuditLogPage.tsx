import { useState } from "react";
import { ScrollText } from "lucide-react";
import { Page, PageHeader, SearchInput, Toolbar } from "@/components/ui/page";
import { EmptyState, ErrorState, Panel, Tag } from "@/components/ui/display";
import { Select } from "@/components/ui/form";
import { Drawer } from "@/components/ui/overlay";
import { Pagination, Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useUrlState } from "@/hooks/use-url-state";
import { useSearchBox } from "@/hooks/use-search-box";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatDateTime, humanize } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/types";
import { AUDITED_MODELS, useAuditLogs, type AuditLog } from "./api";

function changedFields(log: AuditLog): string[] {
  const oldV = log.old_value ?? {};
  const newV = log.new_value ?? {};
  const keys = new Set([...Object.keys(oldV), ...Object.keys(newV)]);
  return [...keys].filter((k) => JSON.stringify(oldV[k]) !== JSON.stringify(newV[k]) && !["updated_at"].includes(k));
}

function show(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function AuditLogPage() {
  useDocumentTitle("Audit log");
  const { values, page, set } = useUrlState(["search", "model_name", "action"] as const);
  const [text, setText] = useSearchBox(values.search, (v) => set({ search: v }));
  const q = useAuditLogs({ page, ...values });
  const [open, setOpen] = useState<AuditLog | null>(null);
  const rows = q.data?.results ?? [];

  return (
    <Page>
      <PageHeader title="Audit log" description="Every change to properties, leads, deals and commissions — who, what and when." />
      <Panel flush>
        <Toolbar>
          <SearchInput value={text} onChange={setText} placeholder="Search person or record ID" />
          <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex">
            <Select value={values.model_name} onChange={(e) => set({ model_name: e.target.value })} className="h-8 sm:w-44" aria-label="Record type">
              <option value="">All records</option>
              {AUDITED_MODELS.map((m) => (
                <option key={m} value={m}>
                  {humanize(m.replace(/([a-z])([A-Z])/g, "$1 $2"))}
                </option>
              ))}
            </Select>
            <Select value={values.action} onChange={(e) => set({ action: e.target.value })} className="h-8 sm:w-32" aria-label="Action">
              <option value="">All actions</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="delete">Deleted</option>
            </Select>
          </div>
        </Toolbar>
        {q.isLoading ? (
          <TableSkeleton />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<ScrollText />} title="No entries" />
        ) : (
          <>
            <Table className={q.isPlaceholderData ? "opacity-60" : undefined}>
              <THead>
                <tr>
                  <TH>When</TH>
                  <TH>Who</TH>
                  <TH>What</TH>
                  <TH className="hidden md:table-cell">Changed</TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((l) => {
                  const fields = changedFields(l);
                  return (
                    <TR key={l.id} onClick={() => setOpen(l)}>
                      <TD className="whitespace-nowrap text-ink-muted">{formatDateTime(l.timestamp)}</TD>
                      <TD className="whitespace-nowrap font-semibold">{l.actor_name}</TD>
                      <TD className="whitespace-nowrap">
                        <Tag tone={l.action === "delete" ? "danger" : l.action === "create" ? "success" : "neutral"}>{humanize(l.action)}</Tag>{" "}
                        <span className="text-ink-muted">{humanize(l.model_name.replace(/([a-z])([A-Z])/g, "$1 $2"))}</span>
                      </TD>
                      <TD className="hidden max-w-sm truncate text-ink-subtle md:table-cell">
                        {l.action === "update" ? fields.map(humanize).join(", ") || "—" : "—"}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} count={q.data?.count ?? 0} hasNext={!!q.data?.next} hasPrevious={!!q.data?.previous} onPageChange={(p) => set({ page: p })} />
          </>
        )}
      </Panel>
      {open && (
        <Drawer
          open
          onClose={() => setOpen(null)}
          title={`${humanize(open.action)} ${humanize(open.model_name.replace(/([a-z])([A-Z])/g, "$1 $2")).toLowerCase()}`}
          subtitle={`${open.actor_name} · ${formatDateTime(open.timestamp)}`}
        >
          <p className="mb-3 break-all text-xs text-ink-subtle">Record {open.object_id}</p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-2xs font-bold uppercase tracking-wide text-ink-subtle">
                <th className="py-1.5 pr-3">Field</th>
                <th className="py-1.5 pr-3">Before</th>
                <th className="py-1.5">After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(open.action === "update" ? changedFields(open) : Object.keys(open.new_value ?? open.old_value ?? {})).map((k) => (
                <tr key={k} className="align-top">
                  <td className="py-2 pr-3 font-semibold text-ink">{humanize(k)}</td>
                  <td className="break-all py-2 pr-3 text-ink-muted">{show(open.old_value?.[k])}</td>
                  <td className="break-all py-2 text-ink">{show(open.new_value?.[k])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Drawer>
      )}
    </Page>
  );
}
