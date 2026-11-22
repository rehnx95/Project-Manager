import { useEffect, useRef } from "react";
import Button from "./Button.jsx";
import "./Modal.css";

export default function Modal({ open, onClose, title, children, footer }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
    focusable()[0]?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "Tab") {
        const nodes = focusable();
        if (!nodes.length) return;
        if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes[nodes.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) { event.preventDefault(); nodes[0].focus(); }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef}><header className="modal-header"><h2 id="modal-title">{title}</h2><Button variant="ghost" aria-label="Close dialog" onClick={onClose}>×</Button></header><div className="modal-content">{children}</div>{footer && <footer className="modal-footer">{footer}</footer>}</section></div>;
}
