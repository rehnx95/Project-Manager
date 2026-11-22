import { useState } from "react";
import { commentsApi, membersApi } from "../../api/client.js";
import { useFetch } from "../../hooks/useFetch.js";
import { useToast } from "../../components/ToastProvider.jsx";
import Avatar from "../../components/Avatar.jsx";
import Button from "../../components/Button.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import FormField from "../../components/FormField.jsx";
import LoadState from "../../components/LoadState.jsx";

export default function TaskComments({ task, currentUser }) {
  const notify = useToast();
  const comments = useFetch(() => commentsApi.listForTask(task.id), [task.id]);
  const members = useFetch(() => membersApi.list(task.project_id), [task.project_id]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bodyError, setBodyError] = useState("");
  const [clearing, setClearing] = useState(false);
  const names = new Map((members.data || []).map((member) => [member.user_id, member]));
  const list = Array.isArray(comments.data) ? comments.data : [];
  const isOwner = Boolean(task.permissions?.can_delete);

  async function postComment(event) {
    event.preventDefault();
    setError("");
    setBodyError("");
    if (!body.trim()) return setBodyError("Comment is required.");
    setBusy(true);
    try {
      await commentsApi.addToTask(task.id, { new_body: body.trim() });
      setBody("");
      comments.refetch();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
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
  async function clearAll() {
    setBusy(true);
    try {
      await commentsApi.clearForTask(task.id);
      comments.refetch();
      setClearing(false);
      notify("Comments cleared.");
    } catch (reason) {
      notify(reason.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return <section className="card card-pad">
    <div className="row-between"><h3 className="section-title">Comments ({list.length})</h3>{isOwner && <Button variant="danger" size="small" onClick={() => setClearing(true)}>Clear all</Button>}</div>
    <LoadState loading={comments.loading} error={comments.error} empty={!list.length} emptyTitle="No comments yet" onRetry={comments.refetch}>
      <div>{list.map((comment) => {
        const member = names.get(comment.user_id);
        const mine = comment.user_id === currentUser?.id;
        const actor = mine ? (member?.name || "You") : member?.name || member?.email || "Teammate";
        return <article className="comment-item" key={comment.id}><Avatar name={member?.name} email={member?.email || (mine ? currentUser?.email : "")} /><div className="comment-content"><div className="comment-meta"><strong>{actor}</strong><time>{comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ""}</time>{mine && <Button variant="ghost" size="small" onClick={() => deleteComment(comment.id)}>Delete</Button>}</div><p>{comment.body}</p></div></article>;
      })}</div>
    </LoadState>
    <form className="comment-form" onSubmit={postComment} noValidate><FormField id="comment-body" label="Add a comment" error={bodyError}><textarea id="comment-body" placeholder="Write a comment…" value={body} onChange={(event) => { setBody(event.target.value); setBodyError(""); }} required /></FormField>{error && <div className="inline-error" role="alert">{error}</div>}<Button type="submit" variant="primary" disabled={busy}>{busy ? "Posting…" : "Post comment"}</Button></form>
    <ConfirmDialog open={clearing} title="Clear all comments?" busy={busy} onCancel={() => setClearing(false)} onConfirm={clearAll}>This removes every comment on this task.</ConfirmDialog>
  </section>;
}
