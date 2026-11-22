export default function ProgressBar({ value = 0, label = "Project progress" }) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${percent}%` }} /></div>;
}
