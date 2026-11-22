import { useState } from "react";
import { usersApi } from "../api/client.js";
import { useFetch } from "../hooks/useFetch.js";
import { useToast } from "../components/ToastProvider.jsx";
import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import LoadState from "../components/LoadState.jsx";
import Pill from "../components/Pill.jsx";
import { validEmail, validUuid } from "../utils/validation.js";

export default function Admin() {
  const notify = useToast();
  const users = useFetch(usersApi.list);
  const [lookupId, setLookupId] = useState("");
  const [lookup, setLookup] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [lookupIdError, setLookupIdError] = useState("");
  const [editEmailError, setEditEmailError] = useState("");
  const [busy, setBusy] = useState(false);
  const list = Array.isArray(users.data) ? users.data : [];

  async function findUser(event) {
    event.preventDefault();
    setLookupError(""); setLookup(null); setLookupIdError("");
    if (!validUuid(lookupId)) return setLookupIdError("Enter a valid user ID.");
    setLookupBusy(true);
    try { setLookup(await usersApi.get(lookupId.trim())); }
    catch (reason) { setLookupError(reason.message); }
    finally { setLookupBusy(false); }
  }
  function beginEdit(user) {
    setEditId(user.id);
    setEditEmail(user.email);
    setEditEmailError("");
  }
  async function saveEmail(event) {
    event.preventDefault();
    setEditEmailError("");
    if (!validEmail(editEmail)) return setEditEmailError("Please enter a valid email address.");
    setBusy(true);
    try {
      await usersApi.updateOtherEmail(editId, { email: editEmail.trim() });
      setEditId(null); users.refetch();
      if (lookup?.id === editId) setLookup({ ...lookup, email: editEmail.trim() });
      notify("Email updated.");
    } catch (reason) {
      setEditEmailError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  return <section>
    <div className="page-heading"><div><h2>Users</h2><p>Admin only. Manage every registered account.</p></div></div>
    <div className="admin-grid">
      <div className="card list-table">
        <LoadState loading={users.loading} error={users.error} empty={!list.length} emptyTitle="No users found" onRetry={users.refetch}>
          <table><thead><tr><th>User</th><th>Role</th><th>ID</th><th /></tr></thead><tbody>{list.map((person) => <tr key={person.id}>
            <td><div className="user-cell"><Avatar email={person.email} size="small" />{person.email}</div></td>
            <td><Pill kind="role" value={person.role} /></td>
            <td><span title={person.id}>{shortId(person.id)}</span></td>
            <td>{editId === person.id ? <form className="inline-email-form" onSubmit={saveEmail}><input aria-label={`New email for ${person.email}`} type="email" value={editEmail} onChange={(event) => { setEditEmail(event.target.value); setEditEmailError(""); }} required /><Button type="submit" size="small" disabled={busy}>Save</Button><Button size="small" onClick={() => setEditId(null)}>Cancel</Button>{editEmailError && <span className="field-error">{editEmailError}</span>}</form> : <Button size="small" onClick={() => beginEdit(person)}>Edit email</Button>}</td>
          </tr>)}</tbody></table>
        </LoadState>
      </div>
      <aside className="card card-pad"><h3>Look up by ID</h3><form className="form-grid" onSubmit={findUser} noValidate><FormField id="lookup-user-id" label="User ID" placeholder="uuid" value={lookupId} error={lookupIdError} onChange={(event) => { setLookupId(event.target.value); setLookupIdError(""); }} />{lookupError && <div className="inline-error" role="alert">{lookupError}</div>}<Button type="submit" variant="primary" disabled={lookupBusy}>{lookupBusy ? "Looking up…" : "Look up"}</Button></form>{lookup && <div className="lookup-result"><Avatar email={lookup.email} /><div><strong>{lookup.email}</strong><Pill kind="role" value={lookup.role} /><span>{shortId(lookup.id)}</span></div><Button size="small" onClick={() => beginEdit(lookup)}>Edit email</Button></div>}</aside>
    </div>
  </section>;
}

function shortId(value) {
  return value && value.length > 10 ? `${value.slice(0, 4)}…${value.slice(-4)}` : value;
}
