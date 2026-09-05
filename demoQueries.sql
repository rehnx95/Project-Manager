-- =========================================================
-- Seed data for the `queries` table — powers the "Load a saved
-- query" dropdown in the /testing SQL console (POST /database).
-- Optional: only needed if you want that dropdown populated.
-- =========================================================

INSERT INTO queries (label, query) VALUES

('Demo 1: Users and the projects they belong to', $$
SELECT
    u.email,
    p.project_name,
    p.status,
    pm.role
FROM users u
JOIN project_members pm ON pm.user_id = u.id
JOIN projects p ON p.id = pm.project_id
ORDER BY u.email;
$$),

('Demo 2: Each project, its owner, and task stats', $$
SELECT
    p.project_name,
    u.email AS owner_email,
    COUNT(t.id) AS total_tasks,
    COUNT(t.id) FILTER (WHERE t.completed) AS completed_tasks
FROM projects p
JOIN users u ON u.id = p.user_id
LEFT JOIN tasks t ON t.project_id = p.id
GROUP BY p.id, p.project_name, u.email
ORDER BY p.project_name;
$$),

('Demo 3: Open (incomplete) tasks, with project + assignee', $$
SELECT
    t.title,
    t.priority,
    t.due_date,
    p.project_name,
    u.email AS assigned_to
FROM tasks t
JOIN projects p ON p.id = t.project_id
JOIN users u ON u.id = t.user_id
WHERE t.completed = FALSE
ORDER BY t.due_date;
$$),

('Demo 4: Comments with the task and who wrote them', $$
SELECT
    t.title AS task,
    u.email AS commenter,
    c.body,
    c.created_at
FROM comments c
JOIN tasks t ON t.id = c.task_id
JOIN users u ON u.id = c.user_id
ORDER BY c.created_at DESC;
$$),

('Demo 5: Tasks with their tags collapsed into one line', $$
SELECT
    t.title,
    STRING_AGG(tg.tag_name, ', ') AS tags
FROM tasks t
JOIN tasks_tags tt ON tt.task_id = t.id
JOIN tags tg ON tg.id = tt.tags_id
GROUP BY t.id, t.title
ORDER BY t.title;
$$),

('Demo 6: Full picture for a single project', $$
SELECT
    p.project_name,
    p.status,
    owner.email AS owner_email,
    COUNT(DISTINCT pm.user_id) AS member_count,
    COUNT(DISTINCT t.id) AS total_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.completed) AS done_tasks,
    COUNT(DISTINCT c.id) AS total_comments
FROM projects p
JOIN users owner ON owner.id = p.user_id
LEFT JOIN project_members pm ON pm.project_id = p.id
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN comments c ON c.task_id = t.id
WHERE p.project_name = 'Your Project Name Here'
GROUP BY p.id, p.project_name, p.status, owner.email;
$$),

('Demo 7: A user''s whole dashboard across projects', $$
SELECT
    u.email,
    p.project_name,
    pm.role,
    COUNT(t.id) AS total_tasks,
    COUNT(t.id) FILTER (WHERE t.completed) AS completed_tasks
FROM users u
JOIN project_members pm ON pm.user_id = u.id
JOIN projects p ON p.id = pm.project_id
LEFT JOIN tasks t ON t.project_id = p.id
WHERE u.email = 'someone@example.com'
GROUP BY u.email, p.project_name, pm.role
ORDER BY p.project_name;
$$),

('Demo 8: Most active users (RANK window function)', $$
SELECT
    u.email,
    COUNT(t.id) AS tasks_created,
    RANK() OVER (ORDER BY COUNT(t.id) DESC) AS activity_rank
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.id, u.email
ORDER BY activity_rank;
$$),

('Demo 9: Overdue tasks with days overdue', $$
SELECT
    t.title,
    p.project_name,
    u.email AS assigned_to,
    t.due_date,
    (NOW() - t.due_date) AS overdue_by
FROM tasks t
JOIN projects p ON p.id = t.project_id
JOIN users u ON u.id = t.user_id
WHERE t.completed = FALSE
  AND t.due_date < NOW()
ORDER BY t.due_date;
$$),

('Demo 10: Project health score, ranked', $$
SELECT
    p.project_name,
    COUNT(t.id) AS total_tasks,
    COUNT(t.id) FILTER (WHERE t.completed) AS done,
    ROUND(
        100.0 * COUNT(t.id) FILTER (WHERE t.completed) / NULLIF(COUNT(t.id), 0),
        1
    ) AS percent_complete
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
GROUP BY p.id, p.project_name
ORDER BY percent_complete DESC NULLS LAST;
$$),

('Demo 11: Unified activity feed (UNION ALL)', $$
SELECT
    'task_created' AS event_type,
    t.title AS detail,
    u.email AS actor,
    t.created_at AS happened_at
FROM tasks t
JOIN users u ON u.id = t.user_id

UNION ALL

SELECT
    'comment_added' AS event_type,
    c.body AS detail,
    u.email AS actor,
    c.created_at AS happened_at
FROM comments c
JOIN users u ON u.id = c.user_id

ORDER BY happened_at DESC
LIMIT 20;
$$),

