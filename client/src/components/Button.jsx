import "./Button.css";

export default function Button({ variant = "outline", size, className = "", type = "button", children, ...props }) {
  return <button type={type} className={`button button-${variant}${size ? ` button-${size}` : ""} ${className}`} {...props}>{children}</button>;
}
