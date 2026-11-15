import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader } from "@/components/ui/page";
import { ErrorState, Panel, Skeleton, Tag } from "@/components/ui/display";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { apiClient } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";

interface SystemStatus {
  time: string;
  app: { python: string; django: string; debug: boolean; commit: string | null };
  database: { vendor: string; host: string | null; latency_ms: number };
  migrations: { applied: number; pending: string[] };
  cache: { backend: string; ok: boolean; error?: string };
  celery: { online: boolean; workers: string[]; error?: string };
  row_counts: Record<string, number | null>;
  rbac_matrix: Record<string, Record<string, string[]>>;
}

function useSystemStatus() {
  return useQuery({
    queryKey: ["system-status"],
    queryFn: async () => (await apiClient.get<SystemStatus>("/system/status/")).data,
    refetchInterval: 30000,
  });
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function Card({ title, ok, children }: { title: string; ok?: boolean; children: ReactNode }) {
  return (
    <Panel>
      <div className="space-y-2 p-4 text-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          {ok === undefined ? null : <Tag tone={ok ? "success" : "danger"}>{ok ? "OK" : "Problem"}</Tag>}
        </div>
        {children}
      </div>
    </Panel>
  );
}

export function SystemPage() {
  useDocumentTitle("System");
  const q = useSystemStatus();
  const d = q.data;
  return (
    <Page>
      <PageHeader title="System" description="Platform health, versions and record counts. Refreshes every 30 seconds." />
      {q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : !d ? (
        <Skeleton className="h-48" />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card title="Database" ok={d.database.latency_ms < 1500}>
              <Line label="Vendor" value={d.database.vendor} />
              <Line label="Host" value={d.database.host ?? "n/a"} />
              <Line label="Round trip" value={d.database.latency_ms + " ms"} />
            </Card>
            <Card title="Migrations" ok={d.migrations.pending.length === 0}>
              <Line label="Applied" value={d.migrations.applied} />
              <Line label="Pending" value={d.migrations.pending.length === 0 ? "None" : d.migrations.pending.join(", ")} />
            </Card>
            <Card title="Background workers" ok={d.celery.online}>
              <Line label="Workers" value={d.celery.workers.length ? d.celery.workers.join(", ") : "None responding"} />
            </Card>
            <Card title="Cache" ok={d.cache.ok}>
              <Line label="Backend" value={d.cache.backend} />
            </Card>
            <Card title="Application">
              <Line label="Python" value={d.app.python} />
              <Line label="Django" value={d.app.django} />
              <Line label="Debug" value={d.app.debug ? "On" : "Off"} />
              <Line label="Commit" value={d.app.commit ?? "n/a"} />
              <Line label="Checked" value={formatDateTime(d.time)} />
            </Card>
          </div>
          <Panel>
            <div className="p-4">
              <h2 className="pb-2 text-sm font-semibold">Record counts</h2>
              <div className="grid gap-x-8 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(d.row_counts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-white/10 py-1 text-sm">
                      <span className="text-ink-muted">{k}</span>
                      <span>{v ?? "n/a"}</span>
                    </div>
                  ))}
              </div>
            </div>
          </Panel>
          <Panel>
            <div className="p-4">
              <h2 className="pb-2 text-sm font-semibold">Roles and permissions</h2>
              {Object.entries(d.rbac_matrix).map(([role, grants]) => (
                <div key={role} className="py-2">
                  <div className="text-sm font-semibold">{role}</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {Object.entries(grants).map(([res, acts]) => (
                      <Tag key={res} tone="neutral">{res + ": " + acts.join(", ")}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </Page>
  );
}
