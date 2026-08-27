const projectMemberRepository = require("../repository/projectMemberDatabase");
const projectRepository = require("../repository/projectDatabase");

async function getMembership(project_id, user_id) {
  const project = await projectRepository.getoneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const result = await projectMemberRepository.getMembership(
    project_id,
    user_id,
  );
  if (!result) {
    return { success: false, error: "Membership Not Found" };
  }
  return { success: true, value: result };
}

async function addMemberToProject(project_id, user_id, role) {
  const project = await projectRepository.getoneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMemberRepository.getMembership(
    project_id,
    user_id,
  );
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Forbidden" };
  }
  const result = await projectMemberRepository.addMemberToProject(
    project_id,
    user_id,
    role,
  );
  return { success: true, value: result };
}

async function getAllMembersOfProject(project_id) {
  const project = await projectRepository.getoneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const result =
    await projectMemberRepository.getAllMembersOfProject(project_id);
  return { success: true, value: result };
}

async function countOwner(project_id) {
  const memberList =
    await projectMemberRepository.getAllMembersOfProject(project_id);
  const count = memberList.filter((x) => x.role === "owner").length;
  return count;
}

async function getAllProjectsOfUser(user_id) {
  const result = await projectMemberRepository.getAllProjectsOfUser(user_id);
  return { success: true, value: result };
}

async function removeMemberFromProject(
  project_id,
  requesting_user_id,
  target_user_id,
) {
  const project = await projectRepository.getoneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }

  const requesterMembership = await projectMemberRepository.getMembership(
    project_id,
    requesting_user_id,
  );
  if (!requesterMembership || requesterMembership.role !== "owner") {
    return { success: false, error: "Forbidden" };
  }
  const targetMembership = await projectMemberRepository.getMembership(
    project_id,
    target_user_id,
  );
  if (targetMembership && targetMembership.role === "owner") {
    const ownerCount = await countOwner(project_id);
    if (ownerCount <= 1) {
      return { success: false, error: "Cannot remove the last owner" };
    }
  }

  await projectMemberRepository.removeMemberFromProject(
    project_id,
    target_user_id,
  );
  return { success: true, value: "no content" };
}

async function changeMemberRole(
  project_id,
  requesting_user_id,
  target_user_id,
  new_role,
) {
  const project = await projectRepository.getoneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }

  const requesterMembership = await projectMemberRepository.getMembership(
    project_id,
    requesting_user_id,
  );
  if (!requesterMembership || requesterMembership.role !== "owner") {
    return { success: false, error: "Forbidden" };
  }

  const targetMembership = await projectMemberRepository.getMembership(
    project_id,
    target_user_id,
  );

  if (targetMembership && targetMembership.role === "owner") {
    const ownerCount = await countOwner(project_id);
    if (ownerCount <= 1) {
      return { success: false, error: "Cannot remove the last owner" };
    }
  }
  const result = await projectMemberRepository.changeMemberRole(
    project_id,
    target_user_id,
    new_role,
  );
  return { success: true, value: result };
}

module.exports = {
  addMemberToProject,
  changeMemberRole,
  getAllMembersOfProject,
  removeMemberFromProject,
  getAllProjectsOfUser,
  getMembership,
};
