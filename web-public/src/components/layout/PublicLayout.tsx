import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout() {
  const { pathname } = useLocation();
  const hideHeader = pathname === "/contact";

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {!hideHeader && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
