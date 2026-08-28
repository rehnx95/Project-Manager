const projectsDatabase = require("../repository/projectsDatabase");
const usersDatabase = require("../repository/usersDatabase");
const projectMembersDatabase = require("../repository/projectMembersDatabase");
const { success } = require("zod");

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
  const result = await projectsDatabase.createProject(new_project);
  await projectMembersDatabase.addMemberToProject(result.id, user_id, "owner");
  return { success: true, value: result };
}

// logged in user can see all their by searching with project id
async function getOneProject(user_id, project_id) {
  const project = await projectsDatabase.getOneProject(project_id);
 
  if (!project) {
    return { success: false, error: "Project Not Found" };
  }
  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership) {
    return { success: false, error: "Forbidden" };
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

  const project = await projectsDatabase.getProject(user_id);
  return { success: true, value: project };
}

async function getTaskByProject(user_id, project_id) {
  const project = await projectsDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Found" };
  }

  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership) {
    return { success: false, error: "Forbidden" };
  }

  const tasks = await projectsDatabase.getTaskByProject(project_id);
  return { success: true, value: tasks };
}

async function updateProject(
  user_id,
  project_id,
  new_project_name,
  new_description,
  new_status,
) {
  const project = await projectsDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Forbidden Only Owner Can Update Project" };
  }
  const updated_project = await projectsDatabase.updateProject(
    project_id,
    new_project_name,
    new_description,
    new_status,
  );
  return { success: true, value: updated_project };
}

async function deleteProject(project_id, user_id) {
  const project = await projectsDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Forbidden Only Owner Can Delete Project" };
  }
  const result = await projectsDatabase.deleteProject(project_id);
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
