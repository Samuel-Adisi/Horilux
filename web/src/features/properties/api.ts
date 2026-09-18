import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cleanParams, type Paginated } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PropertyType = "residential" | "commercial";
export type ListingType = "sale" | "rent";
export type RentalPeriod = "daily" | "monthly" | "yearly";
export type PropertyStatus =
  | "draft"
  | "onboarding"
  | "pending_verification"
  | "verified"
  | "pending_approval"
  | "marketing_ready"
  | "published"
  | "under_offer"
  | "sold_rented"
  | "archived";

export interface PropertyOwner {
  id: string;
  name: string;
  phone: string;
  email: string;
  id_document?: string | null;
  address: string;
  notes: string;
  created_at: string;
}

export interface PropertyMedia {
  id: string;
  property: string;
  file: string;
  media_type: "photo" | "video";
  order: number;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface PropertyDocument {
  id: string;
  property: string;
  file: string;
  doc_type: string;
  uploaded_by: string | null;
  verified: boolean;
  uploaded_at: string;
}

export const CHECKLIST_ITEMS = [
  { key: "owner_info_ok", label: "Owner information confirmed" },
  { key: "price_ok", label: "Price agreed with owner" },
  { key: "location_ok", label: "Location verified" },
  { key: "details_ok", label: "Property details accurate" },
  { key: "photos_ok", label: "Photos uploaded and approved" },
  { key: "documents_ok", label: "Title and documents checked" },
  { key: "commission_agreement_ok", label: "Commission agreement signed" },
] as const;

export type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]["key"];

export type VerificationChecklist = {
  id: string;
  property: string;
  manager_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  is_complete: boolean;
} & Record<ChecklistKey, boolean>;

export interface PropertyListItem {
  id: string;
  title: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: string;
  currency: string;
  location: string;
  region: string;
  bedrooms: number | null;
  bathrooms: number | null;
  status: PropertyStatus;
  status_label: string;
  completion_percent: number;
  agent: string | null;
  agent_name: string | null;
  created_at: string;
  amenities: string[];
  rental_period: RentalPeriod | null;
  sqft: string | null;
  image_url: string | null;
}

export interface PropertyDetail extends Omit<PropertyListItem, "sqft" | "image_url"> {
  address: string;
  land_size: string | null;
  building_size: string | null;
  description: string;
  owner: string;
  owner_detail: PropertyOwner;
  updated_at: string;
  media: PropertyMedia[];
  documents: PropertyDocument[];
  verification: VerificationChecklist | null;
  published_at?: string | null;
  views_count?: number;
  inquiries_count?: number;
}

export interface PropertyInput {
  title: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: string;
  currency: string;
  location: string;
  region?: string;
  address?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  land_size?: string | null;
  building_size?: string | null;
  amenities?: string[];
  rental_period?: RentalPeriod | null;
  description?: string;
  owner: string;
}

export interface OwnerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface PropertiesQuery {
  page?: number;
  status?: string;
  search?: string;
  property_type?: string;
  listing_type?: string;
}

// ---------------------------------------------------------------------------
// Workflow
// ---------------------------------------------------------------------------

export const PROPERTY_STATUS_ORDER: PropertyStatus[] = [
  "draft",
  "onboarding",
  "pending_verification",
  "verified",
  "pending_approval",
  "marketing_ready",
  "published",
  "under_offer",
  "sold_rented",
  "archived",
];

export const PROPERTY_STATUS_LABEL: Record<PropertyStatus, string> = {
  draft: "Draft",
  onboarding: "Onboarding",
  pending_verification: "Pending verification",
  verified: "Verified",
  pending_approval: "Pending approval",
  marketing_ready: "Marketing ready",
  published: "Published",
  under_offer: "Under offer",
  sold_rented: "Sold / rented",
  archived: "Archived",
};

export type PropertyAction =
  | "submit_for_verification"
  | "approve"
  | "mark_marketing_ready"
  | "publish"
  | "mark_under_offer"
  | "mark_sold"
  | "archive";

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export async function fetchProperties(q: PropertiesQuery = {}): Promise<Paginated<PropertyListItem>> {
  const { data } = await apiClient.get<Paginated<PropertyListItem>>("/properties/", {
    params: cleanParams({ page: q.page ?? 1, status: q.status, search: q.search, property_type: q.property_type, listing_type: q.listing_type }),
  });
  return data;
}

