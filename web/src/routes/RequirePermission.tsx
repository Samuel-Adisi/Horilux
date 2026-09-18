import type { ReactNode } from "react";
import { Page } from "@/components/ui/page";
import { ButtonLink } from "@/components/ui/button";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { can, type Action, type Resource } from "@/features/accounts/permissions";

/** UI-level gate so people don't land on screens that will only return 403s. */
export function RequirePermission({ anyOf, children }: { anyOf: [Resource, Action][]; children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (anyOf.some(([r, a]) => can(user, r, a))) return <>{children}</>;
  return (
    <Page className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-xl font-bold text-ink">You don't have access to this</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">Your role doesn't include this area. If you need it, ask an administrator to update your role.</p>
      <ButtonLink to="/" className="mt-6">
        Go home
      </ButtonLink>
    </Page>
  );
}
