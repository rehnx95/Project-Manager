const commentsRepository = require("../repository/commentsDatabase");
const taskRepository = require("../repository/tasksDatabase");

async function createComment(task_id, user_id, body) {
  const task = await taskRepository.getoneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const result = await commentsRepository.createComment(task_id, user_id, body);
  return { success: true, value: result };
}

async function getCommentByTask(task_id, user_id) {
  const task = await taskRepository.getoneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const result = await commentsRepository.getCommentByTask(task_id);
  if (!result || result.length === 0) {
    return { success: false, error: "No Comment On Task" };
  }
  return { success: true, value: result };
}

async function getCommentByUser(user_id) {
  const result = await commentsRepository.getCommentByUser(user_id);
  if (!result || result.length === 0) {
    return { success: false, error: "No Comment By User" };
  }
  return { success: true, value: result };
}

async function deleteCommentById(comment_id, user_id) {
  const result = await commentsRepository.deleteCommentByUserAndId(comment_id, user_id);
  if (!result) {
    return { success: false, error: "Comment not found or unauthorized" };
  }
  return { success: true, value: result };
}

async function deleteAllCommentFromTask(task_id, user_id) {
  const task = await taskRepository.getoneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  if (task.user_id !== user_id) {
    return { success: false, error: "Forbidden" };
  }
  
  const result = await commentsRepository.deleteAllCommentFromTask(task_id);
  return { success: true, value: result };
}

module.exports = {
  createComment,
  getCommentByTask,
  getCommentByUser,
  deleteCommentById,
  deleteAllCommentFromTask,
};
