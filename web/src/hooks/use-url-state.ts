import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Filters and pagination live in the URL so views are shareable and survive
 * reloads/back navigation. Changing any filter resets `page`.
 */
export function useUrlState<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams();

  const values = Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ""])) as Record<K, string>;
  const page = Math.max(1, Number(params.get("page")) || 1);

  const set = useCallback(
    (patch: Partial<Record<K | "page", string | number | null>>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const touchesFilter = Object.keys(patch).some((k) => k !== "page");
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === undefined || v === "" || (k === "page" && Number(v) <= 1)) next.delete(k);
            else next.set(k, String(v));
          }
          if (touchesFilter && !("page" in patch)) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { values, page, set };
}
