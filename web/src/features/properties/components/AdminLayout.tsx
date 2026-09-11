import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

export function AdminLayout({
  pageTitle,
  pageSubtitle,
  children,
}: {
  pageTitle: string;
  pageSubtitle?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // adjust to your actual auth flow
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="flex items-center justify-between border-b border-[#E4E1D9] bg-white px-6 py-4">
        <div>
          <h1 className="text-[15px] font-semibold text-[#17131F]">{pageTitle}</h1>
          {pageSubtitle && (
            <p className="mt-0.5 text-[12px] text-[#8A8578]">{pageSubtitle}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-[13px] text-[#3E3A31] hover:text-[#240270]"
        >
          Log out
        </button>
      </header>

      <main className="px-6 py-6">{children}</main>
    </div>
  );
}