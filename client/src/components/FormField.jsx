import { cloneElement, isValidElement } from "react";

export default function FormField({ label, id, error, className = "", children, ...props }) {
  const control = isValidElement(children)
    ? cloneElement(children, { id, "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : undefined })
    : <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />;
  return <div className={`form-field ${className}`}><label htmlFor={id}>{label}</label>{control}{error && <span id={`${id}-error`} className="field-error" role="alert">{error}</span>}</div>;
}
