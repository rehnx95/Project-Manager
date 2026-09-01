const projectsDatabase = require("../repository/projectsDatabase");
const usersDatabase = require("../repository/usersDatabase");
const projectMembersDatabase = require("../repository/projectMembersDatabase");

async function createProject(
  user_id,
  new_project_name,
  new_description,
  new_status,
) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectService] createProject");

  const new_project = {
    user_id,
    new_project_name,
    new_description,
    new_status,
  };
  const created_project = await projectsDatabase.createProject(new_project);
  await projectMembersDatabase.addMemberToProject(created_project.id, user_id, "owner");
  return { success: true, value: created_project };
}

// logged in user can see all their by searching with project id
async function getOneProject(user_id, project_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectService] getOneProject");
  const project = await projectsDatabase.getOneProject(project_id);

  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership) {
    return { success: false, error: "Forbidden Not Assign To That Project" };
  }
  return { success: true, value: project };
}

// only admins or logged in user (with their own user_id) can do
// middleware use to check non - member or member/owner
async function getProjects(user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectService] getProjects");

  const memberships =
    await projectMembersDatabase.getAllProjectsOfUser(user_id);
  const projects = await Promise.all(
    memberships.map((m) => projectsDatabase.getOneProject(m.project_id)),
  );

  if (!projects || projects.length === 0) {
    return { success: false, error: "Project Not Exist" };
  }

  return { success: true, value: projects };
}

async function getTaskByProject(user_id, project_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectService] getTaskByProject");
  const project = await projectsDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }

  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership) {
    return { success: false, error: "Forbidden Not Assign To That Project" };
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
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectService] updateProject");
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
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectService] deleteProject");
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
  const deleted_project = await projectsDatabase.deleteProject(project_id);
  return { success: true, value: deleted_project };
}

module.exports = {
  createProject,
  getOneProject,
  getProjects,
  getTaskByProject,
  updateProject,
  deleteProject,
};