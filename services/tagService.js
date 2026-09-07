const tagsDatabase = require("../repository/tagsDatabase");
const tasksDatabase = require("../repository/tasksDatabase");
const projectMembersDatabase = require("../repository/projectMembersDatabase");

async function createTag(project_id, tag_name, user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagService] createTag");
  const membership = await projectMembersDatabase.getMembership(project_id, user_id);
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Forbidden Only Owner Can Create Tags" };
  }
  const result = await tagsDatabase.createTag(project_id, tag_name);
  return { success: true, value: result };
}

async function getAllTags(project_id, user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagService] getAllTags");
  const membership = await projectMembersDatabase.getMembership(project_id, user_id);
  if (!membership) return { success: false, error: "Forbidden Not Member Of That Project" };
  const result = await tagsDatabase.getAllTags(project_id);
  return { success: true, value: result };
}

async function addTagToTask(task_id, tag_id, user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagService] addTagToTask");
  const task = await tasksDatabase.getOneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const tag = await tagsDatabase.getOneTag(tag_id);
  if (!tag) {
    return { success: false, error: "Tag Not Exist" };
  }
  if (tag.project_id !== task.project_id) {
    return { success: false, error: "Tag Not In Task Project" };
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

  const result = await tagsDatabase.addTagToTask(task_id, tag_id);
  return { success: true, value: result };
}

async function getTaskTags(task_id, user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagService] getTaskTags");
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

  const result = await tagsDatabase.getTaskTags(task_id);
  return { success: true, value: result };
}

async function removeTagFromTask(task_id, tag_id, user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagService] removeTagFromTask");
  const task = await tasksDatabase.getOneTask(task_id);
  if (!task) {
    return { success: false, error: "Task Not Exist" };
  }
  const tag = await tagsDatabase.getOneTag(tag_id);
  if (!tag) {
    return { success: false, error: "Tag Not Exist" };
  }
  if (tag.project_id !== task.project_id) {
    return { success: false, error: "Tag Not In Task Project" };
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