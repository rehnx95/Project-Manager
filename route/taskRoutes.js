const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const asyncHandler = require("../utils/asyncHandler");
const taskControllers = require("../controllers/taskControllers");

router.post(
  "/projects/:project_id/tasks",
  authenticateToken,
  asyncHandler(taskControllers.createTask),
);
router.get(
  "/tasks/:task_id",
  authenticateToken,
  asyncHandler(taskControllers.getOneTask),
);
router.patch(
  "/tasks/:task_id",
  authenticateToken,
  asyncHandler(taskControllers.updateTask),
);
router.patch(
  "/tasks/:task_id/complete",
  authenticateToken,
  asyncHandler(taskControllers.completeTask),
);
router.delete(
  "/tasks/:task_id",
  authenticateToken,
  asyncHandler(taskControllers.deleteTask),
);

module.exports = router;
