import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tasksApi } from "../api/client.js";
import { useFetch } from "../hooks/useFetch.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import Button from "../components/Button.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import FormField from "../components/FormField.jsx";
import LoadState from "../components/LoadState.jsx";
import Modal from "../components/Modal.jsx";
import Pill from "../components/Pill.jsx";
import TaskComments from "./task/TaskComments.jsx";
import TaskProperties from "./task/TaskProperties.jsx";

export default function Task() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { user } = useAuth();
  const task = useFetch(() => tasksApi.get(id), [id]);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState("");
  const data = task.data;
  const canEdit = Boolean(data?.permissions?.can_edit);

  function beginEdit() {
    setForm({ title: data.title, priority: data.priority, due_date: toLocalDate(data.due_date) });
    setError("");
    setEditing(true);
  }
  async function saveTask(event) {
    event.preventDefault();
    setError("");
    setTitleError("");
    if (!form.title.trim()) return setTitleError("Title is required.");
    setBusy(true);
    try {
      await tasksApi.update(id, {
        title: form.title.trim(),
        priority: form.priority,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      });
      task.refetch();
      setEditing(false);
      notify("Task updated.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }
  async function toggleComplete() {
    const previous = data;
    task.setData({ ...previous, completed: !previous.completed });
    try {
      await tasksApi.complete(id);
      task.refetch();
    } catch (reason) {
      task.setData(previous);
      notify(reason.message, "error");
    }
  }
  async function deleteTask() {
    setBusy(true);
    try {
      await tasksApi.delete(id);
      notify("Task deleted.");
      navigate(`/projects/${data.project_id}`);
    } catch (reason) {
      notify(reason.message, "error");
    } finally {
      setBusy(false);
      setDeleting(false);
    }
  }

  return <LoadState loading={task.loading} error={task.error} empty={!data} emptyTitle="Task not found" onRetry={task.refetch}>
    <div className="breadcrumb"><Link to={`/projects/${data.project_id}`}>{data.project_name || "Project"}</Link> / Task #{data.id}</div>
    <div className="page-heading task-heading">
      <div className="task-title-wrap"><button type="button" className={`check-button task-title-check${data.completed ? " checked" : ""}`} aria-label={data.completed ? "Mark task as not done" : "Mark task complete"} onClick={toggleComplete} disabled={!data.permissions?.can_complete}>{data.completed ? "✓" : ""}</button><div><h2>{data.title}</h2><p>{!canEdit ? "Only the task creator, an assignee, or a project owner can edit or complete this task." : "Keep the work and conversation together."}</p></div></div>
      <div className="task-header-pills"><Pill kind="priority" value={data.priority} /><Pill value={data.completed ? "completed" : "active"} /></div>
    </div>
    <div className="task-detail-grid">
      <div className="task-main-column">
        <section className="card card-pad">
          <div className="row-between"><h3 className="section-title">Task details</h3><Button size="small" disabled={!canEdit} onClick={beginEdit}>Edit</Button></div>
          <dl className="detail-list"><div><dt>Due date</dt><dd>{formatDate(data.due_date)}</dd></div><div><dt>Created</dt><dd>{formatDate(data.created_at)}</dd></div></dl>
        </section>
        <TaskComments task={data} currentUser={user} />
      </div>
      <TaskProperties task={data} onTaskChange={task.refetch} />
    </div>
    <ModalEdit open={editing} form={form} setForm={setForm} error={error} titleError={titleError} setTitleError={setTitleError} busy={busy} onClose={() => setEditing(false)} onSubmit={saveTask} />
    <ConfirmDialog open={deleting} title="Delete task?" busy={busy} onCancel={() => setDeleting(false)} onConfirm={deleteTask}>This permanently deletes the task and its comments.</ConfirmDialog>
    {data.permissions?.can_delete && <div className="task-delete-row"><Button variant="danger" onClick={() => setDeleting(true)}>Delete task</Button></div>}
  </LoadState>;
}

function ModalEdit({ open, form, setForm, error, titleError, setTitleError, busy, onClose, onSubmit }) {
  if (!form) return null;
  return <Modal open={open} onClose={onClose} title="Edit task"><form className="form-grid" onSubmit={onSubmit} noValidate>
    <FormField id="edit-task-title" label="Title" value={form.title} error={titleError} onChange={(event) => { setForm({ ...form, title: event.target.value }); setTitleError(""); }} required />
    <FormField id="edit-task-priority" label="Priority"><select id="edit-task-priority" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></FormField>
    <FormField id="edit-task-date" label="Due date" type="datetime-local" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} />
    {error && <div className="inline-error" role="alert">{error}</div>}
    <div className="form-row"><Button onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></div>
  </form></Modal>;
}

function toLocalDate(value) {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
