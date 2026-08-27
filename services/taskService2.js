const tasksDatabase = require("../repository/tasksDatabase");
const projectDatabase = require("../repository/projectDatabase");
const projectMemberDatabase = require("../repository/projectMemberDatabase");

async function completeTask(id) {
  const task = await tasksDatabase.getOneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
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
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] createTask called with userID:",
    user_id,
    "title:",
    new_title,
  );
  const project = await projectDatabase.getOneProject(project_id);

  const membership = await projectMemberDatabase.getMembership(
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
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] createTask result:",
    result,
  );
  return { success: true, value: result };
}

async function getTaskByUser(user_id, page = 1, limit = 10) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] getTask called with userID:",
    user_id,
    "page:",
    page,
    "limit:",
    limit,
  );
  const all_task = await tasksDatabase.getTaskByUser(user_id);
  const total = all_task.length;
  const total_pages = Math.ceil(total / limit);

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated_tasks = all_task.slice(start, end);

  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] getTask total:",
    total,
    "totalPages:",
    total_pages,
    "returning:",
    paginated_tasks.length,
    "tasks",
  );

  return {
    success: true,
    value: paginated_tasks,
    total,
    page,
    totalPages: total_pages,
  };
}

async function getOneTask(id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] getOneTask called with id:",
    id,
  );
  const task = await tasksDatabase.getOneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] getOneTask result:",
    task,
  );
  return { success: true, value: task };
}

async function updateTask(id, new_title, new_priority, new_due_date) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] updateTask called with id:",
    id,
    "title:",
    new_title,
  );
  const task = await tasksDatabase.getOneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  const result = await tasksDatabase.updateTask(
    id,
    new_title,
    new_priority,
    new_due_date,
  );
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] updateTask result:",
    result,
  );
  return { success: true, value: result };
}

async function deleteTask(id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] deleteTask called with id:",
    id,
  );
  const task = await tasksDatabase.getOneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  const membership = await projectMemberDatabase.getMembership(
    task.project_id,
    task.user_id,
  );
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Only Owner Can Delete" };
  }

  const result = await tasksDatabase.deleteTask(id);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] deleteTask done for id:",
    id,
  );
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
