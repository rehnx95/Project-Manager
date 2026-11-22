import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { projectsApi } from "../api/client.js";
import { useFetch } from "../hooks/useFetch.js";
import { useToast } from "../components/ToastProvider.jsx";
import Button from "../components/Button.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import FormField from "../components/FormField.jsx";
import LoadState from "../components/LoadState.jsx";
import Modal from "../components/Modal.jsx";
import Pill from "../components/Pill.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import Tabs from "../components/Tabs.jsx";
import ProjectBoard from "./project/ProjectBoard.jsx";
import CrewTab from "./project/CrewTab.jsx";
import ActivityTab from "./project/ActivityTab.jsx";

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const project = useFetch(() => projectsApi.get(id), [id]);
  const [tab, setTab] = useState("board");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [form, setForm] = useState(null);
  const data = project.data;
  const canManage = Boolean(data?.permissions?.can_manage_members);

  function startEdit() {
    setForm({ name: data.project_name, description: data.description || "", status: data.status });
    setError("");
    setEditing(true);
  }
  async function saveProject(event) {
    event.preventDefault();
    setError("");
    setNameError("");
    if (form.name.trim().length < 3) return setNameError("Project name must be at least 3 characters.");
    setBusy(true);
    try {
      await projectsApi.update(id, { ...form, name: form.name.trim() });
      project.refetch();
      setEditing(false);
      notify("Project updated.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteProject() {
    setBusy(true);
    try {
      await projectsApi.delete(id);
      notify("Project deleted.");
      navigate("/dashboard");
    } catch (reason) {
      notify(reason.message, "error");
    } finally {
      setBusy(false);
      setDeleting(false);
    }
  }

  return <LoadState loading={project.loading} error={project.error} empty={!data} emptyTitle="Project not found" onRetry={project.refetch}>
    <div className="breadcrumb"><Link to="/dashboard">Projects</Link> / {data?.project_name}</div>
    <div className="page-heading project-heading">
      <div><h2>{data?.project_name} <Pill value={data?.status} /></h2><p>{data?.description}</p><div className="project-header-progress"><ProgressBar value={data?.task_count ? data.completed_task_count / data.task_count * 100 : 0} /><span className="muted">{data?.completed_task_count || 0}/{data?.task_count || 0} complete</span></div></div>
      {canManage && <div className="project-actions"><Button onClick={startEdit}>Edit</Button><Button variant="danger" onClick={() => setDeleting(true)}>Delete</Button></div>}
    </div>
    <Tabs value={tab} onChange={setTab} items={[{ value: "board", label: "Board" }, { value: "crew", label: "Crew" }, { value: "activity", label: "Activity" }]} />
    <div className="tab-content">
      {tab === "board" && <ProjectBoard project={data} projectId={id} canAdd={canManage} />}
      {tab === "crew" && <CrewTab projectId={id} canManage={canManage} />}
      {tab === "activity" && <ActivityTab projectId={id} />}
    </div>
    <Modal open={editing} onClose={() => setEditing(false)} title="Edit project">
      {form && <form className="form-grid" onSubmit={saveProject} noValidate>
        <FormField id="edit-project-name" label="Name" value={form.name} error={nameError} onChange={(event) => { setForm({ ...form, name: event.target.value }); setNameError(""); }} required />
        <FormField id="edit-project-description" label="Description"><textarea id="edit-project-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField>
        <FormField id="edit-project-status" label="Status"><select id="edit-project-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></FormField>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <div className="form-row"><Button onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></div>
      </form>}
    </Modal>
    <ConfirmDialog open={deleting} title="Delete project?" busy={busy} onCancel={() => setDeleting(false)} onConfirm={deleteProject}>This permanently deletes the project and its tasks.</ConfirmDialog>
  </LoadState>;
}
