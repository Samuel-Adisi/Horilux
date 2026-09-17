import { Construction } from "lucide-react";

interface CeoComingSoonPageProps {
  title?: string;
  description?: string;
}

export default function CeoComingSoonPage({
  title = "Coming Soon",
  description = "This feature is on our roadmap and will be available in a future update.",
}: CeoComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
        <Construction className="w-6 h-6 text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
      <p className="text-sm text-slate-400 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}
