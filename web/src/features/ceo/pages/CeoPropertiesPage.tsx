import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "@/features/properties/hooks/use-properties";
import type { Property } from "@/features/properties/types";

function formatCurrency(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return `GH\u20b5${value}`;
  return `GH\u20b5${amount.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

const STATUS_ORDER: { value: string; label: string; hover: string; badge: string }[] = [
  { value: "draft", label: "Draft", hover: "hover:border-slate-400", badge: "bg-slate-500/15 text-slate-300" },
  { value: "onboarding", label: "Onboarding", hover: "hover:border-cyan-500", badge: "bg-cyan-500/15 text-cyan-400" },
  { value: "pending_verification", label: "Pending Verification", hover: "hover:border-amber-500", badge: "bg-amber-500/15 text-amber-400" },
  { value: "verified", label: "Verified", hover: "hover:border-blue-500", badge: "bg-blue-500/15 text-blue-400" },
  { value: "pending_approval", label: "Pending Approval", hover: "hover:border-orange-500", badge: "bg-orange-500/15 text-orange-400" },
  { value: "marketing_ready", label: "Marketing Ready", hover: "hover:border-fuchsia-500", badge: "bg-fuchsia-500/15 text-fuchsia-400" },
  { value: "published", label: "Published", hover: "hover:border-teal-500", badge: "bg-teal-500/15 text-teal-400" },
  { value: "under_offer", label: "Under Offer", hover: "hover:border-purple-500", badge: "bg-purple-500/15 text-purple-400" },
  { value: "sold_rented", label: "Sold/Rented", hover: "hover:border-emerald-500", badge: "bg-emerald-500/15 text-emerald-400" },
  { value: "archived", label: "Archived", hover: "hover:border-slate-500", badge: "bg-slate-600/15 text-slate-400" },
];

function statusMeta(status: string) {
  return STATUS_ORDER.find((s) => s.value === status) ?? { value: status, label: status, hover: "", badge: "bg-slate-500/15 text-slate-300" };
}

function PropertiesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-64 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mt-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#0d121f] border border-white/10 rounded-xl p-5">
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
            <div className="h-7 w-28 bg-white/5 rounded animate-pulse mt-4" />
          </div>
        ))}
      </div>
      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ property }: { property: Property }) {
  const meta = statusMeta(property.status);
  const navigate = useNavigate();
  return (
    <tr
      onClick={() => navigate(`/ceo/properties/${property.id}`)}
      className="border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 transition-colors"
    >
      <td className="px-5 py-3.5 font-semibold text-white">{property.title}</td>
      <td className="px-5 py-3.5 text-slate-300 capitalize">{property.property_type}</td>
      <td className="px-5 py-3.5 text-slate-300 capitalize">{property.listing_type === "sale" ? "For Sale" : "For Rent"}</td>
      <td className="px-5 py-3.5 text-slate-300">{property.location}{property.region ? `, ${property.region}` : ""}</td>
      <td className="px-5 py-3.5 text-slate-300 font-mono">{formatCurrency(property.price)}</td>
      <td className="px-5 py-3.5 text-slate-300">{property.agent_name ?? "Unassigned"}</td>
      <td className="px-5 py-3.5">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.badge}`}>{property.status_label ?? meta.label}</span>
      </td>
    </tr>
  );
}

export default function CeoPropertiesPage() {
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useProperties({ status: status || undefined, search: search || undefined, page });

  if (isLoading && !data) {
    return <PropertiesSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-sm text-rose-400">
        Couldn't load properties. Try refreshing, or check that you have permission to view company-wide property data.
      </div>
    );
  }

  const properties = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const pageValue = properties.reduce((sum, p) => sum + Number(p.price), 0);
  const soldCount = properties.filter((p) => p.status === "sold_rented").length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Properties</h1>
        <p className="text-sm text-slate-400 mt-1">Full property portfolio across every stage, from draft listing to sold or rented.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-blue-500">
          <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Total Properties</p>
          <p className="text-2xl font-bold text-white mt-3 font-mono">{totalCount.toLocaleString()}</p>
        </div>
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-emerald-500">
          <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Page Value</p>
          <p className="text-2xl font-bold text-white mt-3 font-mono">{formatCurrency(pageValue)}</p>
          <p className="text-xs text-slate-500 mt-2">Sum of prices shown below</p>
        </div>
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-amber-500">
          <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Sold/Rented (this page)</p>
          <p className="text-2xl font-bold text-white mt-3 font-mono">{soldCount}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setStatus(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              status === "" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                status === s.value ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search title or location…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-[#0d121f] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-56"
          />
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors">
            Search
          </button>
        </form>
      </div>

      {properties.length === 0 ? (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-8 text-center text-sm text-slate-400">
          No properties match this filter.
        </div>
      ) : (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-slate-500 border-b border-white/10">
                  <th className="px-5 py-3 font-medium">Property</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Listing</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <PropertyRow key={p.id} property={p} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {properties.length} of {totalCount.toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data?.previous}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-slate-500">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data?.next}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
