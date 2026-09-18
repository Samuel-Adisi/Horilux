import { useNavigate } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import { Page, PageHeader, SearchInput, Toolbar } from "@/components/ui/page";
import { ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { EmptyState, ErrorState, Panel } from "@/components/ui/display";
import { Pagination, Table, TableSkeleton, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { PropertyStatus } from "@/components/domain/status";
import { useCan } from "@/features/accounts/permissions";
import { useUrlState } from "@/hooks/use-url-state";
import { useSearchBox } from "@/hooks/use-search-box";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatMoney, formatRelative } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/types";
import { PROPERTY_STATUS_LABEL, PROPERTY_STATUS_ORDER, useProperties } from "../api";
import { PropertyThumb } from "../components/PropertyThumb";

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
        description={q.data ? `${q.data.count} ${q.data.count === 1 ? "listing" : "listings"}${filtered ? " match your filters" : ""}` : "Every listing in the pipeline"}
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
            <Table className={q.isPlaceholderData ? "opacity-60" : undefined}>
              <THead>
                <tr>
                  <TH>Property</TH>
                  <TH>Status</TH>
                  <TH className="hidden md:table-cell">Details</TH>
                  <TH className="hidden lg:table-cell">Agent</TH>
                  <TH align="right">Price</TH>
                  <TH className="hidden xl:table-cell" align="right">
                    Added
                  </TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((p) => (
                  <TR key={p.id} onClick={() => navigate(`/properties/${p.id}`)}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <PropertyThumb src={p.image_url} className="size-10" />
                        <div className="min-w-0">
                          <p className="max-w-[18rem] truncate font-semibold text-ink">{p.title}</p>
                          <p className="max-w-[18rem] truncate text-xs text-ink-subtle">{[p.location, p.region].filter(Boolean).join(", ")}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <PropertyStatus status={p.status} />
                    </TD>
                    <TD className="hidden text-ink-muted md:table-cell">
                      <span className="capitalize">{p.property_type}</span>
                      {p.bedrooms != null && ` · ${p.bedrooms} bd`}
                      {p.bathrooms != null && ` · ${p.bathrooms} ba`}
                    </TD>
                    <TD className="hidden text-ink-muted lg:table-cell">{p.agent_name ?? "—"}</TD>
                    <TD align="right">
                      <span className="font-semibold">{formatMoney(p.price, p.currency)}</span>
                      <span className="block text-xs font-normal text-ink-subtle">
                        {p.listing_type === "rent" ? `to rent${p.rental_period ? ` / ${p.rental_period.replace("ly", "")}` : ""}` : "for sale"}
                      </span>
                    </TD>
                    <TD align="right" className="hidden text-ink-subtle xl:table-cell">
                      {formatRelative(p.created_at)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
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
