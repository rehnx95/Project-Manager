const taskService = require("../services/taskService");
const { z } = require("zod");
// req.user.id is unique identification of user extracted from login and pass to authenticate funtion that return req.user as decoded

const task_schema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high"], {
    message: "Priority must be low, medium, or high",
  }),
  due_date: z.union([z.iso.date(), z.iso.datetime()], {
    message: "Please provide a valid date",
  }).nullable(),
});

const id_schema = z.coerce.number().int().positive();
const uuid_schema = z.uuid();

function parseIdParam(req, res, param_name) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[taskControllers] parseIdParam",
  );
  const result = id_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

function parseUUIDParam(req, res, param_name) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[taskControllers] parseUUIDParam",
  );
  const result = uuid_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

function handleServiceError(res, error) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[taskControllers] handleServiceError",
  );
  if (
    error === "Forbidden Not Member Of That Project" ||
    error === "Forbidden Only Owner Can Delete Task" ||
    error === "Forbidden Only Owner Can Assign Task"
  ) {
    return res.status(403).json({ success: false, error });
  }
  if (error === "Project Not Exist" || error === "Task Not Exist") {
    return res.status(404).json({ success: false, error });
  }
  if (error === "User Not Member Of That Project") {
    return res.status(403).json({ success: false, error });
  }

  return res.status(400).json({ success: false, error });
}

async function createTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[taskControllers] createTask",
  );
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
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[taskControllers] getTaskByUser",
  );
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      success: false,
      error: "page must be an integer >= 1 and limit must be an integer between 1 and 100",
    });
  }

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
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[taskControllers] getOneTask",
  );
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;

  const outcome = await taskService.getOneTask(req.user.id, task_id);

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function updateTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[taskControllers] updateTask",
  );
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
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[taskControllers] deleteTask",
  );
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;

  const outcome = await taskService.deleteTask(req.user.id, task_id);

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }

  res.status(204).send();
}

async function completeTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[taskControllers] completeTask",
  );
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;

  const outcome = await taskService.completeTask(req.user.id, task_id);

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function assignTask(req, res) {
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const targetResult = uuid_schema.safeParse(req.params.target_user_id);
  if (!targetResult.success) {
    return res.status(400).json({ success: false, error: "Invalid target_user_id" });
  }
  const outcome = await taskService.assignTask(req.user.id, task_id, targetResult.data);
  if (outcome.success === false) return handleServiceError(res, outcome.error);
  return res.status(201).json({ success: true, value: outcome.value });
}

async function unassignTask(req, res) {
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const targetResult = uuid_schema.safeParse(req.params.target_user_id);
  if (!targetResult.success) {
    return res.status(400).json({ success: false, error: "Invalid target_user_id" });
  }
  const outcome = await taskService.unassignTask(req.user.id, task_id, targetResult.data);
  if (outcome.success === false) return handleServiceError(res, outcome.error);
  return res.status(204).send();
}

async function getTaskAssignees(req, res) {
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const outcome = await taskService.getTaskAssignees(req.user.id, task_id);
  if (outcome.success === false) return handleServiceError(res, outcome.error);
  return res.status(200).json({ success: true, value: outcome.value });
}

module.exports = {
  createTask,
  getTaskByUser,
  getOneTask,
  deleteTask,
  updateTask,
  completeTask,
  assignTask,
  unassignTask,
  getTaskAssignees,
};
