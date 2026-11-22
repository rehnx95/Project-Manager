import { createContext, useCallback, useContext, useMemo, useState } from "react";
import "./Toast.css";

const ToastContext = createContext(null);
let nextToastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = useCallback((id) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const notify = useCallback((message, type = "success") => {
    const id = ++nextToastId;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => remove(id), 3800);
  }, [remove]);
  const value = useMemo(() => ({ notify }), [notify]);
  return <ToastContext.Provider value={value}>{children}<div className="toast-stack" aria-live="polite">{toasts.map((toast) => <Toast key={toast.id} toast={toast} onClose={() => remove(toast.id)} />)}</div></ToastContext.Provider>;
}

function Toast({ toast, onClose }) {
  return <div className={`toast toast-${toast.type}`} role="status"><span>{toast.message}</span><button aria-label="Dismiss notification" onClick={onClose}>×</button></div>;
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value.notify;
}
