import type { ReactNode } from "react";

export function AdminLayout({
  pageTitle: _pageTitle,
  pageSubtitle,
  children,
}: {
  pageTitle?: string;
  pageSubtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <main className="px-3 py-4">
        {pageSubtitle && (
          <div className="mb-5">
            <p className="text-[13px] text-[#8A8578]">{pageSubtitle}</p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
