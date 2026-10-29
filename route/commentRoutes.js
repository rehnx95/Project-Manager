const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const asyncHandler = require("../utils/asyncHandler");
const commentControllers = require("../controllers/commentControllers");

router.post(
  "/tasks/:task_id/comments",
  authenticateToken,
  asyncHandler(commentControllers.createComment),
);

router.get(
  "/tasks/:task_id/comments",
  authenticateToken,
  asyncHandler(commentControllers.getCommentByTask),
);

router.delete(
  "/tasks/:task_id/comments",
  authenticateToken,
  asyncHandler(commentControllers.deleteAllCommentFromTask),
);

module.exports = router;
