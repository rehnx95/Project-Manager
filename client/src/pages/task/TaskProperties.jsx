import { useState } from "react";
import { membersApi, projectsApi, tagsApi } from "../../api/client.js";
import { useFetch } from "../../hooks/useFetch.js";
import { useToast } from "../../components/ToastProvider.jsx";
import Avatar from "../../components/Avatar.jsx";
import Button from "../../components/Button.jsx";
import FormField from "../../components/FormField.jsx";
import LoadState from "../../components/LoadState.jsx";
import Pill from "../../components/Pill.jsx";

export default function TaskProperties({ task }) {
  const notify = useToast();
  const assignees = useFetch(() => membersApi.assignees(task.id), [task.id]);
  const members = useFetch(() => membersApi.list(task.project_id), [task.project_id]);
  const tags = useFetch(() => tagsApi.listForTask(task.id), [task.id]);
  const allTags = useFetch(() => tagsApi.listForProject(task.project_id), [task.project_id]);
  const [assigneeId, setAssigneeId] = useState("");
  const [tagId, setTagId] = useState("");
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isOwner = Boolean(task.permissions?.can_delete);
  const assigned = assignees.data || [];
  const attached = tags.data || [];
  const projectMembers = members.data || [];
  const availableMembers = projectMembers.filter((member) => !assigned.some((person) => person.id === member.user_id));
  const availableTags = (allTags.data || []).filter((tag) => !attached.some((item) => item.id === tag.id));

  async function assign() {
    if (!assigneeId) return;
    setBusy(true); setError("");
    try { await membersApi.assign(task.id, assigneeId); setAssigneeId(""); assignees.refetch(); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  async function unassign(userId) {
    setError("");
    try { await membersApi.unassign(task.id, userId); assignees.refetch(); }
    catch (reason) { setError(reason.message); }
  }
  async function attachTag() {
    if (!tagId) return;
    setBusy(true); setError("");
    try { await tagsApi.addToTask(task.id, tagId); tags.refetch(); allTags.refetch(); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  async function detachTag(id) {
    try { await tagsApi.removeFromTask(task.id, id); tags.refetch(); allTags.refetch(); }
    catch (reason) { notify(reason.message, "error"); }
  }
  async function createTag(event) {
    event.preventDefault();
    setError("");
    if (!tagName.trim()) return setError("Tag name is required.");
    setBusy(true);
    try {
      const created = await tagsApi.createForProject(task.project_id, { tag_name: tagName.trim() });
      await tagsApi.addToTask(task.id, created.id);
      setTagName(""); tags.refetch(); allTags.refetch();
      notify("Tag created.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }
  return <aside className="card card-pad properties-panel">
    <div className="property-group"><span>Status</span><Pill value={task.completed ? "completed" : "active"} /></div>
    <div className="property-group"><span>Priority</span><Pill kind="priority" value={task.priority} /></div>
    <div className="property-group"><span>Due date</span><strong>{task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "No due date"}</strong></div>
    <div className="property-group"><span>Assignees</span>
      <LoadState loading={assignees.loading} error={assignees.error} empty={!assigned.length} emptyTitle="No assignees" onRetry={assignees.refetch}>
        {assigned.map((person) => {
          const member = projectMembers.find((item) => item.user_id === person.id);
          return <div className="property-assignee" key={person.id}><Avatar name={member?.name} email={person.email} size="small" /><span className="member-name">{member?.name || person.email}</span>{isOwner && <Button variant="ghost" size="small" aria-label={`Unassign ${person.email}`} onClick={() => unassign(person.id)}>×</Button>}</div>;
        })}
      </LoadState>
      {isOwner && <div className="property-action"><FormField id="assign-user" label="Assign to member"><select id="assign-user" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="">Select a person</option>{availableMembers.map((member) => <option key={member.user_id} value={member.user_id}>{member.name || member.email}</option>)}</select></FormField><Button size="small" disabled={!assigneeId || busy} onClick={assign}>Assign</Button></div>}
    </div>
    <div className="property-group"><span>Tags</span>
      <LoadState loading={tags.loading} error={tags.error} empty={!attached.length} emptyTitle="No tags" onRetry={tags.refetch}><div className="tag-list">{attached.map((tag) => <span className="tag" key={tag.id}>{tag.tag_name}<button type="button" aria-label={`Remove ${tag.tag_name}`} onClick={() => detachTag(tag.id)}>×</button></span>)}</div></LoadState>
      <div className="property-action"><FormField id="attach-tag" label="Attach tag"><select id="attach-tag" value={tagId} onChange={(event) => setTagId(event.target.value)}><option value="">Select a tag</option>{availableTags.map((tag) => <option key={tag.id} value={tag.id}>{tag.tag_name}</option>)}</select></FormField><Button size="small" disabled={!tagId || busy} onClick={attachTag}>Attach</Button></div>
      {isOwner && <form className="property-action" onSubmit={createTag}><FormField id="create-tag" label="Create tag"><input id="create-tag" value={tagName} onChange={(event) => setTagName(event.target.value)} placeholder="New tag" /></FormField><Button type="submit" size="small" disabled={busy}>Create</Button></form>}
    </div>
    {!task.permissions?.can_edit && <p className="permission-note">You can view this task, but only its creator, an assignee, or a project owner can edit or complete it.</p>}
    {error && <div className="inline-error" role="alert">{error}</div>}
  </aside>;
}
