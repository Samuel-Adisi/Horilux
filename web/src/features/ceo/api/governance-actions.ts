import { apiClient } from "@/lib/api-client";

export interface GovernanceAction {
  id: string;
  severity: string;
  due: string;
  severity_color: string;
  title: string;
  detail: string;
  cta: string;
  cta_style: string;
  link: string;
}

export async function fetchGovernanceActions(): Promise<GovernanceAction[]> {
  const { data } = await apiClient.get<GovernanceAction[]>("/reports/governance-actions/");
  return data;
}
