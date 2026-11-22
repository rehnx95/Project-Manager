import { useState } from "react";
import { membersApi } from "../../api/client.js";
import { useFetch } from "../../hooks/useFetch.js";
import { useToast } from "../../components/ToastProvider.jsx";
import Avatar from "../../components/Avatar.jsx";
import Button from "../../components/Button.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import FormField from "../../components/FormField.jsx";
import LoadState from "../../components/LoadState.jsx";
import Modal from "../../components/Modal.jsx";
import Pill from "../../components/Pill.jsx";
import { validUuid } from "../../utils/validation.js";

export default function CrewTab({ projectId, canManage }) {
  const notify = useToast();
  const members = useFetch(() => membersApi.list(projectId), [projectId]);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("member");

  async function addMember(event) {
    event.preventDefault();
    setError("");
    setUserIdError("");
    if (!validUuid(userId)) return setUserIdError("Enter a valid user ID.");
    setBusy(true);
    try {
      await membersApi.add(projectId, userId.trim(), { role });
      setAdding(false);
      setUserId("");
      members.refetch();
      notify("Crew member added.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(member, nextRole) {
    try {
      await membersApi.update(projectId, member.user_id, { role: nextRole });
      members.refetch();
      notify("Role updated.");
    } catch (reason) {
      notify(reason.message, "error");
      members.refetch();
    }
  }

  async function removeMember() {
    if (!selected) return;
    setBusy(true);
    try {
      await membersApi.remove(projectId, selected.user_id);
      setSelected(null);
      members.refetch();
      notify("Crew member removed.");
    } catch (reason) {
      notify(reason.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return <section className="card card-pad">
    <div className="row-between crew-heading"><div><h3 className="section-title">Project crew</h3><p className="muted">People working together on this project.</p></div>{canManage && <Button variant="primary" onClick={() => setAdding(true)}>+ Add member</Button>}</div>
    <LoadState loading={members.loading} error={members.error} empty={!members.data?.length} emptyTitle="No crew members" onRetry={members.refetch}>
      <div className="crew-list">{members.data?.map((member) => <div className="crew-item" key={member.user_id}>
        <Avatar name={member.name} email={member.email} size="large" />
        <div className="crew-identity"><strong>{member.name || member.email}</strong><span>{member.email}</span></div>
        {canManage ? <select aria-label={`Role for ${member.name || member.email}`} className="control role-select" value={member.role} onChange={(event) => changeRole(member, event.target.value)}><option value="member">Member</option><option value="owner">Owner</option></select> : <Pill kind="role" value={member.role} />}
        {canManage && <Button variant="danger" size="small" onClick={() => setSelected(member)}>Remove</Button>}
      </div>)}</div>
    </LoadState>
    <Modal open={adding} onClose={() => setAdding(false)} title="Add crew member">
      <form className="form-grid" onSubmit={addMember} noValidate>
        <FormField id="member-id" label="User ID" placeholder="Paste their user ID" value={userId} error={userIdError} onChange={(event) => { setUserId(event.target.value); setUserIdError(""); }} required />
        <FormField id="member-role" label="Role"><select id="member-role" value={role} onChange={(event) => setRole(event.target.value)}><option value="member">Member</option><option value="owner">Owner</option></select></FormField>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <div className="form-row"><Button onClick={() => setAdding(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? "Adding…" : "Add member"}</Button></div>
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(selected)} title="Remove crew member?" busy={busy} onCancel={() => setSelected(null)} onConfirm={removeMember}>This person will lose access to the project. The server will prevent removing the last owner.</ConfirmDialog>
  </section>;
}
