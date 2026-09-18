import { Skeleton } from "@/components/ui/display";
import { Page } from "@/components/ui/page";

export function PageFallback() {
  return (
    <div aria-busy="true">
      <Page>
        <Skeleton className="mb-2 h-7 w-56" />
        <Skeleton className="mb-6 h-4 w-80" />
        <Skeleton className="h-80" />
      </Page>
    </div>
  );
}
