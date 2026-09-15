import { apiClient } from "@/lib/api-client";

export interface PipelineStage {
  status: string;
  label: string;
  deal_count: number;
  value: number;
}

export interface DealInFlight {
  id: string;
  property_title: string;
  client_name: string;
  agent_name: string;
  price: number;
  status: string;
  status_label: string;
}

export interface SalesPipelineData {
  stages: PipelineStage[];
  deals_in_flight: DealInFlight[];
  lost_count: number;
  total_leads: number;
}

export async function fetchSalesPipeline(): Promise<SalesPipelineData> {
  const { data } = await apiClient.get<SalesPipelineData>("/reports/sales-pipeline/");
  return data;
}
