import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== "admin") return <EmptyState title="Admin access only">This page is available to administrator accounts.</EmptyState>;
  return children;
}
