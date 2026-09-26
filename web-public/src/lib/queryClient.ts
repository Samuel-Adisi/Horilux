import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
    },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "horilux-public-query-cache-v2",
});
