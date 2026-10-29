# Project Upgrade Changelog

This document records the backend, database, frontend, and operational changes made during the upgrade work.

## Backend and authorization

- Added server-side token session persistence and revocation.
- Added logout support through `POST /users/logout`.
- Added audit logging for important mutations, including:
  - Membership changes
  - Task assignment
  - Project deletion
  - Email changes
  - User deletion
- Added centralized permission helpers for task editing, membership management, and admin modification rules.
- Added transactional protection against removing or demoting the last project owner.
- Restricted project deletion, task deletion, member management, tag creation, and task assignment according to project ownership.
- Allowed task editing and completion for task creators, project owners, and assigned users.
- Prevented admins from modifying another admin's email.
- Added task assignment endpoints:
  - `GET /tasks/:task_id/assignees`
  - `POST /tasks/:task_id/assignees/:target_user_id`
  - `DELETE /tasks/:task_id/assignees/:target_user_id`
- Automatically assign a task creator when a task is created.
- Changed account deletion behavior so owned projects and owned resources are removed, while membership in another user's project is not treated as ownership.
- Added database-level account deletion protection for users who still belong to a project. Users must leave all projects first.

## Database changes

- Added `token_sessions`.
- Added `audit_logs`.
- Added `task_assignees`.
- Changed project and task ownership foreign keys to cascade when the owning user is deleted.
- Made tags project-scoped with:
  - `tags.project_id`
  - Foreign key to `projects(id)` with cascade delete
  - Unique constraint on `(project_id, tag_name)`
- Added indexes for sessions, audit logs, task assignees, and project-scoped tags.
- Added the `prevent_user_delete_with_projects` trigger on `users`.
- Preserved existing tag relationships during migration by mapping tags to the projects where their tasks were used.

## Frontend changes

- Updated task tag requests to use project-scoped endpoints:
  - `POST /projects/:project_id/tags`
  - `GET /projects/:project_id/tags`
- Added task assignee display and owner-only assignment controls.
- Added permission guidance showing who can edit or complete a task.
- Disabled task edit and completion controls for unauthorized users.
- Added project member permission guidance for owners and members.
- Added owner-only visibility for tag creation.
- Made task due dates optional in project and task forms.
- Updated logout behavior to revoke the server-side session before clearing local state.
- Updated the testing console endpoint catalog for logout, project tags, and task assignees.
- Updated the owner testing-console flow to exchange the owner key for a short-lived HttpOnly cookie.
- Added styling for permission notes, optional labels, and assignee chips.

## Testing console and owner access

- Added `POST /testing/access` to exchange `SECRET_KEY` for a short-lived `testing_access` cookie.
- Protected `/testing` and `/testing.html` with the HttpOnly owner-access cookie.
- Removed the need to put the owner key in database-console query parameters.
- Updated the testing frontend to use the active authentication token and current backend routes.

## Validation performed

- JavaScript syntax checks passed for the changed frontend and middleware files.
- `git diff --check` passed for the reviewed changes.
- Database migrations were verified with `\d` output for:
  - `tags`
  - `audit_logs`
  - `task_assignees`
  - `token_sessions`
  - `projects`
  - `tasks`
- The project test script was not consistently available in every checkout, so full automated tests should be run from the final project folder.

## Deployment and database notes

- Do not run the original full schema file against an existing production database.
- Back up Render PostgreSQL before migrations with `pg_dump`.
- Use incremental migrations for an existing database.
- Keep database credentials and `JWT_SECRET` private and rotate any credentials that were exposed.
- Configure Render environment variables to match the upgraded backend.
- Restart the deployed service after applying schema changes.
