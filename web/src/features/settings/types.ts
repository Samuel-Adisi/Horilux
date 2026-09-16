export interface CompanyProfile {
  id: string;
  name: string;
  logo: string | null;
  registered_address: string;
  contact_email: string;
  contact_phone: string;
  license_number: string;
  default_currency: string;
  timezone: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  theme_accent_color: string;
  updated_at: string;
  updated_by: string | null;
}

export type CompanyProfileUpdate = Partial<
  Omit<CompanyProfile, "id" | "updated_at" | "updated_by" | "logo">
>;

export interface IntegrationStatus {
  id: number;
  provider: "paystack" | "cloudinary" | "email" | "sms";
  provider_display: string;
  configured: boolean;
  last_checked_at: string | null;
  last_check_ok: boolean | null;
  notes: string;
}

export interface ApprovalThreshold {
  id: string;
  ceo_approval_min_price: string;
  updated_at: string;
  updated_by: string | null;
}

export interface NotificationPreference {
  id: number;
  event_type: string;
  event_type_display: string;
  enabled: boolean;
}
