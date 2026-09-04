const express = require("express");
const router = express.Router();

const noteControllers = require("../controllers/noteControllers");
const authenticateToken = require("../middleware/authenticateToken");
const asyncHandler = require("../utils/asyncHandler");

router.post(
  "/notes",
  authenticateToken,
  asyncHandler(noteControllers.createNotes),
);

router.get(
  "/notes",
  authenticateToken,
  asyncHandler(noteControllers.listNotes),
);
router.delete(
  "/notes",
  authenticateToken,
  asyncHandler(noteControllers.deleteAllNotes),
);

router.get(
  "/notes/:note_id",
  authenticateToken,
  asyncHandler(noteControllers.getOneNote),
);

router.patch(
  "/notes/:note_id",
  authenticateToken,
  asyncHandler(noteControllers.updateNote),
);

router.delete(
  "/notes/:note_id",
  authenticateToken,
  asyncHandler(noteControllers.deleteNote),
);

module.exports = router;