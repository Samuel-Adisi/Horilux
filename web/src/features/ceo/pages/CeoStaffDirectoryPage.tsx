import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStaffDirectory } from "@/features/dashboard/hooks/use-staff-directory";
import {
  useDepartments,
  useRoles,
  useCreateStaffMember,
  useUpdateStaffMember,
  useDeactivateStaffMember,
  useReactivateStaffMember,
  useStaffMember,
} from "@/features/dashboard/hooks/use-staff-crud";
import type { StaffMember, StaffFormInput } from "@/features/dashboard/api/staff-directory";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

function StaffDirectorySkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-56 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mt-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-[#0d121f] border border-white/10 rounded-xl p-5">
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
            <div className="h-7 w-20 bg-white/5 rounded animate-pulse mt-4" />
          </div>
        ))}
      </div>
      <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StaffFormState {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
  role: string;
  password: string;
}

const EMPTY_FORM: StaffFormState = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  department: "",
  role: "",
  password: "",
};

function StaffFormModal({
  mode,
  staffId,
  onClose,
}: {
  mode: "create" | "edit";
  staffId: string | null;
  onClose: () => void;
}) {
  const { data: existing, isLoading: isLoadingExisting } = useStaffMember(mode === "edit" ? staffId : null);
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [hydrated, setHydrated] = useState(mode === "create");
  const [formError, setFormError] = useState<string | null>(null);
  const { data: departments } = useDepartments();
  const { data: roles } = useRoles();
  const createMutation = useCreateStaffMember();
  const updateMutation = useUpdateStaffMember();

  if (!hydrated && existing) {
    setForm({
      email: existing.email,
      first_name: existing.first_name,
      last_name: existing.last_name,
      phone: existing.phone,
      department: existing.department?.id ?? "",
      role: existing.roles[0]?.id ?? "",
      password: "",
    });
    setHydrated(true);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const filteredRoles = form.department ? (roles ?? []).filter((r) => r.department === form.department) : roles ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormError("First and last name are required.");
      return;
    }
    if (mode === "create" && (!form.email.trim() || !form.password.trim())) {
      setFormError("Email and a temporary password are required to create a staff account.");
      return;
    }

    const payload: StaffFormInput = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim(),
      department: form.department || null,
      role: form.role || null,
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({ ...payload, email: form.email.trim(), password: form.password });
      } else if (staffId) {
        const updatePayload: Partial<StaffFormInput> = { ...payload };
        if (form.password.trim()) {
          updatePayload.password = form.password;
        }
        await updateMutation.mutateAsync({ id: staffId as string, input: updatePayload });
      }
      onClose();
    } catch (err) {
      const message =
        (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      setFormError(message ? JSON.stringify(message) : "Something went wrong saving this staff member.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d121f] border border-white/10 rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          {mode === "create" ? "Add Staff Member" : "Edit Staff Member"}
        </h2>
        {mode === "edit" && isLoadingExisting ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">First name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Last name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">Email {mode === "edit" && "(cannot be changed)"}</label>
            <input
              type="email"
              value={form.email}
              disabled={mode === "edit"}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value, role: "" })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">—</option>
                {(departments ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">—</option>
                {filteredRoles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">
              {mode === "create" ? "Temporary password" : "Reset password (optional)"}
            </label>
            <input
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={mode === "edit" ? "Leave blank to keep current password" : ""}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {formError && <p className="text-xs text-rose-400">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {isSaving ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

function StaffRow({
  member,
  onEdit,
}: {
  member: StaffMember;
  onEdit: () => void;
}) {
  const deactivateMutation = useDeactivateStaffMember();
  const reactivateMutation = useReactivateStaffMember();
  const isBusy = deactivateMutation.isPending || reactivateMutation.isPending;

  return (
    <tr className="border-b border-white/5 last:border-0 align-top">
      <td className="px-5 py-3.5 font-semibold text-white">{member.name}</td>
      <td className="px-5 py-3.5 text-slate-300">{member.email}</td>
      <td className="px-5 py-3.5 text-slate-300">{member.phone || "—"}</td>
      <td className="px-5 py-3.5 text-slate-300">{member.department ?? "—"}</td>
      <td className="px-5 py-3.5 text-slate-300">
        {member.roles.length > 0 ? member.roles.join(", ") : "—"}
      </td>
      <td className="px-5 py-3.5 text-slate-300">{formatDate(member.date_joined)}</td>
      <td className="px-5 py-3.5">
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
            member.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"
          }`}
        >
          {member.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3 text-xs">
          <button onClick={onEdit} className="text-blue-400 hover:text-blue-300 font-semibold">
            Edit
          </button>
          {member.is_active ? (
            <button
              disabled={isBusy}
              onClick={() => deactivateMutation.mutate(member.id)}
              className="text-rose-400 hover:text-rose-300 font-semibold disabled:opacity-50"
            >
              Deactivate
            </button>
          ) : (
            <button
              disabled={isBusy}
              onClick={() => reactivateMutation.mutate(member.id)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold disabled:opacity-50"
            >
              Reactivate
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function CeoStaffDirectoryPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; staffId: string | null } | null>(null);
  const { data, isLoading, isError, error } = useStaffDirectory();

  if (isLoading && !data) {
    return <StaffDirectorySkeleton />;
  }

  const status = (error as { response?: { status?: number } } | null)?.response?.status;

  if (isError && status === 403) {
    return (
      <div className="bg-[#0d121f] border border-white/10 rounded-xl p-8 text-center">
        <p className="text-sm font-semibold text-white">You don't have access to this page</p>
        <p className="text-sm text-slate-400 mt-2">
          Staff Directory is limited to CEO and Operations roles. Contact an administrator if you believe this is a mistake.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-rose-400">
        Couldn't load the staff directory. Try refreshing.
      </div>
    );
  }

  const allStaff = data?.staff ?? [];
  const staff = search.trim()
    ? allStaff.filter((s) =>
        `${s.name} ${s.email} ${s.department ?? ""} ${s.roles.join(" ")}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      )
    : allStaff;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Directory</h1>
          <p className="text-sm text-slate-400 mt-1">Every user account in the system, with department, role, and status.</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create", staffId: null })}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
        >
          Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-blue-500">
          <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Total Staff</p>
          <p className="text-2xl font-bold text-white mt-3 font-mono">{data?.total_staff ?? 0}</p>
        </div>
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-5 transition-all hover:border-emerald-500">
          <p className="text-xs font-mono tracking-wide text-slate-500 uppercase">Active</p>
          <p className="text-2xl font-bold text-white mt-3 font-mono">{data?.active_count ?? 0}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search name, email, department, role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0d121f] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-72"
        />
      </div>

      {staff.length === 0 ? (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl p-8 text-center text-sm text-slate-400">
          No staff match this search.
        </div>
      ) : (
        <div className="bg-[#0d121f] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-slate-500 border-b border-white/10">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <StaffRow
                    key={s.id}
                    member={s}
                    onEdit={() => setModal({ mode: "edit", staffId: s.id })}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-white/10 text-xs text-slate-400">
            Showing {staff.length} of {data?.total_staff ?? 0}
          </div>
        </div>
      )}

      {modal && (
        <StaffFormModal
          mode={modal.mode}
          staffId={modal.staffId}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
