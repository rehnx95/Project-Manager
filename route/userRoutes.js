const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");
const taskControllers = require("../controllers/taskControllers");

const projectMemberControllers = require("../controllers/projectMemberControllers");
const commentControllers = require("../controllers/commentControllers");
const authenticateToken = require("../middleware/authenticateToken");
const authenticateRole = require("../middleware/authenticateRole");

const asyncHandler = require("../utils/asyncHandler");

router.post("/users/signup", asyncHandler(userControllers.signup));
router.post("/users/login", asyncHandler(userControllers.login));

router.post(
  "/users/profile",
  authenticateToken,
  asyncHandler(userControllers.createProfile),
);
router.patch(
  "/users/profile",
  authenticateToken,
  asyncHandler(userControllers.updateProfile),
);
router.get(
  "/users/profile",
  authenticateToken,
  asyncHandler(userControllers.getProfile),
);

router.get(
  "/users/projects",
  authenticateToken,
  asyncHandler(projectMemberControllers.getAllProjectsOfUser),
);

router.get(
  "/users/tasks",
  authenticateToken,
  asyncHandler(taskControllers.getTaskByUser),
);

router.get(
  "/users/comments",
  authenticateToken,
  asyncHandler(commentControllers.getCommentByUser),
);
router.delete(
  "/users/comments/:comment_id",
  authenticateToken,
  asyncHandler(commentControllers.deleteCommentById),
);

router.delete(
  "/users",
  authenticateToken,
  asyncHandler(userControllers.deleteUser),
);

router.patch(
  "/users",
  authenticateToken,
  asyncHandler(userControllers.selfUpdateEmail),
);

router.patch(
  "/users/:target_id",
  authenticateToken,
  authenticateRole("admin"),
  asyncHandler(userControllers.updateOtherEmail),
);
router.get(
  "/users",
  authenticateToken,
  authenticateRole("admin"),
  asyncHandler(userControllers.getAllUsers),
);
router.get(
  "/users/:target_id",
  authenticateToken,
  authenticateRole("admin"),
  asyncHandler(userControllers.getUser),
);

module.exports = router;
