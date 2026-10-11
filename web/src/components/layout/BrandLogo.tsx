import { useCompanyBrand } from "@/features/admin/api";

/** Company logo from Settings, falling back to the default mark. Reserves space while loading so the old logo does not flash. */
export function BrandLogo({ className }: { className?: string }) {
  const q = useCompanyBrand();
  if (q.isLoading) return <div className={(className ?? "") + " opacity-0"} aria-hidden="true" />;
  return <img src={q.data?.logo || "/logo1.png"} alt="" className={className} />;
}
