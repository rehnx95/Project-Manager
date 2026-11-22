import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { commentsApi, usersApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { useToast } from "../components/ToastProvider.jsx";
import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import FormField from "../components/FormField.jsx";
import LoadState from "../components/LoadState.jsx";
import Pill from "../components/Pill.jsx";
import { validEmail } from "../utils/validation.js";
import ProfileSetup from "./ProfileSetup.jsx";
import { getPendingProfile } from "../utils/pendingProfile.js";

const sections = [{ key: "profile", label: "Profile" }, { key: "account", label: "Account" }, { key: "comments", label: "My comments" }];

export default function Profile() {
  const { user } = useAuth();
  const pendingProfile = getPendingProfile();
  if (pendingProfile?.email === user?.email) return <ProfileSetup pendingProfile={pendingProfile} />;
  return <ProfileContent />;
}

function ProfileContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const notify = useToast();
  const profile = useFetch(usersApi.profile);
  const comments = useFetch(commentsApi.listForUser);
  const [section, setSection] = useState("profile");
  const [form, setForm] = useState({ name: "", bio: "" });
  const [email, setEmail] = useState(user?.email || "");
  const [profileReady, setProfileReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const profileMissing = profile.error?.status === 404;
  const profileData = profile.data;
  const commentList = Array.isArray(comments.data) ? comments.data : [];

  useEffect(() => {
    if (profileData && !profileReady) {
      setForm({ name: profileData.name || "", bio: profileData.bio || "" });
      setProfileReady(true);
    }
  }, [profileData, profileReady]);

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    const validation = {};
    if (!form.name.trim()) validation.name = "Name is required.";
    if (!form.bio.trim()) validation.bio = "Bio is required.";
    setFieldErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    try {
      if (profileMissing) await usersApi.createProfile({ name: form.name.trim(), bio: form.bio.trim() });
      else await usersApi.updateProfile({ name: form.name.trim(), bio: form.bio.trim() });
      profile.refetch();
      notify("Profile saved.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }
  async function updateEmail(event) {
    event.preventDefault();
    setError("");
    if (!email.trim()) return setFieldErrors({ email: "Email is required." });
    if (!validEmail(email)) return setFieldErrors({ email: "Please enter a valid email address." });
    setFieldErrors({});
    setBusy(true);
    try {
      await usersApi.updateEmail({ email: email.trim() });
      notify("Email updated. Sign in again if your session expires.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteAccount() {
    setBusy(true);
    try {
      await usersApi.deleteAccount();
      await signOut(false);
      navigate("/login");
    } catch (reason) {
      notify(reason.message, "error");
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  }
  async function deleteComment(commentId) {
    try {
      await commentsApi.deleteForUser(commentId);
      comments.refetch();
      notify("Comment deleted.");
    } catch (reason) {
      notify(reason.message, "error");
    }
  }

  return <div className="two-column profile-layout">
    <nav className="subnav" aria-label="Profile sections">{sections.map((item) => <button key={item.key} type="button" className={section === item.key ? "active" : ""} onClick={() => setSection(item.key)}>{item.label}</button>)}</nav>
    <div className="profile-sections">
      {section === "profile" && <section className="card card-pad">
        <div className="profile-identity"><Avatar name={profileData?.name} email={user?.email} size="large" /><div><h3>{profileData?.name || user?.email}</h3><p className="muted">{profileData?.bio || "Add a short bio for your teammates."}</p></div></div>
        <LoadState loading={profile.loading} error={profile.error && !profileMissing ? profile.error : null} onRetry={profile.refetch}>
          <form className="form-grid profile-form" onSubmit={saveProfile} noValidate><FormField id="profile-name" label="Name" value={form.name} error={fieldErrors.name} onChange={(event) => { setForm({ ...form, name: event.target.value }); setFieldErrors({ ...fieldErrors, name: "" }); }} required /><FormField id="profile-bio" label="Bio" error={fieldErrors.bio}><textarea id="profile-bio" value={form.bio} onChange={(event) => { setForm({ ...form, bio: event.target.value }); setFieldErrors({ ...fieldErrors, bio: "" }); }} required /></FormField>{error && <div className="inline-error" role="alert">{error}</div>}<Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving…" : profileMissing ? "Create profile" : "Save profile"}</Button></form>
        </LoadState>
      </section>}
      {section === "account" && <section className="card card-pad"><h3>Account</h3><form className="form-grid account-form" onSubmit={updateEmail} noValidate><FormField id="account-email" label="Email" type="email" value={email} error={fieldErrors.email} onChange={(event) => { setEmail(event.target.value); setFieldErrors({ ...fieldErrors, email: "" }); }} required />{error && <div className="inline-error" role="alert">{error}</div>}<Button type="submit" disabled={busy}>{busy ? "Updating…" : "Update email"}</Button></form><hr /><div className="danger-zone"><h3>Danger zone</h3><p>Leave all projects first, then delete your account.</p><Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete my account</Button></div></section>}
      {section === "comments" && <section className="card card-pad"><h3>My comments</h3><LoadState loading={comments.loading} error={comments.error} empty={!commentList.length} emptyTitle="No comments yet" onRetry={comments.refetch}><div className="my-comments">{commentList.map((comment) => <article key={comment.id}><div><p>“{comment.body}”</p><span className="muted">Task #{comment.task_id}</span></div><div className="row-between"><Link to={`/tasks/${comment.task_id}`}>Open task</Link><Button size="small" onClick={() => deleteComment(comment.id)}>Delete</Button></div></article>)}</div></LoadState></section>}
    </div>
    <ConfirmDialog open={confirmDelete} title="Delete your account?" busy={busy} onCancel={() => setConfirmDelete(false)} onConfirm={deleteAccount}>This cannot be undone. Leave all projects before deleting the account.</ConfirmDialog>
  </div>;
}
