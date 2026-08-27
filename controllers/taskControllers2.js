const taskService = require("../services/taskService2");
const { z } = require("zod");
// req.user.id is unique identification of user extracted from login and pass to authenticate funtion that return req.user as decoded

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  project_id: z.number().positive(),
  priority: z.string().min(3),
  due_date: z.string().datetime(),
});
const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.string().min(3),
  due_date: z.string().datetime(),
});

// Task ids come from the URL as strings; this rejects non-numeric ids
// early with a clean 400 instead of letting a bad value hit Postgres
// and bubble up as a generic 500 from the type-cast error.
const idParamSchema = z.coerce.number().int().positive();

function parsePositiveIntParam(req, res) {
  const result = idParamSchema.safeParse(req.params.id);
  if (!result.success) {
    res.status(400).json({ success: false, error: "Invalid task id" });
    return null;
  }
  return result.data;
}

async function createTask(req, res) {
  const result = taskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }

  const { title, project_id, priority, due_date } = result.data;

  const outcome = await taskService.createTask(
    req.user.id,
    project_id,
    title,
    priority,
    due_date,
  );

  if (outcome.success === false) {
    return res.status(404).json({
      success: false,
      error: outcome.error,
    });
  }

  res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function getTaskByUser(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const outcome = await taskService.getTask(req.user.id, page, limit);

  res.status(200).json({
    success: true,
    value: outcome.value,
    total: outcome.total,
    page: outcome.page,
    totalPages: outcome.total_pages,
  });
}

async function getOneTask(req, res) {
  const id = parsePositiveIntParam(req, res);
  if (id === null) return;

  const outcome = await taskService.getOneTask(req.user.id, id);

  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function updateTask(req, res) {
  const id = parsePositiveIntParam(req, res);
  if (id === null) return;

  const result = updateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }

  const { title, priority, due_date } = result.data;
  const outcome = await taskService.updateTask(
    req.user.id,
    id,
    title,
    priority,
    due_date,
  );

  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
  }

  res.status(200).json({ success: true, value: outcome.value });
}

async function deleteTask(req, res) {
  const id = parsePositiveIntParam(req, res);
  if (id === null) return;

  const outcome = await taskService.deleteTask(req.user.id, id);

  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
  }

  res.status(204).send();
}

async function completeTask(req, res) {
  const id = parsePositiveIntParam(req, res);
  if (id === null) return;

  const outcome = await taskService.completeTask(req.user.id, id);

  if (outcome.success === false) {
    return res.status(404).json({
      success: false,
      error: outcome.error,
    });
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