export async function fetchProperty(id: string): Promise<PropertyDetail> {
  const { data } = await apiClient.get<PropertyDetail>(`/properties/${id}/`);
  return data;
}

async function fetchOwners(): Promise<PropertyOwner[]> {
  // Owners are few; walk every page so pickers show all of them.
  const all: PropertyOwner[] = [];
  let page = 1;
  for (;;) {
    const { data } = await apiClient.get<Paginated<PropertyOwner>>("/property-owners/", { params: { page } });
    all.push(...data.results);
    if (!data.next || page > 40) break;
    page += 1;
  }
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const propertyKeys = {
  all: ["properties"] as const,
  list: (q: PropertiesQuery) => ["properties", "list", q] as const,
  detail: (id: string) => ["properties", "detail", id] as const,
  owners: ["property-owners"] as const,
};

export function useProperties(q: PropertiesQuery, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: propertyKeys.list(q),
    queryFn: () => fetchProperties(q),
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: propertyKeys.detail(id ?? ""),
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
  });
}

export function usePropertyOwners(enabled = true) {
  return useQuery({ queryKey: propertyKeys.owners, queryFn: fetchOwners, enabled, staleTime: 60_000 });
}

function useInvalidateProperty() {
  const qc = useQueryClient();
  return (property?: PropertyDetail) => {
    if (property) qc.setQueryData(propertyKeys.detail(property.id), property);
    qc.invalidateQueries({ queryKey: propertyKeys.all });
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useCreateProperty() {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async (input: PropertyInput) => (await apiClient.post<PropertyDetail>("/properties/", input)).data,
    onSuccess: (p) => invalidate(p),
  });
}

export function useUpdateProperty(id: string) {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async (input: Partial<PropertyInput>) => (await apiClient.patch<PropertyDetail>(`/properties/${id}/`, input)).data,
    onSuccess: (p) => invalidate(p),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/properties/${id}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export function usePropertyAction(id: string) {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async (action: PropertyAction) =>
      (await apiClient.post<PropertyDetail>(`/properties/${id}/${action}/`)).data,
    onSuccess: (p) => invalidate(p),
  });
}

export function useUpdateChecklist(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ checklistId, patch }: { checklistId: string; patch: Partial<Record<ChecklistKey, boolean>> }) =>
      (await apiClient.patch<VerificationChecklist>(`/verification-checklists/${checklistId}/`, patch)).data,
    onMutate: async ({ patch }) => {
      // Optimistic tick so the checklist feels instant.
      const key = propertyKeys.detail(propertyId);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<PropertyDetail>(key);
      if (prev?.verification) {
        const verification = { ...prev.verification, ...patch };
        verification.is_complete = CHECKLIST_ITEMS.every((i) => verification[i.key]);
        qc.setQueryData<PropertyDetail>(key, { ...prev, verification });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(propertyKeys.detail(propertyId), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) }),
  });
}

export function useUploadMedia(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, order }: { file: File; order: number }) => {
      const form = new FormData();
      form.append("property", propertyId);
      form.append("file", file);
      form.append("media_type", file.type.startsWith("video/") ? "video" : "photo");
      form.append("order", String(order));
      return (await apiClient.post<PropertyMedia>("/property-media/", form)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mediaId: string) => {
      await apiClient.delete(`/property-media/${mediaId}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export function useUploadDocument(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, docType }: { file: File; docType: string }) => {
      const form = new FormData();
      form.append("property", propertyId);
      form.append("file", file);
      form.append("doc_type", docType);
      return (await apiClient.post<PropertyDocument>("/property-documents/", form)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) }),
  });
}

export function useCreateOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: OwnerInput) => (await apiClient.post<PropertyOwner>("/property-owners/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.owners }),
  });
}

export function useUpdateOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<OwnerInput> }) =>
      (await apiClient.patch<PropertyOwner>(`/property-owners/${id}/`, input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.owners }),
  });
}
