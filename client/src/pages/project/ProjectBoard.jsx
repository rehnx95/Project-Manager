import { useState } from "react";
import { membersApi, tasksApi, projectsApi } from "../../api/client.js";
import { useFetch } from "../../hooks/useFetch.js";
import { useToast } from "../../components/ToastProvider.jsx";
import Button from "../../components/Button.jsx";
import FormField from "../../components/FormField.jsx";
import LoadState from "../../components/LoadState.jsx";
import Modal from "../../components/Modal.jsx";
import Pill from "../../components/Pill.jsx";
import Avatar from "../../components/Avatar.jsx";

export default function ProjectBoard({ project, projectId, canAdd }) {
  const notify = useToast();
  const board = useFetch(() => projectsApi.tasks(projectId), [projectId]);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [form, setForm] = useState({ title: "", priority: "medium", due_date: "" });
  const tasks = Array.isArray(board.data) ? board.data : [];
  const todo = tasks.filter((task) => !task.completed);
  const done = tasks.filter((task) => task.completed);

  async function createTask(event) {
    event.preventDefault();
    setError("");
    setTitleError("");
    if (!form.title.trim()) return setTitleError("Title is required.");
    setBusy(true);
    try {
      await tasksApi.create(projectId, {
        title: form.title.trim(),
        priority: form.priority,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      });
      setAdding(false);
      setForm({ title: "", priority: "medium", due_date: "" });
      board.refetch();
      notify("Task added.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(task) {
    const previous = tasks;
    board.setData(tasks.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item));
    try {
      await tasksApi.complete(task.id);
      board.refetch();
    } catch (reason) {
      board.setData(previous);
      notify(reason.message, "error");
    }
  }

  const progress = project.task_count ? (project.completed_task_count / project.task_count) * 100 : 0;
  return <>
    {canAdd && <div className="row-between" style={{ marginBottom: 16 }}><span className="muted">{project.completed_task_count || 0} of {project.task_count || 0} tasks complete</span><Button variant="primary" size="small" onClick={() => setAdding(true)}>+ Add task</Button></div>}
    <div className="project-progress"><span className="visually-hidden">Project completion</span><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
    <LoadState loading={board.loading} error={board.error} empty={!tasks.length} emptyTitle="No tasks in this project" onRetry={board.refetch}>
      <div className="board-grid">
        <TaskColumn title="To do" tasks={todo} onToggle={toggleTask} />
        <TaskColumn title="Done" tasks={done} onToggle={toggleTask} />
        <aside className="side-stack board-aside">
          <CrewSummary projectId={projectId} />
          <ActivitySummary projectId={projectId} />
        </aside>
      </div>
    </LoadState>
    <Modal open={adding} onClose={() => setAdding(false)} title="Add task">
      <form className="form-grid" onSubmit={createTask} noValidate>
        <FormField id="task-title" label="Title" value={form.title} error={titleError} onChange={(event) => { setForm({ ...form, title: event.target.value }); setTitleError(""); }} required />
        <FormField id="task-priority" label="Priority"><select id="task-priority" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></FormField>
        <FormField id="task-due" label="Due date (optional)" type="datetime-local" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} />
        {error && <div className="inline-error" role="alert">{error}</div>}
        <div className="form-row"><Button onClick={() => setAdding(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? "Adding…" : "Add task"}</Button></div>
      </form>
    </Modal>
  </>;
}

function TaskColumn({ title, tasks, onToggle }) {
  return <section><div className="board-column-title"><span>{title}</span><span>{tasks.length}</span></div>{tasks.length ? tasks.map((task) => <TaskCard key={task.id} task={task} onToggle={() => onToggle(task)} />) : <div className="column-empty">No tasks here yet.</div>}</section>;
}

function TaskCard({ task, onToggle }) {
  const assignees = useFetch(() => membersApi.assignees(task.id), [task.id]);
  return <article className="task-card card">
    <div className="row-between"><h3>{task.title}</h3><button type="button" className={`check-button${task.completed ? " checked" : ""}`} aria-label={task.completed ? `Mark ${task.title} as not done` : `Mark ${task.title} done`} onClick={onToggle} disabled={!task.permissions?.can_complete}>{task.completed ? "✓" : ""}</button></div>
    <div className="task-badges"><Pill kind="priority" value={task.priority} /></div>
    <div className="task-meta"><span>Due {formatDate(task.due_date)}</span><div className="avatar-group">{(assignees.data || []).map((assignee) => <Avatar key={assignee.id} email={assignee.email} size="small" />)}</div></div>
    <a className="task-card-link" href={`/tasks/${task.id}`}>Open task</a>
  </article>;
}

function CrewSummary({ projectId }) {
  const members = useFetch(() => membersApi.list(projectId), [projectId]);
  return <section className="card card-pad"><h3 className="section-title">Crew</h3><LoadState loading={members.loading} error={members.error} empty={!members.data?.length} emptyTitle="No crew yet" onRetry={members.refetch}>{members.data?.slice(0, 5).map((member) => <div className="member-row" key={member.user_id}><Avatar name={member.name} email={member.email} size="small" /><span className="member-name">{member.name || member.email}</span><Pill kind="role" value={member.role} /></div>)}</LoadState></section>;
}

function ActivitySummary({ projectId }) {
  const activity = useFetch(() => projectsApi.activity(projectId, 5), [projectId]);
  return <section className="card card-pad"><h3 className="section-title">Recent activity</h3><LoadState loading={activity.loading} error={activity.error} empty={!activity.data?.length} emptyTitle="No activity yet" onRetry={activity.refetch}>{activity.data?.slice(0, 3).map((item) => <p className="activity-summary" key={item.id}>{item.actor_email || "A teammate"} {item.action?.replaceAll(".", " ") || "updated the project"} · {formatDate(item.created_at)}</p>)}</LoadState></section>;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
