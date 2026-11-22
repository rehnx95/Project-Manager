import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Project from "./pages/Project.jsx";
import Task from "./pages/Task.jsx";
import MyTasks from "./pages/MyTasks.jsx";
import Notes from "./pages/Notes.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import NotFound from "./pages/NotFound.jsx";
import { getPendingProfile } from "./utils/pendingProfile.js";

function Guard({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  const { token, user } = useAuth();
  const pendingProfile = getPendingProfile();
  const loginDestination = pendingProfile?.email === user?.email ? "/profile" : "/dashboard";
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={token ? <Navigate to={loginDestination} replace /> : <Auth />} />
    <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
    <Route path="/projects/:id" element={<Guard><Project /></Guard>} />
    <Route path="/tasks/:id" element={<Guard><Task /></Guard>} />
    <Route path="/my-tasks" element={<Guard><MyTasks /></Guard>} />
    <Route path="/notes" element={<Guard><Notes /></Guard>} />
    <Route path="/profile" element={<Guard><Profile /></Guard>} />
    <Route path="/admin" element={<Guard><AdminRoute><Admin /></AdminRoute></Guard>} />
    <Route path="*" element={<NotFound />} />
  </Routes>;
}
