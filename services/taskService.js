const tasksDatabase = require("../repository/tasksDatabase");
const projectsDatabase = require("../repository/projectsDatabase");
const projectMembersDatabase = require("../repository/projectMembersDatabase");

async function completeTask(user_id, id) {
  const task = await tasksDatabase.getOneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };

  const membership = await projectMembersDatabase.getMembership(
    task.project_id,
    user_id,
  );
  if (!membership) {
    return { success: false, error: "Forbidden" };
  }
  const result = await tasksDatabase.completeTask(id, !task.completed);
  return { success: true, value: result };
}

async function createTask(
  user_id,
  project_id,
  new_title,
  new_priority,
  new_due_date,
) {
  const project = await projectsDatabase.getOneProject(project_id);

  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );

  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }

  if (!membership) {
    return { success: false, error: "Forbidden" };
  }
  let new_task = {
    user_id,
    project_id,
    new_title,
    new_priority,
    new_due_date,
  };
  const result = await tasksDatabase.createTask(new_task);
  return { success: true, value: result };
}

async function getTaskByUser(user_id, page = 1, limit = 10) {
  const all_task = await tasksDatabase.getTaskByUser(user_id);
  const total = all_task.length;
  const total_pages = Math.ceil(total / limit);

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated_tasks = all_task.slice(start, end);

  return {
    success: true,
    value: paginated_tasks,
    total,
    page,
    total_pages,
  };
}

async function getOneTask(user_id, id) {
  const task = await tasksDatabase.getOneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };

  const membership = await projectMembersDatabase.getMembership(
    task.project_id,
    user_id,
  );
  if (!membership) {
    return { success: false, error: "Forbidden" };
  }

  return { success: true, value: task };
}

async function updateTask(user_id, id, new_title, new_priority, new_due_date) {
  const task = await tasksDatabase.getOneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };

  const membership = await projectMembersDatabase.getMembership(
    task.project_id,
    user_id,
  );
  if (!membership) {
    return { success: false, error: "Forbidden" };
  }

  const result = await tasksDatabase.updateTask(
    id,
    new_title,
    new_priority,
    new_due_date,
  );
  return { success: true, value: result };
}

async function deleteTask(user_id, id) {
  const task = await tasksDatabase.getOneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  const membership = await projectMembersDatabase.getMembership(
    task.project_id,
    user_id,
  );
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Forbidden" };
  }

  const result = await tasksDatabase.deleteTask(id);
  return { success: true, value: result };
}
module.exports = {
  createTask,
  getTaskByUser,
  getOneTask,
  updateTask,
  deleteTask,
  completeTask,
};
