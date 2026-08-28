const userService = require("../services/userService");
const taskService = require("../services/taskService");
const projectService = require("../services/projectService");
const projectMemberService = require("../services/projectMemberService");
const { z, success } = require("zod");
const { error } = require("node:console");

const idParamSchema = z.coerce.number().int().positive();

function parsePositiveIntParam(req, res) {
  const result = idParamSchema.safeParse(req.params.id);
  if (!result.success) {
    res.status(400).json({ success: false, error: "Invalid task id" });
    return null;
  }
  return result.data;
}

const project_schema = z.object({
  new_project_name: z.string().min(3),
  new_description: z.string(),
  new_status: z.string().min(3),
});

async function createProject(req, res) {
  const result = project_schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { new_project_name, new_description, new_status } = result.data;
  const outcome = await projectService.createProject(
    req.user.id,
    new_project_name,
    new_description,
    new_status,
  );
  if (outcome.success === false) {
    return res.status(404).json({
      success: false,
      error: outcome.error,
    });
  }
  return res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function getOneProject(req, res) {
  const project_id = parsePositiveIntParam(req, res);
  if (project_id === null) return;
  const outcome = await projectService.getOneProject(req.user.id, project_id);
  if (outcome.success === false) {
    return res.status(404).json({
      success: false,
      error: outcome.error,
    });
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function getProject(req, res) {
  const outcome = await projectService.getProject(req.user.id);
  if (outcome.success === false) {
    return res.status(404).json({
      success: false,
      error: outcome.error,
    });
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function getTaskByProject(req, res) {
  const project_id = parsePositiveIntParam(req, res);
  if (project_id === null) return;

  const outcome = await projectService.getTaskByProject(
    req.user.id,
    project_id,
  );
  if (outcome.success === false) {
    return res.status(404).json({
      success: false,
      error: outcome.error,
    });
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function updateProject(req, res) {
  const project_id = parsePositiveIntParam(req, res);
  if (project_id === null) return;

  const result = project_schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { new_project_name, new_description, new_status } = result.data;
  const outcome = await projectService.updateProject(
    req.user.id,
    project_id,
    new_project_name,
    new_description,
    new_status,
  );
  if (outcome.success === false) {
    return res.status(404).json({
      success: false,
      error: outcome.error,
    });
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function deleteProject(req, res) {
  const project_id = parsePositiveIntParam(req, res);
  if (project_id === null) return;

  const outcome = await projectService.deleteProject(project_id, req.user.id);

  if (outcome.success === false) {
    return res.status(404).json({
      success: false,
      error: outcome.error,
    });
  }
  res.status(204).send();
}

module.exports = {
  createProject,
  getOneProject,
  getProject,
  getTaskByProject,
  updateProject,
  deleteProject,
};
