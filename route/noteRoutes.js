const express = require("express");
const router = express.Router();

const noteControllers = require("../controllers/noteControllers");
const authenticateToken = require("../middleware/authenticateToken");
const asyncHandler = require("../utils/asyncHandler");

router.post(
  "/users/notes",
  authenticateToken,
  asyncHandler(noteControllers.createNotes),
);

router.get(
  "/users/notes",
  authenticateToken,
  asyncHandler(noteControllers.listNotes),
);
router.delete(
  "/users/notes",
  authenticateToken,
  asyncHandler(noteControllers.deleteAllNotes),
);

router.get(
  "/users/notes/:note_id",
  authenticateToken,
  asyncHandler(noteControllers.getOneNote),
);

router.patch(
  "/users/notes/:note_id",
  authenticateToken,
  asyncHandler(noteControllers.updateNote),
);

router.delete(
  "/users/notes/:note_id",
  authenticateToken,
  asyncHandler(noteControllers.deleteNote),
);

module.exports = router;