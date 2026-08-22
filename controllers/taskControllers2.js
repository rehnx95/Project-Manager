const taskService = require("../services/taskService2");
const { z } = require("zod");

// req.user.id is unique identification of user extracted from login and pass to authenticate funtion that return req.user as decoded

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

// Task ids come from the URL as strings; this rejects non-numeric ids
// early with a clean 400 instead of letting a bad value hit Postgres
// and bubble up as a generic 500 from the type-cast error.
const idParamSchema = z.coerce.number().int().positive();

function parseTaskId(req, res) {
  const result = idParamSchema.safeParse(req.params.id);
  if (!result.success) {
    res.status(400).json({ success: false, error: "Invalid task id" });
    return null;
  }
  return result.data;
}

async function createTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] createTask hit, body:",
    req.body,
    "user:",
    req.user,
  );
  const result = taskSchema.safeParse(req.body);
  if (!result.success) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:task] createTask validation failed:",
      result.error.issues,
    );
    return res.status(400).json({ success: false, error: result.error.issues });
  }

  const userID = req.user.id;
  const { title } = result.data;

  const outcome = await taskService.createTask(userID, title);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] createTask outcome:",
    outcome,
  );
  res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function completed(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] completed hit, params:",
    req.params,
    "user:",
    req.user,
  );
  const id = parseTaskId(req, res);
  if (id === null) return;

  const outcome = await taskService.getoneTask(id);
  const task = outcome.value;
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] completed fetched task:",
    task,
  );

  if (!task || task.user_id !== req.user.id) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:task] completed - not found or not owned by user",
    );
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  const result = await taskService.completed(id);
  if (!result.success) {
    return res.status(404).json({ success: false, error: result.error });
  }
  res.status(200).json({ success: true, value: result.value });
}

async function getTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] getTask hit, query:",
    req.query,
    "user:",
    req.user,
  );
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const outcome = await taskService.getTask(req.user.id, page, limit);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] getTask outcome:",
    outcome,
  );

  res.status(200).json({
    success: true,
    value: outcome.value,
    total: outcome.total,
    page: outcome.page,
    totalPages: outcome.totalPages,
  });
}

async function getoneTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] getoneTask hit, params:",
    req.params,
    "user:",
    req.user,
  );
  const id = parseTaskId(req, res);
  if (id === null) return;

  const outcome = await taskService.getoneTask(id);
  const task = outcome.value;
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] getoneTask fetched task:",
    task,
  );

  if (!task || task.user_id !== req.user.id) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:task] getoneTask - not found or not owned by user",
    );
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  res.status(200).json({ success: true, value: task });
}

async function updateTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] updateTask hit, params:",
    req.params,
    "body:",
    req.body,
    "user:",
    req.user,
  );
  const id = parseTaskId(req, res);
  if (id === null) return;

  const result = taskSchema.safeParse(req.body);
  if (!result.success) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:task] updateTask validation failed:",
      result.error.issues,
    );
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { title } = result.data;
  const outcome = await taskService.getoneTask(id);
  const task = outcome.value;
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] updateTask existing task:",
    task,
  );
  if (!task || task.user_id !== req.user.id) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:task] updateTask - not found or not owned by user",
    );
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  const updatedtask = await taskService.updateTask(id, title);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] updateTask result:",
    updatedtask,
  );
  res.status(200).json({ success: true, value: updatedtask.value });
}

async function deleteTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] deleteTask hit, params:",
    req.params,
    "user:",
    req.user,
  );
  const id = parseTaskId(req, res);
  if (id === null) return;

  const outcome = await taskService.getoneTask(id);
  const task = outcome.value;
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] deleteTask existing task:",
    task,
  );
  if (!task || task.user_id !== req.user.id) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:task] deleteTask - not found or not owned by user",
    );
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  await taskService.deleteTask(id);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:task] deleteTask - deleted id:",
    id,
  );
  res.status(204).send();
}

module.exports = {
  createTask,
  getTask,
  getoneTask,
  deleteTask,
  updateTask,
  completed,
};