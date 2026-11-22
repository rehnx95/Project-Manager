import { useState } from "react";
import { notesApi } from "../api/client.js";
import { useFetch } from "../hooks/useFetch.js";
import { useToast } from "../components/ToastProvider.jsx";
import Button from "../components/Button.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import FormField from "../components/FormField.jsx";
import LoadState from "../components/LoadState.jsx";

export default function Notes() {
  const notify = useToast();
  const notes = useFetch(notesApi.list);
  const [form, setForm] = useState({ title: "", body: "" });
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const list = Array.isArray(notes.data) ? notes.data : [];

  async function createNote(event) {
    event.preventDefault();
    setError("");
    const validation = {};
    if (!form.title.trim()) validation.title = "Title is required.";
    if (!form.body.trim()) validation.body = "Body is required.";
    setFieldErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    try {
      await notesApi.create({ title: form.title.trim(), body: form.body.trim() });
      setForm({ title: "", body: "" });
      notes.refetch();
      notify("Note saved.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }
  function beginEdit(note) {
    setEditing(note.id);
    setDraft({ title: note.title, body: note.body });
    setError("");
    setFieldErrors({});
  }
  async function saveEdit(noteId) {
    const validation = {};
    if (!draft.title.trim()) validation.title = "Title is required.";
    if (!draft.body.trim()) validation.body = "Body is required.";
    setFieldErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true); setError("");
    try {
      await notesApi.update(noteId, { title: draft.title.trim(), body: draft.body.trim() });
      setEditing(null); setDraft(null); notes.refetch(); notify("Note updated.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteNote(noteId) {
    try {
      await notesApi.delete(noteId);
      notes.refetch();
      notify("Note deleted.");
    } catch (reason) {
      notify(reason.message, "error");
    }
  }
  async function clearNotes() {
    setBusy(true);
    try {
      await notesApi.clear();
      setConfirmClear(false);
      notes.refetch();
      notify("All notes cleared.");
    } catch (reason) {
      notify(reason.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return <section>
    <div className="page-heading"><div><h2>Notes</h2><p>Private, only visible to you.</p></div><Button variant="danger" onClick={() => setConfirmClear(true)} disabled={!list.length}>Clear all</Button></div>
    <form className="card card-pad note-compose form-grid" onSubmit={createNote} noValidate>
      <FormField id="note-title" label="Title" placeholder="Title" value={form.title} error={fieldErrors.title} onChange={(event) => { setForm({ ...form, title: event.target.value }); setFieldErrors({ ...fieldErrors, title: "" }); }} required />
      <FormField id="note-body" label="Note" error={fieldErrors.body}><textarea id="note-body" placeholder="Take a note…" value={form.body} onChange={(event) => { setForm({ ...form, body: event.target.value }); setFieldErrors({ ...fieldErrors, body: "" }); }} required /></FormField>
      {error && !editing && <div className="inline-error" role="alert">{error}</div>}
      <div className="form-row"><Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving…" : "Save note"}</Button></div>
    </form>
    <LoadState loading={notes.loading} error={notes.error} empty={!list.length} emptyTitle="No notes yet" onRetry={notes.refetch}>
      <div className="notes-grid">{list.map((note) => <article className="note-card" key={note.id}>
        {editing === note.id ? <div className="form-grid"><FormField id={`edit-note-title-${note.id}`} label="Title" value={draft.title} error={fieldErrors.title} onChange={(event) => { setDraft({ ...draft, title: event.target.value }); setFieldErrors({ ...fieldErrors, title: "" }); }} /><FormField id={`edit-note-body-${note.id}`} label="Note" error={fieldErrors.body}><textarea id={`edit-note-body-${note.id}`} value={draft.body} onChange={(event) => { setDraft({ ...draft, body: event.target.value }); setFieldErrors({ ...fieldErrors, body: "" }); }} /></FormField>{error && <div className="inline-error" role="alert">{error}</div>}<div className="form-row"><Button size="small" onClick={() => { setEditing(null); setError(""); setFieldErrors({}); }}>Cancel</Button><Button size="small" variant="primary" disabled={busy} onClick={() => saveEdit(note.id)}>Save</Button></div></div>
          : <><div className="note-title-row"><h3>{note.title}</h3><div><Button variant="ghost" size="small" onClick={() => beginEdit(note)}>Edit</Button><Button variant="ghost" size="small" onClick={() => deleteNote(note.id)}>Delete</Button></div></div><p>{note.body}</p></>}
      </article>)}</div>
    </LoadState>
    <ConfirmDialog open={confirmClear} title="Clear all notes?" busy={busy} onCancel={() => setConfirmClear(false)} onConfirm={clearNotes}>This will permanently delete every note in your account.</ConfirmDialog>
  </section>;
}
