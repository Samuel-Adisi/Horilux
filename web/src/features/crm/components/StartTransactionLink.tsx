import { Link } from "react-router-dom";
import { useCan } from "@/features/accounts/permissions";

export function StartTransactionLink({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  const can = useCan();
  if (!can("transaction", "create")) return null;
  return <Link to={to} className={className}>{children}</Link>;
}
