import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse, Lead, Client, CreateLeadPayload } from "../types";

export async function fetchLeads(page: number = 1): Promise<PaginatedResponse<Lead>> {
  const { data } = await apiClient.get<PaginatedResponse<Lead>>("/leads/", {
    params: { page },
  });
  return data;
}

export async function createLead(payload: CreateLeadPayload): Promise<Lead> {
  const { data } = await apiClient.post<Lead>("/leads/", payload);
  return data;
}

export async function qualifyLead(id: string): Promise<Lead> {
  const { data } = await apiClient.post<Lead>(`/leads/${id}/qualify/`);
  return data;
}

export async function convertToClient(id: string): Promise<Client> {
  const { data } = await apiClient.post<Client>(`/leads/${id}/convert_to_client/`);
  return data;
}

export async function fetchClients(): Promise<PaginatedResponse<Client>> {
  const { data } = await apiClient.get<PaginatedResponse<Client>>("/clients/");
  return data;
}

export async function assignLead(id: string, agentId: string): Promise<Lead> {
  const { data } = await apiClient.post<Lead>(`/leads/${id}/assign/`, {
    agent_id: agentId,
  });
  return data;
}
