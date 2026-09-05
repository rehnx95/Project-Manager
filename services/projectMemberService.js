const projectMembersDatabase = require("../repository/projectMembersDatabase");
const projectsDatabase = require("../repository/projectsDatabase");

async function getMembership(project_id, user_id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[projectMemberService] getMembership",
  );
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

async function addMemberToProject(
  project_id,
  target_user_id,
  new_role,
  requesting_user_id,
) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[projectMemberService] addMemberToProject",
  );
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
      error: "Forbidden Only Owner Can Add Member To That Project",
    };
  }
  const added_member = await projectMembersDatabase.addMemberToProject(
    project_id,
    target_user_id,
    new_role,
  );
  return { success: true, value: added_member };
}

async function getAllMembersOfProject(user_id, project_id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[projectMemberService] getAllMembersOfProject",
  );
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
  const project_members =
    await projectMembersDatabase.getAllMembersOfProject(project_id);
  return { success: true, value: project_members };
}

async function countOwner(project_id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[projectMemberService] countOwner",
  );
  const member_list =
    await projectMembersDatabase.getAllMembersOfProject(project_id);
  const count = member_list.filter((x) => x.role === "owner").length;
  return count;
}

async function removeMemberFromProject(
  project_id,
  requesting_user_id,
  target_user_id,
) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[projectMemberService] removeMemberFromProject",
  );
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
  if (!target_membership) {
    return { success: false, error: "Forbidden Not Member Of That Project" };
  }
  if (target_membership.role === "owner") {
    const owner_count = await countOwner(project_id);
    if (owner_count <= 1) {
      return {
        success: false,
        error: "Forbidden Cannot Change The Role Of The Last Owner",
      };
    }
  }
  const removed_member = await projectMembersDatabase.removeMemberFromProject(
    project_id,
    target_user_id,
  );
  return { success: true, value: removed_member };
}

async function changeMemberRole(
  project_id,
  requesting_user_id,
  target_user_id,
  new_role,
) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[projectMemberService] changeMemberRole",
  );
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
  if (!target_membership) {
    return { success: false, error: "Forbidden Not Member Of That Project" };
  }
  if (target_membership.role === "owner") {
    const owner_count = await countOwner(project_id);
    if (owner_count <= 1) {
      return {
        success: false,
        error: "Forbidden Cannot Change The Role Of The Last Owner",
      };
    }
  }
  const changed_member = await projectMembersDatabase.changeMemberRole(
    project_id,
    target_user_id,
    new_role,
  );
  return { success: true, value: changed_member };
}

module.exports = {
  addMemberToProject,
  changeMemberRole,
  getAllMembersOfProject,
  removeMemberFromProject,
  getMembership,
};
