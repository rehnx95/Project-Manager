import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usersApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import { clearPendingProfile } from "../utils/pendingProfile.js";

export default function ProfileSetup({ pendingProfile }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const notify = useToast();
  const [form, setForm] = useState({ name: pendingProfile.name || "", bio: pendingProfile.bio || "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.bio.trim()) errors.bio = "Bio is required.";
    setFieldErrors(errors);
    setError("");
    if (Object.keys(errors).length) return;

    setBusy(true);
    try {
      const userSuffix = String(user.id || "").replace(/[^a-z0-9]/gi, "").slice(-12).toLowerCase();
      await usersApi.createProfile({
        name: form.name.trim(),
        bio: form.bio.trim(),
        username: `member-${userSuffix}`,
      });
      clearPendingProfile();
      notify("Profile created.");
      const destination = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search || ""}`
        : "/dashboard";
      navigate(destination, { replace: true });
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="profile-setup card card-pad">
    <span className="eyebrow">One last step</span>
    <h2>Tell your teammates about you</h2>
    <p className="muted">Add your name and a short bio so your team knows who’s who.</p>
    <form className="form-grid" onSubmit={submit} noValidate>
      <FormField id="setup-name" label="Name" value={form.name} error={fieldErrors.name} onChange={(event) => { setForm((current) => ({ ...current, name: event.target.value })); setFieldErrors((current) => ({ ...current, name: "" })); }} required />
      <FormField id="setup-bio" label="Bio" error={fieldErrors.bio}><textarea id="setup-bio" value={form.bio} onChange={(event) => { setForm((current) => ({ ...current, bio: event.target.value })); setFieldErrors((current) => ({ ...current, bio: "" })); }} required /></FormField>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <div className="form-row"><Button type="submit" variant="primary" disabled={busy}>{busy ? "Creating profile…" : "Continue to Depot"}</Button></div>
    </form>
  </section>;
}
