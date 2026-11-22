import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

export default function NotFound() {
  const { user } = useAuth();
  return <><Navbar marketing={!user} /><main className="not-found"><div><h1>Page not found</h1><p>That page doesn't exist or may have moved.</p><Link className="button button-primary" to={user ? "/dashboard" : "/"}>Go back</Link></div></main></>;
}
