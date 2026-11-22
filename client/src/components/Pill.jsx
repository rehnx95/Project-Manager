export default function Pill({ kind = "status", value }) {
  const label = value || "unknown";
  return <span className={`pill pill-${kind} pill-${String(label).toLowerCase()}`}>{label}</span>;
}
