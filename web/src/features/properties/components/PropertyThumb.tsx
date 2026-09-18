import { useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertyThumb({ src, className }: { src: string | null | undefined; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className={cn("flex shrink-0 items-center justify-center rounded-sm bg-surface-hover text-ink-faint", className)}>
        <Building2 className="size-4" />
      </div>
    );
  }
  return <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} className={cn("shrink-0 rounded-sm object-cover", className)} />;
}
