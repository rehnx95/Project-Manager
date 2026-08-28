const commentsDatabase = require("../repository/commentsDatabase");
const tasksDatabase = require("../repository/tasksDatabase");
const projectMembersDatabase = require("../repository/projectMembersDatabase");

async function createComment(task_id, user_id, new_body) {
  const task = await tasksDatabase.getOneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const membership = await projectMembersDatabase.getMembership(
    task.project_id,
    user_id,
  );
  if (!membership) {
    return {
      success: false,
      error: "Forbidden Member Not Assign To Project's Task",
    };
  }

  const result = await commentsDatabase.createComment(
    task_id,
    user_id,
    new_body,
  );
  return { success: true, value: result };
}

async function getCommentByTask(task_id, user_id) {
  const task = await tasksDatabase.getOneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const membership = await projectMembersDatabase.getMembership(
    task.project_id,
    user_id,
  );
  if (!membership) {
    return {
      success: false,
      error: "Forbidden Member Not Assign To Project's Task",
    };
  }
  const result = await commentsDatabase.getCommentByTask(task_id);
  if (!result || result.length === 0) {
    return { success: false, error: "No Comment On Task" };
  }
  return { success: true, value: result };
}

async function getCommentByUser(user_id) {
  const result = await commentsDatabase.getCommentByUser(user_id);
  if (!result || result.length === 0) {
    return { success: false, error: "No Comment By User" };
  }
  return { success: true, value: result };
}

async function deleteCommentById(comment_id, user_id) {
  const result = await commentsDatabase.deleteCommentByUserAndId(
    comment_id,
    user_id,
  );
  if (!result) {
    return { success: false, error: "Comment not found or unauthorized" };
  }
  return { success: true, value: result };
}

async function deleteAllCommentFromTask(task_id, user_id) {
  const task = await tasksDatabase.getOneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const membership = await projectMembersDatabase.getMembership(
    task.project_id,
    user_id,
  );
  if (!membership || membership.role !== "owner") {
    return {
      success: false,
      error: "Only Owner Can Delete Comment",
    };
  }
  const result = await commentsDatabase.deleteAllCommentFromTask(task_id);
  return { success: true, value: result };
}

module.exports = {
  createComment,
  getCommentByTask,
  getCommentByUser,
  deleteCommentById,
  deleteAllCommentFromTask,
};
