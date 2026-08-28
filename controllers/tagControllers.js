const tagService = require("../services/tagservice");
const { z } = require("zod");

const id_schema = z.coerce.number().int().positive();

function parseIdParam(req, res, param_name) {
  const result = id_schema.safeParse(req.params[param_name]);
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
  if (error === "Tag Not Exist" || error === "Task Not Exist") {
    return res.status(404).json({
      success: false,
      error,
    });
  }
  if (error === "Forbidden Member Not Assign To Project's Task") {
    return res.status(403).json({
      success: false,
      error,
    });
  }
  return res.status(400).json({
    success: false,
    error,
  });
}

async function createTag(req, res) {
  const result = tag_schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.errors[0].message,
    });
  }
  const { tag_name } = result.data;
  const outcome = await tagService.createTag(tag_name);
  res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function addTagToTask(req, res) {
  const task_id = parseIdParam(req, res, "task_id");
  const tag_id = parseIdParam(req, res, "tag_id");
  if (task_id === null || tag_id === null) return;
  const outcome = await tagService.addTagToTask(task_id, tag_id, req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function getTaskTags(req, res) {
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const outcome = await tagService.getTaskTags(task_id, req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function removeTagFromTask(req, res) {
  const task_id = parseIdParam(req, res, "task_id");
  const tag_id = parseIdParam(req, res, "tag_id");
  if (task_id === null || tag_id === null) return;
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
