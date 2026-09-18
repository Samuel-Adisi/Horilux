import { useNavigate } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import { Page, PageHeader, SearchInput, Toolbar } from "@/components/ui/page";
import { ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Pagination, TableSkeleton } from "@/components/ui/table";
import { useCan } from "@/features/accounts/permissions";
import { useUrlState } from "@/hooks/use-url-state";
import { useSearchBox } from "@/hooks/use-search-box";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { PAGE_SIZE } from "@/lib/types";
import { PROPERTY_STATUS_LABEL, PROPERTY_STATUS_ORDER, useProperties } from "../api";
import { PropertyRow } from "../components/PropertyRow";
import { cn } from "@/lib/utils";

export function PropertiesPage() {
  useDocumentTitle("Properties");
  const navigate = useNavigate();
  const can = useCan();
  const { values, page, set } = useUrlState(["search", "status", "property_type", "listing_type"] as const);
  const [text, setText] = useSearchBox(values.search, (v) => set({ search: v }));
  const q = useProperties({ page, ...values });
  const rows = q.data?.results ?? [];
  const filtered = !!(values.search || values.status || values.property_type || values.listing_type);

  return (
    <Page>
      <PageHeader
        title="Properties"
        count={q.data ? `${q.data.count.toLocaleString()} ${filtered ? "matching" : "total listings"}` : undefined}
        description="Browse and manage listings across your portfolio."
        actions={
          can("property", "create") && (
            <ButtonLink to="/properties/new" variant="primary" icon={<Plus />}>
              New property
            </ButtonLink>
          )
        }
      />

      <Panel flush>
        <Toolbar>
          <SearchInput value={text} onChange={setText} placeholder="Search title, location or region" />
          <div className="grid grid-cols-3 gap-2 sm:ml-auto sm:flex">
            <Select value={values.status} onChange={(e) => set({ status: e.target.value })} aria-label="Status" className="h-8 sm:w-44">
              <option value="">All statuses</option>
              {PROPERTY_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {PROPERTY_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
            <Select value={values.listing_type} onChange={(e) => set({ listing_type: e.target.value })} aria-label="Listing" className="h-8 sm:w-32">
              <option value="">Sale & rent</option>
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
            </Select>
            <Select value={values.property_type} onChange={(e) => set({ property_type: e.target.value })} aria-label="Type" className="h-8 sm:w-36">
              <option value="">All types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </Select>
          </div>
        </Toolbar>

        {q.isLoading ? (
          <TableSkeleton />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Building2 />}
            title={filtered ? "No properties match" : "No properties yet"}
            description={filtered ? "Try a different search or clear the filters." : "Listings you add will show up here."}
            action={
              !filtered &&
              can("property", "create") && (
                <ButtonLink to="/properties/new" variant="primary" icon={<Plus />}>
                  Add the first property
                </ButtonLink>
              )
            }
          />
        ) : (
          <>
            <ul className={cn("divide-y divide-line", q.isPlaceholderData && "opacity-60")}>
              {rows.map((p) => (
                <PropertyRow key={p.id} property={p} onClick={() => navigate(`/properties/${p.id}`)} />
              ))}
            </ul>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              count={q.data?.count ?? 0}
              hasNext={!!q.data?.next}
              hasPrevious={!!q.data?.previous}
              onPageChange={(p) => set({ page: p })}
            />
          </>
        )}
      </Panel>
    </Page>
  );
}
