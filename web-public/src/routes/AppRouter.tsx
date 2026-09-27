import { Routes, Route } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import HomePage from "@/features/home/HomePage";
import ListingsPage from "@/features/listings/ListingsPage";
import PropertyDetailPage from "@/features/property-detail/PropertyDetailPage";
import FavoritesPage from "@/features/favorites/FavoritesPage";
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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/favorites" element={<FavoritesPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
