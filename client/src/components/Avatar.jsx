export default function Avatar({ name, email, size = "normal", className = "" }) {
  const label = name || email || "?";
  return <span className={`avatar avatar-${size} ${className}`} title={name || email || ""} aria-label={name || email || "User"}>{label.trim().charAt(0).toUpperCase()}</span>;
}
