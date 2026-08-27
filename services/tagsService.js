const tagsRepository = require("../repository/tagsDatabase");
const taskRepository = require("../repository/tasksDatabase");

async function createTag(tagName) {
  const result = await tagsRepository.createTag(tagName);
  return { success: true, value: result };
}

async function getAllTags() {
  const result = await tagsRepository.getAllTags();
  return { success: true, value: result };
}

async function addTagToTask(taskId, tagId) {
  const task = await taskRepository.getoneTask(taskId);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const tag = await tagsRepository.getoneTag(tagId);
  if (!tag) {
    return { success: false, error: "Tag Not Exist" };
  }
  const result = await tagsRepository.addTagToTask(taskId, tagId);
  return { success: true, value: result };
}

async function getTaskTags(taskId) {
  const task = await taskRepository.getoneTask(taskId);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const result = await tagsRepository.getTaskTags(taskId);
  return { success: true, value: result };
}

async function removeTagFromTask(taskId, tagId) {
  const task = await taskRepository.getoneTask(taskId);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const tag = await tagsRepository.getoneTag(tagId);
  if (!tag) {
    return { success: false, error: "Tag Not Exist" };
  }
  const result = await tagsRepository.removeTagFromTask(taskId, tagId);
  return { success: true, value: "no content" };
}

module.exports = {
  createTag,
  getAllTags,
  addTagToTask,
  getTaskTags,
  removeTagFromTask,
};
