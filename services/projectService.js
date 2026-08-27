const projectDatabase = require("../repository/projectDatabase");
const usersDatabase = require("../repository/usersDatabase");
const projectMemberDatabase = require("../repository/projectMemberDatabase");

async function createProject(
  user_id,
  new_project_name,
  new_description,
  new_status,
) {
  const user = await usersDatabase.getUser(user_id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }

  const new_project = {
    user_id,
    new_project_name,
    new_description,
    new_status,
  };
  const result = await projectDatabase.createProject(new_project);
  await projectMemberDatabase.addMemberToProject(result.id, user_id, "owner");
  return { success: true, value: result };
}

// logged in user can see all their by searching with project id
async function getOneProject(project_id) {
  const project = await projectDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Found" };
  }
  return { success: true, value: project };
}

// only admins or logged in user (with their own user_id) can do
// middleware use to check non - member or member/owner
async function getProject(user_id) {
  const user = await usersDatabase.getUser(user_id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }

  const project = await projectDatabase.getProject(user_id);
  return { success: true, value: project };
}

async function getTaskByProject(project_id) {
  const project = await projectDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Found" };
  }

  const tasks = await projectDatabase.getTaskByProject(project_id);
  return { success: true, value: tasks };
}

async function updateProject(
  user_id,
  project_id,
  new_project_name,
  new_description,
  new_status,
) {
  const project = await projectDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMemberDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Project Not Exist" };
  }
  const updated_project = await projectDatabase.updateProject(
    project_id,
    new_project_name,
    new_description,
    new_status,
  );
  return { success: true, value: updated_project };
}

async function deleteProject(project_id, user_id) {
  const project = await projectDatabase.getOneProject(project_id);
  const membership = await projectMemberDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!project || !membership || membership.role !== "owner") {
    return { success: false, error: "Project Not Exist" };
  }
  const result = await projectDatabase.deleteProject(project_id);
  return { success: true, value: result };
}

module.exports = {
  createProject,
  getOneProject,
  getProject,
  getTaskByProject,
  updateProject,
  deleteProject,
};
