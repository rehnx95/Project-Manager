const { success } = require("zod");
const projectMembersDatabase = require("../repository/projectMembersDatabase");
const projectsDatabase = require("../repository/projectsDatabase");

async function getMembership(project_id, user_id) {
  const project = await projectsDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership) {
    return { success: false, error: "Forbidden Not Member Of That Project" };
  }
  return { success: true, value: membership };
}

async function addMemberToProject(project_id, user_id, new_role) {
  const project = await projectsDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership || membership.role !== "owner") {
    return {
      success: false,
      error: "Forbidden Only Owner Can Add Member To Project",
    };
  }
  const result = await projectMembersDatabase.addMemberToProject(
    project_id,
    user_id,
    new_role,
  );
  return { success: true, value: result };
}

async function getAllMembersOfProject(user_id, project_id) {
  const project = await projectsDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }
  const membership = await projectMembersDatabase.getMembership(
    project_id,
    user_id,
  );
  if (!membership) {
    return { success: false, error: "Forbidden Not Member Of That Project" };
  }
  const result =
    await projectMembersDatabase.getAllMembersOfProject(project_id);
  return { success: true, value: result };
}

async function countOwner(project_id) {
  const member_list =
    await projectMembersDatabase.getAllMembersOfProject(project_id);
  const count = member_list.filter((x) => x.role === "owner").length;
  return count;
}

async function getAllProjectsOfUser(user_id) {
  const result = await projectMembersDatabase.getAllProjectsOfUser(user_id);
  if (!result) {
    return { success: false, error: "Project Not Exist" };
  }
  return { success: true, value: result };
}

async function removeMemberFromProject(
  project_id,
  requesting_user_id,
  target_user_id,
) {
  const project = await projectsDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }

  const requester_membership = await projectMembersDatabase.getMembership(
    project_id,
    requesting_user_id,
  );
  if (!requester_membership || requester_membership.role !== "owner") {
    return {
      success: false,
      error: "Forbidden Only Owner Can Remove Member From Project",
    };
  }
  const target_membership = await projectMembersDatabase.getMembership(
    project_id,
    target_user_id,
  );
  if (target_membership && target_membership.role === "owner") {
    const owner_count = await countOwner(project_id);
    if (owner_count <= 1) {
      return {
        success: false,
        error: "Forbidden Cannot Remove The Last Owner",
      };
    }
  }

  const result = await projectMembersDatabase.removeMemberFromProject(
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
  const project = await projectsDatabase.getOneProject(project_id);
  if (!project) {
    return { success: false, error: "Project Not Exist" };
  }

  const requester_membership = await projectMembersDatabase.getMembership(
    project_id,
    requesting_user_id,
  );
  if (!requester_membership || requester_membership.role !== "owner") {
    return {
      success: false,
      error: "Forbidden Only Owner Can Change Role Of Member From Project",
    };
  }

  const target_membership = await projectMembersDatabase.getMembership(
    project_id,
    target_user_id,
  );

  if (target_membership && target_membership.role === "owner") {
    const owner_count = await countOwner(project_id);
    if (owner_count <= 1) {
      return {
        success: false,
        error: "Forbidden Cannot Change The Role Of The Last Owner",
      };
    }
  }
  const result = await projectMembersDatabase.changeMemberRole(
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
