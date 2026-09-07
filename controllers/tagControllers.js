const tagService = require("../services/tagService");
const { z } = require("zod");

const id_schema = z.coerce.number().int().positive();
const uuid_schema = z.uuid();

function parseIdParam(req, res, param_name) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[tagControllers] parseIdParam",
  );
  const result = id_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }

  return result.data;
}

function parseUUIDParam(req, res, param_name) {
  const result = uuid_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

const tag_schema = z.object({
  tag_name: z.string().min(1, "Tag Name Is Required"),
});

function handleServiceError(res, error) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[tagControllers] handleServiceError",
  );
  if (error === "Tag Not Exist" || error === "Task Not Exist") {
    return res.status(404).json({
      success: false,
      error,
    });
  }
  if (error.startsWith("Forbidden")) {
    return res.status(403).json({
      success: false,
      error,
    });
  }
  if (error === "Tag Not In Task Project") {
    return res.status(403).json({ success: false, error });
  }
  return res.status(400).json({
    success: false,
    error,
  });
}

async function createTag(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[tagControllers] createTag",
  );
  const result = tag_schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.issues[0].message,
    });
  }
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;
  const { tag_name } = result.data;
  const outcome = await tagService.createTag(project_id, tag_name, req.user.id);
  if (outcome.success === false) return handleServiceError(res, outcome.error);
  res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function getAllTags(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[tagControllers] getAllTags",
  );
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;
  const outcome = await tagService.getAllTags(project_id, req.user.id);
  if (outcome.success === false) return handleServiceError(res, outcome.error);
  res.status(200).json({ success: true, value: outcome.value });
}

async function addTagToTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[tagControllers] addTagToTask",
  );
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const tag_id = parseIdParam(req, res, "tag_id");
  if (tag_id === null) return;
  const outcome = await tagService.addTagToTask(task_id, tag_id, req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function getTaskTags(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[tagControllers] getTaskTags",
  );
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const outcome = await tagService.getTaskTags(task_id, req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function removeTagFromTask(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[tagControllers] removeTagFromTask",
  );
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const tag_id = parseIdParam(req, res, "tag_id");
  if (tag_id === null) return;
  const outcome = await tagService.removeTagFromTask(
    task_id,
    tag_id,
    req.user.id,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(204).send();
}

module.exports = {
  createTag,
  getAllTags,
  addTagToTask,
  getTaskTags,
  removeTagFromTask,
};
