const projectRepository = require("../repository/projectDatabase");
const userRepository = require("../repository/usersDatabase");
const projectMemberRepository = require("../repository/projectMemberDatabase");
const { success } = require("zod");

async function createProject(user_id, project_name, description, status) {
  const user = await userRepository.getUser(user_id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }

  const newProject = {
    user_id,
    project_name,
    description,
    status,
  };
  const result = await projectRepository.createProject(newProject);
  await projectMemberRepository.addMemberToProject(result.id, user_id, "owner");
  return { success: true, value: result };
}

// logged in user can see all their by searching with project id
async function getoneProject(project_id) {
  const project = await projectRepository.getoneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Found" };
  }
  return { success: true, value: project };
}

// only admins or logged in user (with their own user_id) can do
// middleware use to check non - member or member/owner
async function getProject(user_id) {
  const user = await userRepository.getUser(user_id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }

  const project = await projectRepository.getProject(user_id);
  return { success: true, value: project };
}

async function getTaskByProject(project_id) {
  const project = await projectRepository.getoneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Found" };
  }

  const tasks = await projectRepository.getTaskByProject(project_id);
  return { success: true, value: tasks };
}

async function updateProject(
  user_id,
  project_id,
  newProjectName,
  newDescription,
  newStatus,
) {
  const project = await projectRepository.getoneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMemberRepository.getMembership(project_id, user_id);
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Project Not Exist" };
  }
  const updatedProject = await projectRepository.updateProject(
    project_id,
    newProjectName,
    newDescription,
    newStatus,
  );
  return { success: true, value: updatedProject };
}

async function deleteProject(project_id, user_id) {
  const project = await projectRepository.getoneProject(project_id);
  const membership = await projectMemberRepository.getMembership(
    project_id,
    user_id,
  );
  if (!project || !membership || membership.role !== "owner") {
    return { success: false, error: "Project Not Exist" };
  }
  const result = await projectRepository.deleteProject(project_id);
  return { success: true, value: "no content" };
}

module.exports = {
  createProject,
  getoneProject,
  getProject,
  getTaskByProject,
  updateProject,
  deleteProject,
};
