import { useState } from "react";
import { usePendingApprovals } from "@/features/properties/hooks/use-pending-approvals";
import { useApproveProperty } from "@/features/properties/hooks/use-property-actions";
import type { PropertyDetail } from "@/features/properties/types";

const CHECKLIST_ITEMS: { key: keyof NonNullable<PropertyDetail["verification"]>; label: string }[] = [
  { key: "owner_info_ok", label: "Owner info" },
  { key: "price_ok", label: "Price" },
  { key: "location_ok", label: "Location" },
  { key: "details_ok", label: "Details" },
  { key: "photos_ok", label: "Photos" },
  { key: "documents_ok", label: "Documents" },
  { key: "commission_agreement_ok", label: "Commission agreement" },
];

function formatCurrency(value: string, currency: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return `${currency === "GHS" ? "GH₵" : currency + " "}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function ApprovalsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-64 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mt-3" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#0d121f] border border-white/10 rounded-xl p-5 h-32 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ChecklistPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${
        ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
      {label}
    </span>
  );
}

function ApprovalCard({ property }: { property: PropertyDetail }) {
  const { mutate, isPending, isError, error } = useApproveProperty();
  const [justApproved, setJustApproved] = useState(false);

  const checklist = property.verification;
  const isComplete = checklist?.is_complete ?? false;

  const handleApprove = () => {
    mutate(property.id, {
      onSuccess: () => setJustApproved(true),
    });
  };

  return (
    <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {property.media && property.media.length > 0 ? (
            <img src={property.media[0].file} alt={property.title} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-white/5" />
          )}
          <div>
            <h3 className="text-[15px] font-semibold text-white">{property.title}</h3>
            <p className="text-[13px] text-slate-400 mt-0.5">
              {property.location} · {formatCurrency(property.price, property.currency)}
            </p>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Agent: {property.agent_name ?? "Unassigned"}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          {justApproved ? (
            <span className="text-[13px] text-emerald-400 font-medium">✓ Approved</span>
          ) : (
            <button
              onClick={handleApprove}
              disabled={!isComplete || isPending}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                isComplete
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-white/5 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isPending ? "Approving…" : "Approve"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {checklist ? (
          CHECKLIST_ITEMS.map((item) => (
            <ChecklistPill key={item.key} ok={Boolean(checklist[item.key])} label={item.label} />
          ))
        ) : (
          <span className="text-[12px] text-red-400">No verification checklist found for this property.</span>
        )}
      </div>

      {isError && (
        <p className="mt-3 text-[12.5px] text-red-400">
          {(error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Couldn't approve this property."}
        </p>
      )}
    </div>
  );
}

export default function CeoApprovalsPage() {
  const { data, isLoading, isError } = usePendingApprovals();

  if (isLoading && !data) {
    return <ApprovalsSkeleton />;
  }

  if (isError) {
    return <p className="text-[13px] text-red-400">Couldn't load pending approvals.</p>;
  }

  const properties = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white">Approvals</h1>
        <p className="text-[13.5px] text-slate-400 mt-1">
          {properties.length.toLocaleString()} propert{properties.length === 1 ? "y" : "ies"} awaiting manager approval
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-8 text-center text-slate-500 text-[13.5px]">
          No properties are currently pending approval.
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => (
            <ApprovalCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
