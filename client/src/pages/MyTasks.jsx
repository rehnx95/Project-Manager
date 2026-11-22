import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { projectsApi, tasksApi } from "../api/client.js";
import { useFetch } from "../hooks/useFetch.js";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import LoadState from "../components/LoadState.jsx";
import Pill from "../components/Pill.jsx";

export default function MyTasks() {
  const [params, setParams] = useSearchParams();
  const searchKey = params.toString();
  const query = useMemo(() => {
    const url = new URLSearchParams(searchKey);
    return {
      page: url.get("page") || "1",
      limit: url.get("limit") || "10",
      search: url.get("search") || "",
      priority: url.get("priority") || "",
      completed: url.get("completed") || "",
      sort: url.get("sort") || "created_at",
      order: url.get("order") || "desc",
    };
  }, [searchKey]);
  const tasks = useFetch(() => tasksApi.list(query), [searchKey]);
  const projects = useFetch(projectsApi.list);
  const [search, setSearch] = useState(query.search);
  const projectNames = new Map((projects.data || []).map((project) => [project.id, project.project_name]));
  const rows = Array.isArray(tasks.data?.value) ? tasks.data.value : [];
  const totalPages = tasks.data?.total_pages || 1;
  const currentPage = Number(query.page) || 1;

  useEffect(() => setSearch(query.search), [query.search]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== query.search) updateParams({ search, page: "1" }, true);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, query.search, searchKey]);

  function updateParams(updates, replace = false) {
    const next = new URLSearchParams(searchKey);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!next.has("limit")) next.set("limit", "10");
    if (!next.has("sort")) next.set("sort", "created_at");
    if (!next.has("order")) next.set("order", "desc");
    setParams(next, { replace });
  }

  return <section>
    <div className="page-heading"><div><h2>My Tasks</h2><p>Across every project you belong to.</p></div></div>
    <div className="task-filters">
      <FormField id="task-search" label="Search tasks" type="search" placeholder="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} />
      <FormField id="task-priority" label="Priority"><select id="task-priority" value={query.priority} onChange={(event) => updateParams({ priority: event.target.value, page: "1" })}><option value="">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></FormField>
      <FormField id="task-status" label="Status"><select id="task-status" value={query.completed} onChange={(event) => updateParams({ completed: event.target.value, page: "1" })}><option value="">All statuses</option><option value="false">To do</option><option value="true">Done</option></select></FormField>
      <FormField id="task-sort" label="Sort"><select id="task-sort" value={query.sort} onChange={(event) => updateParams({ sort: event.target.value, page: "1" })}><option value="created_at">Created</option><option value="due_date">Due date</option><option value="title">Title</option><option value="priority">Priority</option></select></FormField>
      <FormField id="task-order" label="Order"><select id="task-order" value={query.order} onChange={(event) => updateParams({ order: event.target.value, page: "1" })}><option value="desc">Newest first</option><option value="asc">Oldest first</option></select></FormField>
    </div>
    <div className="card list-table">
      <LoadState loading={tasks.loading} error={tasks.error} empty={!rows.length} emptyTitle="No tasks match these filters" onRetry={tasks.refetch}>
        <table><thead><tr><th>Task</th><th>Project</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead><tbody>{rows.map((task) => <tr key={task.id}>
          <td><Link className="task-table-link" to={`/tasks/${task.id}`}>{task.title}</Link></td>
          <td><Link className="project-table-link" to={`/projects/${task.project_id}`}>{projectNames.get(task.project_id) || "Project"}</Link></td>
          <td><Pill kind="priority" value={task.priority} /></td>
          <td>{formatDate(task.due_date)}</td>
          <td><Pill value={task.completed ? "completed" : "active"} /></td>
        </tr>)}</tbody></table>
      </LoadState>
    </div>
    <div className="pagination"><Button size="small" disabled={currentPage <= 1} onClick={() => updateParams({ page: String(currentPage - 1) })}>‹ &nbsp;Prev</Button><span>Page {currentPage} of {totalPages}</span><Button size="small" disabled={currentPage >= totalPages} onClick={() => updateParams({ page: String(currentPage + 1) })}>Next &nbsp;›</Button></div>
  </section>;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
