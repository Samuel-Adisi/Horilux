import { apiClient } from "@/lib/api-client";

export interface RosterAgent {
  id: string;
  name: string;
  email: string;
  department: string;
  date_joined: string;
  deals_closed: number;
  volume: number;
  active_deals: number;
  leads_assigned: number;
  conversion_percent: number;
}

export interface AgentsRosterData {
  agents: RosterAgent[];
  total_agents: number;
}

export async function fetchAgentsRoster(): Promise<AgentsRosterData> {
  const { data } = await apiClient.get<AgentsRosterData>("/reports/agents-roster/");
  return data;
}
