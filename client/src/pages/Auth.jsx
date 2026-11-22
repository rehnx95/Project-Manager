import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import { validEmail } from "../utils/validation.js";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const notify = useToast();
  const returnTo = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : search.get("returnTo");

  async function submit(event) {
    event.preventDefault();
    setError("");
    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!validEmail(email)) errors.email = "Please enter a valid email address.";
    if (mode === "signup" && password.length < 6) errors.password = "Password must be at least 6 characters.";
    else if (mode === "login" && !password) errors.password = "Password is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        await authApi.signup({ email, password });
        setMode("login");
        setPassword("");
        notify("Account created. Sign in to continue.");
      } else {
        await signIn({ email, password });
        const safePath = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/dashboard";
        navigate(safePath, { replace: true });
      }
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-layout">
    <section className="auth-brand-panel">
      <Link to="/" className="brand"><span className="brand-mark" />Depot</Link>
      <div className="auth-brand-copy"><h1>Welcome back to your board.</h1><p>Pick up where your team left off.</p></div>
      <p className="auth-footnote">Secure sessions, revoked when you sign out</p>
    </section>
    <section className="auth-form-panel">
      <div className="auth-form-box">
        <div className="auth-switch" role="tablist" aria-label="Account action">
          <button type="button" className={mode === "login" ? "active" : ""} aria-selected={mode === "login"} onClick={() => { setMode("login"); setError(""); setFieldErrors({}); }}>Sign in</button>
          <button type="button" className={mode === "signup" ? "active" : ""} aria-selected={mode === "signup"} onClick={() => { setMode("signup"); setError(""); setFieldErrors({}); }}>Create account</button>
        </div>
        <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
        <form className="form-grid" onSubmit={submit} noValidate>
          <FormField id="auth-email" label="Email" type="email" autoComplete="email" placeholder="you@company.com" value={email} error={fieldErrors.email} onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: "" })); }} />
          <FormField id="auth-password" label="Password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 6 characters" value={password} error={fieldErrors.password} onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: "" })); }} />
          {error && <div className="inline-error" role="alert">{error}</div>}
          <Button type="submit" variant="primary" className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</Button>
        </form>
      </div>
    </section>
  </main>;
}
