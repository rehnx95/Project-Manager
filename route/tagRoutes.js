const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const asyncHandler = require("../utils/asyncHandler");
const tagControllers = require("../controllers/tagControllers");

router.post("/tags", authenticateToken, asyncHandler(tagControllers.createTag));
router.get("/tags", authenticateToken, asyncHandler(tagControllers.getAllTags));

// task <-> tag (previously missing — controllers/repository already
// supported this, they just weren't wired to a route)
router.post(
  "/tasks/:task_id/tags/:tag_id",
  authenticateToken,
  asyncHandler(tagControllers.addTagToTask),
);
router.get(
  "/tasks/:task_id/tags",
  authenticateToken,
  asyncHandler(tagControllers.getTaskTags),
);
router.delete(
  "/tasks/:task_id/tags/:tag_id",
  authenticateToken,
  asyncHandler(tagControllers.removeTagFromTask),
);

module.exports = router;
