import EmptyState from "./EmptyState.jsx";
import Spinner from "./Spinner.jsx";

export default function LoadState({ loading, error, empty, emptyTitle = "Nothing here yet", children, onRetry }) {
  if (loading) return <Spinner />;
  if (error) return <div className="load-error" role="alert"><p>{error.message}</p>{onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}</div>;
  if (empty) return <EmptyState title={emptyTitle} />;
  return children;
}
