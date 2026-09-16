import { useEffect, useState } from "react";
import {
  useCompanyProfile,
  useUpdateCompanyProfile,
  useApprovalThreshold,
  useUpdateApprovalThreshold,
  useIntegrations,
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from "@/features/settings/hooks/use-settings";
import type { CompanyProfileUpdate } from "@/features/settings/types";

type TabKey = "profile" | "rules" | "notifications" | "integrations";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Company Profile" },
  { key: "rules", label: "Business Rules" },
  { key: "notifications", label: "Notifications" },
  { key: "integrations", label: "Integrations" },
];

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-[13.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500";
const labelClass = "block text-[12.5px] text-slate-400 mb-1.5";
const cardClass = "bg-[#0d121f] border border-white/10 rounded-xl p-6";

function SaveButton({ onClick, saving, disabled }: { onClick: () => void; saving: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving || disabled}
      className="px-4 py-2 rounded-lg bg-blue-500 text-white text-[13.5px] font-medium hover:bg-blue-600 disabled:opacity-40 transition-colors"
    >
      {saving ? "Saving…" : "Save changes"}
    </button>
  );
}

function CompanyProfileTab() {
  const { data, isLoading } = useCompanyProfile();
  const { mutate, isPending } = useUpdateCompanyProfile();
  const [form, setForm] = useState<CompanyProfileUpdate>({});

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        registered_address: data.registered_address,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        license_number: data.license_number,
        default_currency: data.default_currency,
        timezone: data.timezone,
        theme_primary_color: data.theme_primary_color,
        theme_secondary_color: data.theme_secondary_color,
        theme_accent_color: data.theme_accent_color,
      });
    }
  }, [data]);

  if (isLoading || !data) {
    return <div className="h-64 bg-white/5 rounded-xl animate-pulse" />;
  }

  const field = (key: keyof CompanyProfileUpdate, label: string, placeholder?: string) => (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        className={inputClass}
        value={(form[key] as string) ?? ""}
        placeholder={placeholder}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className={cardClass}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {field("name", "Company name")}
        {field("license_number", "License number")}
        {field("contact_email", "Contact email")}
        {field("contact_phone", "Contact phone")}
        {field("default_currency", "Default currency")}
        {field("timezone", "Timezone")}
        <div className="md:col-span-2">{field("registered_address", "Registered address")}</div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-[13px] font-medium text-white mb-4">Brand colors</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(["theme_primary_color", "theme_secondary_color", "theme_accent_color"] as const).map((key) => (
            <div key={key}>
              <label className={labelClass}>
                {key === "theme_primary_color" ? "Primary" : key === "theme_secondary_color" ? "Secondary" : "Accent"}
              </label>
              <div className="flex items-center gap-2">
                <span
                  className="w-9 h-9 rounded-lg border border-white/10 shrink-0"
                  style={{ backgroundColor: (form[key] as string) || "#000000" }}
                />
                <input
                  className={inputClass}
                  value={(form[key] as string) ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <SaveButton onClick={() => mutate(form)} saving={isPending} />
      </div>
    </div>
  );
}

function BusinessRulesTab() {
  const { data, isLoading } = useApprovalThreshold();
  const { mutate, isPending } = useUpdateApprovalThreshold();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (data) setValue(data.ceo_approval_min_price);
  }, [data]);

  if (isLoading || !data) {
    return <div className="h-40 bg-white/5 rounded-xl animate-pulse" />;
  }

  return (
    <div className={cardClass}>
      <p className="text-[13px] font-medium text-white mb-1">CEO approval threshold</p>
      <p className="text-[12.5px] text-slate-400 mb-4">
        Properties priced at or above this value require CEO sign-off. Below it, the Listing team can approve directly.
      </p>
      <div className="flex items-end gap-3 max-w-sm">
        <div className="flex-1">
          <label className={labelClass}>Minimum price (GHS)</label>
          <input
            className={inputClass}
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <SaveButton onClick={() => mutate(value)} saving={isPending} />
      </div>
    </div>
  );
}

function NotificationsTab() {
  const { data, isLoading } = useNotificationPreferences();
  const { mutate } = useUpdateNotificationPreference();

  if (isLoading || !data) {
    return <div className="h-64 bg-white/5 rounded-xl animate-pulse" />;
  }

  return (
    <div className={cardClass}>
      <p className="text-[13px] font-medium text-white mb-1">Notification preferences</p>
      <p className="text-[12.5px] text-slate-400 mb-5">Choose which events notify you.</p>
      <div className="divide-y divide-white/5">
        {data.map((pref) => (
          <div key={pref.id} className="flex items-center justify-between py-3">
            <span className="text-[13.5px] text-slate-200">{pref.event_type_display}</span>
            <button
              onClick={() => mutate({ id: pref.id, enabled: !pref.enabled })}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                pref.enabled ? "bg-blue-500" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  pref.enabled ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const { data, isLoading } = useIntegrations();

  if (isLoading || !data) {
    return <div className="h-40 bg-white/5 rounded-xl animate-pulse" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((integration) => (
        <div key={integration.id} className={cardClass}>
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-medium text-white">{integration.provider_display}</p>
            <span
              className={`text-[11.5px] font-medium px-2.5 py-1 rounded-full ${
                integration.configured
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}
            >
              {integration.configured ? "Configured" : "Not configured"}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 mt-2">
            {integration.last_checked_at
              ? `Last checked ${new Date(integration.last_checked_at).toLocaleString("en-GH")}`
              : "Not yet checked. Configuration is managed via environment variables on the server."}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function CeoSettingsPage() {
  const [tab, setTab] = useState<TabKey>("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white">Settings</h1>
        <p className="text-[13.5px] text-slate-400 mt-1">Company profile, business rules, notifications, and integrations</p>
      </div>

      <div className="flex items-center gap-1 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <CompanyProfileTab />}
      {tab === "rules" && <BusinessRulesTab />}
      {tab === "notifications" && <NotificationsTab />}
      {tab === "integrations" && <IntegrationsTab />}
    </div>
  );
}
