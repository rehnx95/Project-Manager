const tagsDatabase = require("../repository/tagsDatabase");
const tasksDatabase = require("../repository/tasksDatabase");

async function createTag(tag_name) {
  const result = await tagsDatabase.createTag(tag_name);
  return { success: true, value: result };
}

async function getAllTags() {
  const result = await tagsDatabase.getAllTags();
  return { success: true, value: result };
}

async function addTagToTask(task_id, tag_id) {
  const task = await tasksDatabase.getOneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const tag = await tagsDatabase.getOneTag(tag_id);
  if (!tag) {
    return { success: false, error: "Tag Not Exist" };
  }
  const result = await tagsDatabase.addTagToTask(task_id, tag_id);
  return { success: true, value: result };
}

async function getTaskTags(task_id) {
  const task = await tasksDatabase.getOneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const result = await tagsDatabase.getTaskTags(task_id);
  return { success: true, value: result };
}

async function removeTagFromTask(task_id, tag_id) {
  const task = await tasksDatabase.getOneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const tag = await tagsDatabase.getOneTag(tag_id);
  if (!tag) {
    return { success: false, error: "Tag Not Exist" };
  }
  const result = await tagsDatabase.removeTagFromTask(task_id, tag_id);
  return { success: true, value: result };
}

module.exports = {
  createTag,
  getAllTags,
  addTagToTask,
  getTaskTags,
  removeTagFromTask,
};
