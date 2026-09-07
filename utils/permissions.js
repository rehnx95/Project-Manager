function canEditTask(user_id, task, membership, isAssignee) {
  return Boolean(
    membership &&
      (membership.role === "owner" ||
        task.user_id === user_id ||
        isAssignee),
  );
}

function canRemoveMember(membership) {
  return membership?.role === "owner";
}

function canModifyAnotherAdmin(requestingUser, targetUser) {
  return requestingUser?.role === "admin" && targetUser?.role !== "admin";
}

module.exports = {
  canEditTask,
  canRemoveMember,
  canModifyAnotherAdmin,
};
