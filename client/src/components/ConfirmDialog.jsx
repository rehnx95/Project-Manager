import Button from "./Button.jsx";
import Modal from "./Modal.jsx";

export default function ConfirmDialog({ open, title, children, confirmLabel = "Delete", busy = false, onCancel, onConfirm }) {
  return <Modal open={open} onClose={onCancel} title={title} footer={<><Button onClick={onCancel}>Cancel</Button><Button variant="danger" disabled={busy} onClick={onConfirm}>{busy ? "Working…" : confirmLabel}</Button></>}>{children}</Modal>;
}
