import { useCallback, useState } from "react";
import { Combobox, type Option } from "@/components/ui/combobox";
import { useUsers } from "@/features/accounts/hooks/use-users";
import { DEPARTMENT_LABELS } from "@/features/accounts/types";
import { useProperties, type PropertyListItem } from "@/features/properties/api";
import { useClients, type Client } from "@/features/crm/api";
import { formatMoney } from "@/lib/format";

interface PickerProps {
  value: string;
  onChange: (id: string) => void;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
  selectedLabel?: string;
}

export function UserPicker({ departments, clearable, ...p }: PickerProps & { departments?: string[]; clearable?: boolean }) {
  const users = useUsers();
  const options: Option[] = (users.data ?? [])
    .filter((u) => !departments || (u.department_name && departments.includes(u.department_name)))
    .map((u) => ({
      value: u.id,
      label: u.full_name || u.email,
      hint: u.department_name ? DEPARTMENT_LABELS[u.department_name] ?? u.department_name : undefined,
    }));
  return (
    <Combobox
      {...p}
      clearable={clearable}
      options={options}
      loading={users.isLoading}
      placeholder={p.placeholder ?? "Choose a person"}
      onChange={(v) => p.onChange(v)}
    />
  );
}

export function PropertyPicker({
  statuses,
  onPick,
  ...p
}: PickerProps & { statuses?: string[]; onPick?: (property: PropertyListItem) => void }) {
  const [search, setSearch] = useState("");
  const onSearch = useCallback((q: string) => setSearch(q), []);
  // One status filter per request is all the API supports; filter the rest client-side.
  const q = useProperties({ search, status: statuses?.length === 1 ? statuses[0] : undefined });
  const results = (q.data?.results ?? []).filter((r) => !statuses || statuses.includes(r.status));
  const options: Option[] = results.map((r) => ({
    value: r.id,
    label: r.title,
    hint: `${r.location} · ${formatMoney(r.price, r.currency)}`,
  }));
  return (
    <Combobox
      {...p}
      options={options}
      onSearch={onSearch}
      loading={q.isFetching}
      placeholder={p.placeholder ?? "Search properties"}
      emptyText={statuses ? "No eligible properties match" : "No properties match"}
      onChange={(v) => {
        p.onChange(v);
        const hit = results.find((r) => r.id === v);
        if (hit) onPick?.(hit);
      }}
    />
  );
}

export function ClientPicker({ onPick, ...p }: PickerProps & { onPick?: (client: Client) => void }) {
  const [search, setSearch] = useState("");
  const onSearch = useCallback((q: string) => setSearch(q), []);
  const q = useClients({ search });
  const results = q.data?.results ?? [];
  const options: Option[] = results.map((c) => ({ value: c.id, label: c.name, hint: c.phone || c.email }));
  return (
    <Combobox
      {...p}
      options={options}
      onSearch={onSearch}
      loading={q.isFetching}
      placeholder={p.placeholder ?? "Search clients"}
      emptyText="No clients match. Convert a qualified lead to create one."
      onChange={(v) => {
        p.onChange(v);
        const hit = results.find((r) => r.id === v);
        if (hit) onPick?.(hit);
      }}
    />
  );
}
