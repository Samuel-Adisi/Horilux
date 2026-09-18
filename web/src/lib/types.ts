export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Backend page size (DRF PAGE_SIZE). */
export const PAGE_SIZE = 25;

/** Drops empty values so they never reach the query string. */
export function cleanParams(params: Record<string, string | number | boolean | undefined | null>) {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    out[k] = v;
  }
  return out;
}