('Demo 12: Owners who have no admin role', $$
SELECT
    u.email,
    u.role AS system_role,
    COUNT(p.id) AS owned_projects
FROM users u
JOIN projects p ON p.user_id = u.id
WHERE u.role <> 'admin'
GROUP BY u.id, u.email, u.role
HAVING COUNT(p.id) > 0
ORDER BY owned_projects DESC;
$$),

('Demo 13: Project report card (CTE)', $$
WITH project_stats AS (
    SELECT
        p.id,
        p.project_name,
        p.status,
        COUNT(DISTINCT pm.user_id) AS members,
        COUNT(DISTINCT t.id) AS tasks,
        COUNT(DISTINCT t.id) FILTER (WHERE t.completed) AS done_tasks,
        COUNT(DISTINCT c.id) AS comments
    FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id
    LEFT JOIN tasks t ON t.project_id = p.id
    LEFT JOIN comments c ON c.task_id = t.id
    GROUP BY p.id, p.project_name, p.status
)
SELECT
    project_name,
    status,
    members,
    tasks,
    done_tasks,
    ROUND(100.0 * done_tasks / NULLIF(tasks, 0), 1) AS pct_done,
    comments
FROM project_stats
ORDER BY pct_done DESC NULLS LAST;
$$),

('Demo 14: A user''s private notes, most recent first', $$
SELECT
    n.title,
    n.body,
    n.created_at
FROM notes n
JOIN users u ON u.id = n.user_id
WHERE u.email = 'someone@example.com'
ORDER BY n.created_at DESC;
$$),

('Demo 15: Users with no projects (LEFT JOIN anti-join)', $$
SELECT
    u.email,
    u.created_at
FROM users u
LEFT JOIN project_members pm ON pm.user_id = u.id
WHERE pm.project_id IS NULL
ORDER BY u.created_at;
$$),

('Demo 16: Users with no projects (NOT EXISTS version)', $$
SELECT
    u.email
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM project_members pm
    WHERE pm.user_id = u.id
)
ORDER BY u.email;
$$),

('Demo 17: Projects where every task is completed', $$
SELECT
    p.project_name,
    COUNT(t.id) AS total_tasks
FROM projects p
JOIN tasks t ON t.project_id = p.id
GROUP BY p.id, p.project_name
HAVING BOOL_AND(t.completed) = TRUE
ORDER BY p.project_name;
$$),

('Demo 18: Most-used tags, busiest first', $$
SELECT
    tg.tag_name,
    COUNT(tt.task_id) AS times_used
FROM tags tg
LEFT JOIN tasks_tags tt ON tt.tags_id = tg.id
GROUP BY tg.id, tg.tag_name
ORDER BY times_used DESC, tg.tag_name;
$$),

('Demo 19: Task priority breakdown per project', $$
SELECT
    p.project_name,
    COUNT(*) FILTER (WHERE t.priority = 'low')    AS low_count,
    COUNT(*) FILTER (WHERE t.priority = 'medium') AS medium_count,
    COUNT(*) FILTER (WHERE t.priority = 'high')   AS high_count
FROM projects p
JOIN tasks t ON t.project_id = p.id
GROUP BY p.id, p.project_name
ORDER BY high_count DESC;
$$),

('Demo 20: Running comment total per project (window SUM)', $$
SELECT
    p.project_name,
    t.title,
    t.created_at,
    COUNT(c.id) AS comments_on_task,
    SUM(COUNT(c.id)) OVER (
        PARTITION BY p.id
        ORDER BY t.created_at
    ) AS running_comment_total
FROM tasks t
JOIN projects p ON p.id = t.project_id
LEFT JOIN comments c ON c.task_id = t.id
GROUP BY p.id, p.project_name, t.id, t.title, t.created_at
ORDER BY p.project_name, t.created_at;
$$),

('Demo 21: Gap in days between a user''s consecutive tasks (LAG)', $$
SELECT
    u.email,
    t.title,
    t.created_at,
    t.created_at - LAG(t.created_at) OVER (
        PARTITION BY u.id
        ORDER BY t.created_at
    ) AS gap_since_previous_task
FROM tasks t
JOIN users u ON u.id = t.user_id
ORDER BY u.email, t.created_at;
$$),

('Demo 22: Owners managing more than one project (correlated subquery)', $$
SELECT
    u.email,
    (
        SELECT COUNT(*)
        FROM project_members pm
        WHERE pm.user_id = u.id
          AND pm.role = 'owner'
    ) AS projects_owned
FROM users u
WHERE (
    SELECT COUNT(*)
    FROM project_members pm
    WHERE pm.user_id = u.id
      AND pm.role = 'owner'
) > 1
ORDER BY projects_owned DESC;
$$),

('Demo 23: Full member roster per project with role counts (CTE)', $$
WITH role_counts AS (
    SELECT
        project_id,
        COUNT(*) FILTER (WHERE role = 'owner')  AS owners,
        COUNT(*) FILTER (WHERE role = 'member') AS members
    FROM project_members
    GROUP BY project_id
)
SELECT
    p.project_name,
    rc.owners,
    rc.members,
    u.email,
    pm.role
FROM projects p
JOIN role_counts rc ON rc.project_id = p.id
JOIN project_members pm ON pm.project_id = p.id
JOIN users u ON u.id = pm.user_id
ORDER BY p.project_name, pm.role, u.email;
$$);