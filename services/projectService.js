const projectRepository = require("../repository/projectDatabase");
const userRepository = require("../repository/usersDatabase");

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
  return { success: true, value: result };
}

async function getoneProject(id) {
  const project = await projectRepository.getoneProject(id);
  if (!project) {
    return { success: false, error: "Project Not Found" };
  }
  return { success: true, value: project };
}

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

async function updateProject(id, newProjectName, newDescription, newStatus) {
  const project = await projectRepository.getoneProject(id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const updatedProject = await projectRepository.updateProject(
    id,
    newProjectName,
    newDescription,
    newStatus,
  );
  return { success: true, value: updatedProject };
}

module.exports = {
  createProject,
  getoneProject,
  getProject,
  getTaskByProject,
  updateProject,
};
