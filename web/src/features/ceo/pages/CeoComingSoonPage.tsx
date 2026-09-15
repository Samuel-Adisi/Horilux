import { useLocation } from "react-router-dom";

export default function CeoComingSoonPage() {
  const location = useLocation();
  const title = location.pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .join(" / ") || "Page";

  return (
    <div className="executive-card bg-[#131926] border border-white/10 p-6 rounded-2xl">
      <h2 className="text-xl font-bold text-white capitalize">{title.replace(/-/g, " ")}</h2>
      <p className="text-xs text-slate-400 mt-2">This page is being built next.</p>
    </div>
  );
}
