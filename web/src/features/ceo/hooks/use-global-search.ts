import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { globalSearch, type GlobalSearchResult } from "../api/global-search";
export type { GlobalSearchResult };

export function useGlobalSearch(rawQuery: string) {
  const [debounced, setDebounced] = useState(rawQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(rawQuery), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const trimmed = debounced.trim();

  return useQuery({
    queryKey: ["global-search", trimmed],
    queryFn: () => globalSearch(trimmed),
    enabled: trimmed.length > 1,
    staleTime: 15_000,
  });
}
