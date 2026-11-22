import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "./ToastProvider.jsx";
import Avatar from "./Avatar.jsx";
import Button from "./Button.jsx";
import FormField from "./FormField.jsx";
import Modal from "./Modal.jsx";
import "./Navbar.css";

export default function Navbar({ marketing = false }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const notify = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [testingOpen, setTestingOpen] = useState(false);
  const [testingKey, setTestingKey] = useState("");
  const [testingBusy, setTestingBusy] = useState(false);
  const [testingError, setTestingError] = useState("");
  const profileRef = useRef(null);
  const links = marketing
    ? [{ to: "#features", label: "Features" }, { to: "#how-it-works", label: "How it works" }]
    : [{ to: "/dashboard", label: "Projects" }, { to: "/my-tasks", label: "My Tasks" }, { to: "/notes", label: "Notes" }, ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : [])];

  useEffect(() => {
    function closeProfile(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", closeProfile);
    return () => document.removeEventListener("mousedown", closeProfile);
  }, []);

  async function handleSignOut() {
    setProfileOpen(false);
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      notify(error.message, "error");
      navigate("/login");
    }
  }

  async function openTesting(event) {
    event.preventDefault();
    setTestingError("");
    if (!testingKey.trim()) {
      setTestingError("Enter the owner key.");
      return;
    }
    setTestingBusy(true);
    try {
      const response = await fetch("/testing/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: testingKey.trim() }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const raw = data?.error;
        throw new Error(typeof raw === "string" ? raw : raw?.message || "Owner access denied.");
      }
      window.location.assign("/testing");
    } catch (error) {
      setTestingError(error.message);
    } finally {
      setTestingBusy(false);
    }
  }

  return <><header className={`topbar${marketing ? " topbar-marketing" : ""}`}>
    <div className="topbar-inner">
      <Link to={user ? "/dashboard" : "/"} className="brand" aria-label="Depot home"><span className="brand-mark" />Depot</Link>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
      <nav className={`primary-nav${menuOpen ? " nav-open" : ""}`} aria-label="Main navigation">
        {links.map((link) => marketing
          ? <a key={link.to} href={link.to} onClick={() => setMenuOpen(false)}>{link.label}</a>
          : <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "nav-active" : ""}>{link.label}</NavLink>)}
      </nav>
      {marketing ? <div className="topbar-actions"><Link className="text-link" to={user ? "/dashboard" : "/login"}>{user ? "Open app" : "Sign in"}</Link><Link className="button button-primary button-small" to={user ? "/dashboard" : "/login"}>{user ? "Open app" : "Get started"}</Link></div> :
        <div className="account-actions">
          <Button size="small" onClick={() => { setTestingError(""); setTestingOpen(true); }}>Testing</Button>
          <div className="profile-menu" ref={profileRef}>
            <button type="button" className="avatar-button" aria-label="Account menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}><Avatar name={user?.name} email={user?.email} /></button>
            {profileOpen && <div className="profile-dropdown">
              <div className="dropdown-user"><strong>{user?.name || user?.email}</strong>{user?.name && <span>{user?.email}</span>}</div>
              <Link to="/profile" onClick={() => setProfileOpen(false)}>Profile</Link>
              <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
            </div>}
          </div>
        </div>}
    </div>
  </header>
  <Modal open={testingOpen} onClose={() => setTestingOpen(false)} title="Owner testing console">
    <p className="muted testing-description">Enter your owner key to open the existing API testing console.</p>
    <form className="form-grid" onSubmit={openTesting} noValidate>
      <FormField id="testing-key" label="Owner key" type="password" autoComplete="off" value={testingKey} error={testingError} onChange={(event) => { setTestingKey(event.target.value); setTestingError(""); }} />
      <div className="form-row"><Button onClick={() => setTestingOpen(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={testingBusy}>{testingBusy ? "Checking…" : "Open console"}</Button></div>
    </form>
  </Modal></>;
}
