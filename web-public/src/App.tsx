import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, queryPersister } from "@/lib/queryClient";
import AppRouter from "@/routes/AppRouter";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { ensureVisitor } from "@/lib/visitor";

export default function App() {
  useEffect(() => {
    ensureVisitor();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: 24 * 60 * 60_000 }}
    >
      <BrowserRouter>
        <ScrollToTop />
        <AppRouter />
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}
