import { useEffect, useState } from "react";
import { useDebounced } from "./use-debounced";

/**
 * Local text state for a search input that writes to the URL after a pause,
 * so typing stays instant while queries fire only once the user stops.
 */
export function useSearchBox(urlValue: string, commit: (v: string) => void) {
  const [text, setText] = useState(urlValue);
  const debounced = useDebounced(text, 350);

  useEffect(() => {
    if (debounced.trim() !== urlValue) commit(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return [text, setText] as const;
}
