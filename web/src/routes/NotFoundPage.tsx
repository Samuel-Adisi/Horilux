import { Page } from "@/components/ui/page";
import { ButtonLink } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function NotFoundPage() {
  useDocumentTitle("Not found");
  return (
    <Page className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="num text-sm font-bold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">This page doesn't exist</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">The link may be old, or the record may have been removed.</p>
      <ButtonLink to="/" variant="primary" className="mt-6">
        Go home
      </ButtonLink>
    </Page>
  );
}
