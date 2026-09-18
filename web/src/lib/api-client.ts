import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./token-storage";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL && import.meta.env.DEV) {
  console.warn("VITE_API_BASE_URL is not set — API requests will hit the dev server. See web/.env.example.");
}

export const apiClient = axios.create({
  baseURL,
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------------------------------------------------------------------------
// Token refresh: one refresh in flight at a time; every 401 waits on it.
// ---------------------------------------------------------------------------

let refreshPromise: Promise<string> | null = null;
let onSessionExpired: (() => void) | null = null;

/** The auth store registers how to tear the session down. */
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

async function refreshAccessToken(): Promise<string> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) throw new Error("No refresh token");
  const { data } = await axios.post<{ access: string; refresh?: string }>(`${baseURL}/auth/refresh/`, { refresh });
  // SimpleJWT with ROTATE_REFRESH_TOKENS returns a new refresh token too.
  tokenStorage.set(data.access, data.refresh ?? refresh);
  return data.access;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthCall = original?.url?.includes("/auth/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall && tokenStorage.getRefresh()) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const access = await refreshPromise;
        original.headers.Authorization = `Bearer ${access}`;
        return apiClient(original);
      } catch (refreshError) {
        tokenStorage.clear();
        onSessionExpired?.();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && !isAuthCall) {
      tokenStorage.clear();
      onSessionExpired?.();
    }

    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Error messages
// ---------------------------------------------------------------------------

function flatten(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).flatMap(flatten);
  return [String(value)];
}

/**
 * Turns a DRF error response into one readable sentence.
 * Handles {detail}, {non_field_errors}, and {field: [msgs]} shapes.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
  if (!error.response) {
    return error.code === "ECONNABORTED" ? "The server took too long to respond." : "Can't reach the server. Check your connection.";
  }
  const data = error.response.data as unknown;
  if (typeof data === "string") {
    return error.response.status >= 500 ? "The server hit an error. Please try again shortly." : fallback;
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    if (typeof obj.error === "string") return obj.error;
    if (obj.non_field_errors) return flatten(obj.non_field_errors).join(" ");
    const fieldMessages = Object.entries(obj).flatMap(([field, msgs]) => {
      const text = flatten(msgs).join(" ");
      if (!text) return [];
      const label = field.replace(/_/g, " ");
      return [`${label.charAt(0).toUpperCase()}${label.slice(1)}: ${text}`];
    });
    if (fieldMessages.length) return fieldMessages.join(" ");
  }
  if (error.response.status === 403) return "You don't have permission to do that.";
  if (error.response.status === 404) return "That record no longer exists.";
  return fallback;
}

/** Field-level errors keyed by field name, for inline form messages. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== "object") return {};
  const out: Record<string, string> = {};
  for (const [field, msgs] of Object.entries(error.response.data as Record<string, unknown>)) {
    if (field === "detail" || field === "non_field_errors") continue;
    const text = flatten(msgs).join(" ");
    if (text) out[field] = text;
  }
  return out;
}

export function getStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
