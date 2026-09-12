export type CampaignStatus = "draft" | "review" | "scheduled" | "published" | string;

export interface CampaignPerformance {
  id: string;
  campaign: string; // campaign id
  views: number;
  enquiries: number;
  leads_generated: number;
  viewings_booked: number;
  conversions: number;
  recorded_at: string;
}

export interface CampaignContent {
  headline?: string;
  [key: string]: unknown;
}

export interface Campaign {
  id: string;
  property: string; // property id
  status: CampaignStatus;
  content: CampaignContent;
  scheduled_date: string | null;
  published_date: string | null;
  created_by: string; // user id
  created_at: string;
  performance_records: CampaignPerformance[];
}

export interface CreateCampaignPayload {
  property: string;
  content: CampaignContent;
}

export interface SchedulePayload {
  scheduled_date: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
