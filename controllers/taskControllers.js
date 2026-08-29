const taskService = require("../services/taskService");
const { z } = require("zod");
// req.user.id is unique identification of user extracted from login and pass to authenticate funtion that return req.user as decoded

const task_schema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high"], {
    message: "Priority must be low, medium, or high",
  }),
  due_date: z.iso.datetime("Please provide a valid date"),
});

const id_schema = z.coerce.number().int().positive();
const uuid_schema = z.uuid();

function parseIdParam(req, res, param_name) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[taskControllers] parseIdParam");
  const result = id_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

function parseUUIDParam(req, res, param_name) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[taskControllers] parseUUIDParam");
  const result = uuid_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

function handleServiceError(res, error) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[taskControllers] handleServiceError");
  if (
    error === "Forbidden Not Member Of That Project" ||
    error === "Forbidden Only Owner Can Delete Task"
  ) {
    return res.status(403).json({ success: false, error });
  }
  if (error === "Project Not Exist") {
    return res.status(404).json({ success: false, error });
  }

  return res.status(400).json({ success: false, error });
}

async function createTask(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[taskControllers] createTask");
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;

  const result = task_schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }
  const { title, priority, due_date } = result.data;

  const outcome = await taskService.createTask(
    req.user.id,
    project_id,
    title,
    priority,
    due_date,
  );

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }

  res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function getTaskByUser(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[taskControllers] getTaskByUser");
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const outcome = await taskService.getTaskByUser(req.user.id, page, limit);

  res.status(200).json({
    success: true,
    value: outcome.value,
    total: outcome.total,
    page: outcome.page,
    total_pages: outcome.total_pages,
  });
}

async function getOneTask(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[taskControllers] getOneTask");
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;

  const outcome = await taskService.getOneTask(req.user.id, task_id);

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function updateTask(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[taskControllers] updateTask");
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;

  const result = task_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }

  const { title, priority, due_date } = result.data;
  const outcome = await taskService.updateTask(
    req.user.id,
    task_id,
    title,
    priority,
    due_date,
  );

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }

  res.status(200).json({ success: true, value: outcome.value });
}

async function deleteTask(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[taskControllers] deleteTask");
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;

  const outcome = await taskService.deleteTask(req.user.id, task_id);

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }

  res.status(204).send();
}

async function completeTask(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[taskControllers] completeTask");
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;

  const outcome = await taskService.completeTask(req.user.id, task_id);

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }

  res.status(200).json({ success: true, value: outcome.value });
}

module.exports = {
  createTask,
  getTaskByUser,
  getOneTask,
  deleteTask,
  updateTask,
  completeTask,
};