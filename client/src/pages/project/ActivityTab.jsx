import { projectsApi } from "../../api/client.js";
import { useFetch } from "../../hooks/useFetch.js";
import LoadState from "../../components/LoadState.jsx";

export default function ActivityTab({ projectId }) {
  const activity = useFetch(() => projectsApi.activity(projectId, 50), [projectId]);
  return <section className="card card-pad"><h3 className="section-title">Project activity</h3><LoadState loading={activity.loading} error={activity.error} empty={!activity.data?.length} emptyTitle="No activity yet" onRetry={activity.refetch}><div className="activity-list">{activity.data?.map((item) => <article className="activity-item" key={item.id}><span className="activity-marker" /><div><p><strong>{item.actor_email || "A teammate"}</strong> {item.action?.replaceAll(".", " ") || "updated the project"}</p><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time></div></article>)}</div></LoadState></section>;
}
