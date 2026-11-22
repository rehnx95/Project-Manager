import { useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi, projectsApi, usersApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { useToast } from "../components/ToastProvider.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import LoadState from "../components/LoadState.jsx";
import Modal from "../components/Modal.jsx";
import Pill from "../components/Pill.jsx";
import ProgressBar from "../components/ProgressBar.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const notify = useToast();
  const projects = useFetch(projectsApi.list);
  const summary = useFetch(dashboardApi.summary);
  const profile = useFetch(usersApi.profile);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", status: "active" });
  const stats = summary.data || {};
  const greetingName = profile.data?.name || user?.name || (user?.email || "").split("@")[0] || "there";

  async function createProject(event) {
    event.preventDefault();
    setError("");
    setNameError("");
    if (form.name.trim().length < 3) return setNameError("Project name must be at least 3 characters.");
    setBusy(true);
    try {
      await projectsApi.create({ ...form, name: form.name.trim() });
      setCreating(false);
      setForm({ name: "", description: "", status: "active" });
      projects.refetch();
      summary.refetch();
      notify("Project created.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  const projectList = Array.isArray(projects.data) ? projects.data : [];
  return <section>
    <div className="page-heading"><div><h2>Good day, {greetingName}</h2><p>Here's what's happening across your projects.</p></div><Button variant="primary" onClick={() => setCreating(true)}>+ New project</Button></div>
    <div className="stats-grid">
      <Stat label="Projects" value={stats.project_count} />
      <Stat label="Open tasks" value={stats.pending_task_count} />
      <Stat label="Completed" value={stats.completed_task_count} />
      <Stat label="Total" value={stats.task_count} />
    </div>
    <h3>Your projects</h3>
    <LoadState loading={projects.loading} error={projects.error} empty={!projectList.length} emptyTitle="No projects yet" onRetry={projects.refetch}>
      <div className="project-grid">{projectList.map((project) => {
        const total = Number(project.task_count || 0);
        const done = Number(project.completed_task_count || 0);
        return <article className="project-card card" key={project.id}>
          <div className="project-card-title"><h3>{project.project_name}</h3><Pill value={project.status} /></div>
          <p className="project-description">{project.description || "No description yet."}</p>
          <ProgressBar value={total ? done / total * 100 : 0} label={`${project.project_name} completion`} />
          <div className="row-between"><span className="muted">{done} of {total} tasks complete</span><Link className="button" to={`/projects/${project.id}`}>Open</Link></div>
        </article>;
      })}</div>
    </LoadState>
    <Modal open={creating} onClose={() => setCreating(false)} title="New project">
      <form className="form-grid" onSubmit={createProject} noValidate>
        <FormField id="project-name" label="Name" minLength={3} value={form.name} error={nameError} onChange={(event) => { setForm({ ...form, name: event.target.value }); setNameError(""); }} required />
        <FormField id="project-description" label="Description"><textarea id="project-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField>
        <FormField id="project-status" label="Status"><select id="project-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></FormField>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <div className="form-row"><Button onClick={() => setCreating(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? "Creating…" : "Create project"}</Button></div>
      </form>
    </Modal>
  </section>;
}

function Stat({ label, value }) {
  return <article className="stat-card card"><span>{label}</span><strong>{value ?? "—"}</strong></article>;
}
