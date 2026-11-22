import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import { getPendingProfile } from "../utils/pendingProfile.js";

export default function ProtectedRoute({ children }) {
  const { token, user } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  const pendingProfile = getPendingProfile();
  if (pendingProfile?.email === user?.email && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace state={{ from: location }} />;
  }
  return <><Navbar /><main className="app-content">{children}</main></>;
}
