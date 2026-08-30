-- =========================================================
-- DEMO 1: Users and the projects they belong to
-- (shows the users <-> projects many-to-many via project_members)
-- =========================================================
SELECT
    u.email,
    p.project_name,
    p.status,
    pm.role
FROM users u
JOIN project_members pm ON pm.user_id = u.id
JOIN projects p ON p.id = pm.project_id
ORDER BY u.email;


-- =========================================================
-- DEMO 2: Each project, its owner, and task stats
-- (shows aggregation across a join, LEFT JOIN so empty
-- projects still show up)
-- =========================================================
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


-- =========================================================
-- DEMO 3: Open (incomplete) tasks, with project + assignee
-- =========================================================
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


-- =========================================================
-- DEMO 4: Comments with the task and who wrote them
-- (three-table join)
-- =========================================================
SELECT
    t.title AS task,
    u.email AS commenter,
    c.body,
    c.created_at
FROM comments c
JOIN tasks t ON t.id = c.task_id
JOIN users u ON u.id = c.user_id
ORDER BY c.created_at DESC;


-- =========================================================
-- DEMO 5: Tasks with their tags collapsed into one line
-- (many-to-many through tasks_tags, using STRING_AGG)
-- =========================================================
SELECT
    t.title,
    STRING_AGG(tg.tag_name, ', ') AS tags
FROM tasks t
JOIN tasks_tags tt ON tt.task_id = t.id
JOIN tags tg ON tg.id = tt.tags_id
GROUP BY t.id, t.title
ORDER BY t.title;


-- =========================================================
-- DEMO 6 (the "wow" one): Full picture for a single project
-- Combines project + owner + members + task counts + tags
-- in one query. Replace the WHERE clause with a real project name.
-- =========================================================
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


-- =========================================================
-- DEMO 7: A user's whole dashboard — every project they're in,
-- with role and task progress per project
-- =========================================================
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

-- =========================================================
-- DEMO 8: Most active users — ranked by total tasks created
-- (window function: RANK)
-- =========================================================
SELECT
    u.email,
    COUNT(t.id) AS tasks_created,
    RANK() OVER (ORDER BY COUNT(t.id) DESC) AS activity_rank
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.id, u.email
ORDER BY activity_rank;


-- =========================================================
-- DEMO 9: Overdue tasks (due_date passed, not completed)
-- with days overdue calculated
-- =========================================================
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


-- =========================================================
-- DEMO 10: Project health score — % of tasks completed,
-- ranked best to worst
-- =========================================================
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


-- =========================================================
-- DEMO 11: Unified activity feed — recent tasks AND comments
-- merged into one timeline (UNION ALL across different tables)
-- =========================================================
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


-- =========================================================
-- DEMO 12: Users who own projects but have no admin role
-- (finding a business-logic condition, not just structure)
-- =========================================================
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


-- =========================================================
-- DEMO 13 (the flex one): CTE combining everything into a
-- single "project report card"
-- =========================================================
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