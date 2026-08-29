const commentService = require("../services/commentService");
const { z } = require("zod");

const body_schema = z.object({
  new_body: z.string().min(1, "Comment  is required"),
});

const id_schema = z.coerce.number().int().positive();

function parseIdParam(req, res, param_name) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[commentControllers] parseIdParam");
  const result = id_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

function handleServiceError(res, error) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[commentControllers] handleServiceError");
  if (
    error === "Task Not Exist" ||
    error === "No Comment On Task" ||
    error === "No Comment By User"
  ) {
    return res.status(404).json({
      success: false,
      error,
    });
  }
  if (
    error === "Forbidden Member Not Assign To Project's Task" ||
    error === "Comment not found or unauthorized" ||
    error === "Only Owner Can Delete Comment"
  ) {
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

async function createComment(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[commentControllers] createComment");
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const result = body_schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.errors[0].message,
    });
  }
  const { new_body } = result.data;
  const outcome = await commentService.createComment(
    task_id,
    req.user.id,
    new_body,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function getCommentByTask(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[commentControllers] getCommentByTask");
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const outcome = await commentService.getCommentByTask(task_id, req.user.id);

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }

  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function getCommentByUser(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[commentControllers] getCommentByUser");
  const outcome = await commentService.getCommentByUser(req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function deleteCommentById(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[commentControllers] deleteCommentById");
  const comment_id = parseIdParam(req, res, "comment_id");
  if (comment_id === null) return;
  const outcome = await commentService.deleteCommentById(
    comment_id,
    req.user.id,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(204).send();
}

async function deleteAllCommentFromTask(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[commentControllers] deleteAllCommentFromTask");
  const task_id = parseIdParam(req, res, "task_id");
  if (task_id === null) return;
  const outcome = await commentService.deleteAllCommentFromTask(
    task_id,
    req.user.id,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(204).send();
}

module.exports = {
  createComment,
  getCommentByTask,
  getCommentByUser,
  deleteCommentById,
  deleteAllCommentFromTask,
};