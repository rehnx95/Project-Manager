const taskRepository = require("../repository/tasksDatabase");

async function completed(id) {
  const task = await taskRepository.getoneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  const result = await taskRepository.completed(id, !task.completed);
  return { success: true, value: result };
}

async function createTask(userID, title) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] createTask called with userID:",
    userID,
    "title:",
    title,
  );
  let newtask = {
    user_id: userID,
    title: title,
  };
  const result = await taskRepository.create(newtask);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] createTask result:",
    result,
  );
  return { success: true, value: result };
}

async function getTask(userID, page = 1, limit = 10) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] getTask called with userID:",
    userID,
    "page:",
    page,
    "limit:",
    limit,
  );
  const allTasks = await taskRepository.getTask(userID);
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

async function updateTask(id, title) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] updateTask called with id:",
    id,
    "title:",
    title,
  );
  const task = await taskRepository.getoneTask(id);
  if (!task) return { success: false, error: "Task Not Found" };
  const result = await taskRepository.updateTask(id, title);
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
  await taskRepository.deleteTask(id);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:task] deleteTask done for id:",
    id,
  );
  return { success: true };
}
module.exports = {
  createTask,
  getTask,
  getoneTask,
  updateTask,
  deleteTask,
  completed,
};
