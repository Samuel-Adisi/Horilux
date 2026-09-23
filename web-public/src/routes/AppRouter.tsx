import { Routes, Route } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import RequireAuth from "./RequireAuth";
import HomePage from "@/features/home/HomePage";
import ListingsPage from "@/features/listings/ListingsPage";
import PropertyDetailPage from "@/features/property-detail/PropertyDetailPage";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import AccountPage from "@/features/account/AccountPage";
import AboutPage from "@/features/shared/AboutPage";
import ContactPage from "@/features/shared/ContactPage";
import NotFoundPage from "@/features/shared/NotFoundPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<PropertyDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/account" element={<AccountPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
