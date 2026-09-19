import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SellerRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== "seller") return <Navigate to="/listings" replace />;
  return children;
}
