const projectService = require("../services/projectService");
const { z } = require("zod");

const uuid_schema = z.uuid();


function parseUUIDParam(req, res, param_name) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectControllers] parseUUIDParam");
  const result = uuid_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

const project_schema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string(),
  status: z.enum(["active", "archived", "completed"], {
    message: "Status must be active, archived, or completed",
  }),
});

function handleServiceError(res, error) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectControllers] handleServiceError");
  if (error === "User Not Exist" || error === "Project Not Exist") {
    return res.status(404).json({ success: false, error });
  }
  if (
    error === "Forbidden Not Assign To That Project" ||
    error === "Forbidden Only Owner Can Update Project" ||
    error === "Forbidden Only Owner Can Delete Project"
  ) {
    return res.status(403).json({ success: false, error });
  }

  return res.status(400).json({ success: false, error });
}

async function createProject(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectControllers] createProject");
  const result = project_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }
  const { name, description, status } = result.data;
  const outcome = await projectService.createProject(
    req.user.id,
    name,
    description,
    status,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  return res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function getOneProject(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectControllers] getOneProject");
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;
  const outcome = await projectService.getOneProject(req.user.id, project_id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function getProjectsCreatedByUser(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectControllers] getProjectsCreatedByUser");
  const outcome = await projectService.getProjectsCreatedByUser(req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function getProjectsInvolvedIn(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectControllers] getProjectsInvolvedIn");
  const outcome = await projectService.getProjectsInvolvedIn(req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function getTaskByProject(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectControllers] getTaskByProject");
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;

  const outcome = await projectService.getTaskByProject(
    req.user.id,
    project_id,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function updateProject(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectControllers] updateProject");
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;

  const result = project_schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }
  const { name, description, status } = result.data;
  const outcome = await projectService.updateProject(
    req.user.id,
    project_id,
    name,
    description,
    status,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function deleteProject(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectControllers] deleteProject");
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;

  const outcome = await projectService.deleteProject(project_id, req.user.id);

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(204).send();
}

module.exports = {
  createProject,
  getOneProject,
  getProjectsCreatedByUser,
  getProjectsInvolvedIn,
  getTaskByProject,
  updateProject,
  deleteProject,
};