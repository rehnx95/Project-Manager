const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const asyncHandler = require("../utils/asyncHandler");
const projectControllers = require("../controllers/projectControllers");

router.post(
  "/projects",
  authenticateToken,
  asyncHandler(projectControllers.createProject),
);
router.get(
  "/projects/:project_id",
  authenticateToken,
  asyncHandler(projectControllers.getOneProject),
);
router.get(
  "/projects",
  authenticateToken,
  asyncHandler(projectControllers.getProjects),
);
router.get(
  "/projects/:project_id/tasks",
  authenticateToken,
  asyncHandler(projectControllers.getTaskByProject),
);

router.patch(
  "/projects/:project_id",
  authenticateToken,
  asyncHandler(projectControllers.updateProject),
);

router.delete(
  "/projects/:project_id",
  authenticateToken,
  asyncHandler(projectControllers.deleteProject),
);
module.exports = router;
