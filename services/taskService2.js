const taskRepository = require("../repository/tasksDatabase");
const projectRepository = require("../repository/projectDatabase");
const projectMemberRepository = require("../repository/projectMemberDatabase");

async function completeTask(id) {
  const task = await taskRepository.getoneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  const result = await taskRepository.completeTask(id, !task.completed);
  return { success: true, value: result };
}

async function createTask(user_id, project_id, title, priority, due_date) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] createTask called with userID:",
    user_id,
    "title:",
    title,
  );
  const project = await projectRepository.getoneProject(project_id);

  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }


  let newtask = {
    user_id: user_id,
    project_id: project_id,
    title: title,
    priority: priority,
    due_date: due_date,
  };
  const result = await taskRepository.createTask(newtask);
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
  const allTasks = await taskRepository.getTaskByUser(user_id);
  const total = allTasks.length;
  const totalPages = Math.ceil(total / limit);

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedTasks = allTasks.slice(start, end);

  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] getTask total:",
    total,
    "totalPages:",
    totalPages,
    "returning:",
    paginatedTasks.length,
    "tasks",
  );

  return {
    success: true,
    value: paginatedTasks,
    total,
    page,
    totalPages,
  };
}

async function getoneTask(id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] getoneTask called with id:",
    id,
  );
  const task = await taskRepository.getoneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] getoneTask result:",
    task,
  );
  return { success: true, value: task };
}

async function updateTask(id, title, priority, due_date) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] updateTask called with id:",
    id,
    "title:",
    title,
  );
  const task = await taskRepository.getoneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  const result = await taskRepository.updateTask(id, title, priority, due_date);
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
  const task = await taskRepository.getoneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  const membership = await projectMemberRepository.getMembership(
    task.project_id,
    task.user_id,
  );
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Only Owner Can Delete" };
  }

  await taskRepository.deleteTask(id);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] deleteTask done for id:",
    id,
  );
  return { success: true, value: "no content" };
}
module.exports = {
  createTask,
  getTaskByUser,
  getoneTask,
  updateTask,
  deleteTask,
  completeTask,
};
