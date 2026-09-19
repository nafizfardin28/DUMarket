import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SellerRoute from "./components/SellerRoute";
import { useAuth } from "./context/AuthContext";
import BrowseListingsPage from "./pages/BrowseListingsPage";
import CreateListingPage from "./pages/CreateListingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import LoginPage from "./pages/LoginPage";
import MyListingsPage from "./pages/MyListingsPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-stone-500">Loading…</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/listings" replace />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Browsing is open to every DU student, logged in or not. */}
      <Route path="/listings" element={<BrowseListingsPage />} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings/new"
        element={
          <ProtectedRoute>
            <SellerRoute>
              <CreateListingPage />
            </SellerRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-listings"
        element={
          <ProtectedRoute>
            <SellerRoute>
              <MyListingsPage />
            </SellerRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/listings" replace />} />
    </Routes>
  );
}
