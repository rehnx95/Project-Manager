const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canEditTask,
  canRemoveMember,
  canModifyAnotherAdmin,
} = require("../utils/permissions");

test("task creators, owners, and assignees can edit tasks", () => {
  const task = { user_id: "creator" };
  assert.equal(canEditTask("creator", task, { role: "member" }, false), true);
  assert.equal(canEditTask("owner", task, { role: "owner" }, false), true);
  assert.equal(canEditTask("assignee", task, { role: "member" }, true), true);
  assert.equal(canEditTask("member", task, { role: "member" }, false), false);
});

test("only owners can manage project membership", () => {
  assert.equal(canRemoveMember({ role: "owner" }), true);
  assert.equal(canRemoveMember({ role: "member" }), false);
});

test("admins cannot modify another admin", () => {
  assert.equal(
    canModifyAnotherAdmin({ role: "admin" }, { role: "user" }),
    true,
  );
  assert.equal(
    canModifyAnotherAdmin({ role: "admin" }, { role: "admin" }),
    false,
  );
});
