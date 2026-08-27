const projectMemberDatabase = require("../repository/projectMemberDatabase");
const projectDatabase = require("../repository/projectDatabase");

async function getMembership(project_id, user_id) {
  const project = await projectDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const result = await projectMemberDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!result) {
    return { success: false, error: "Membership Not Found" };
  }
  return { success: true, value: result };
}

async function addMemberToProject(project_id, user_id, new_role) {
  const project = await projectDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMemberDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Forbidden" };
  }
  const result = await projectMemberDatabase.addMemberToProject(
    project_id,
    user_id,
    new_role,
  );
  return { success: true, value: result };
}

async function getAllMembersOfProject(project_id) {
  const project = await projectDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const result =
    await projectMemberDatabase.getAllMembersOfProject(project_id);
  return { success: true, value: result };
}

async function countOwner(project_id) {
  const member_list =
    await projectMemberDatabase.getAllMembersOfProject(project_id);
  const count = member_list.filter((x) => x.role === "owner").length;
  return count;
}

async function getAllProjectsOfUser(user_id) {
  const result = await projectMemberDatabase.getAllProjectsOfUser(user_id);
  return { success: true, value: result };
}

async function removeMemberFromProject(
  project_id,
  requesting_user_id,
  target_user_id,
) {
  const project = await projectDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }

  const requester_membership = await projectMemberDatabase.getMembership(
    project_id,
    requesting_user_id,
  );
  if (!requester_membership || requester_membership.role !== "owner") {
    return { success: false, error: "Forbidden" };
  }
  const target_membership = await projectMemberDatabase.getMembership(
    project_id,
    target_user_id,
  );
  if (target_membership && target_membership.role === "owner") {
    const owner_count = await countOwner(project_id);
    if (owner_count <= 1) {
      return { success: false, error: "Cannot remove the last owner" };
    }
  }

 const result = await projectMemberDatabase.removeMemberFromProject(
    project_id,
    target_user_id,
  );
  return { success: true, value: result };
}

async function changeMemberRole(
  project_id,
  requesting_user_id,
  target_user_id,
  new_role,
) {
  const project = await projectDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }

  const requester_membership = await projectMemberDatabase.getMembership(
    project_id,
    requesting_user_id,
  );
  if (!requester_membership || requester_membership.role !== "owner") {
    return { success: false, error: "Forbidden" };
  }

  const target_membership = await projectMemberDatabase.getMembership(
    project_id,
    target_user_id,
  );

  if (target_membership && target_membership.role === "owner") {
    const owner_count = await countOwner(project_id);
    if (owner_count <= 1) {
      return { success: false, error: "Cannot remove the last owner" };
    }
  }
  const result = await projectMemberDatabase.changeMemberRole(
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
