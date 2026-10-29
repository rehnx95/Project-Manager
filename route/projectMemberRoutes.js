const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const asyncHandler = require("../utils/asyncHandler");
const projectMemberControllers = require("../controllers/projectMemberControllers");
    
router.get(
  "/projects/:project_id/membership",
  authenticateToken,
  asyncHandler(projectMemberControllers.getMembership),
);

router.post(
  "/projects/:project_id/users/:target_user_id",
  authenticateToken,
  asyncHandler(projectMemberControllers.addMemberToProject),
);

router.get(
  "/projects/:project_id/members",
  authenticateToken,
  asyncHandler(projectMemberControllers.getAllMembersOfProject),
);

router.delete(
  "/projects/:project_id/users/:target_user_id",
  authenticateToken,
  asyncHandler(projectMemberControllers.removeMemberFromProject),
);

router.patch(
  "/projects/:project_id/users/:target_user_id",
  authenticateToken,
  asyncHandler(projectMemberControllers.changeMemberRole),
);

module.exports = router;