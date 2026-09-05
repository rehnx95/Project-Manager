const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");

const databaseControllers = require("../controllers/databaseControllers");
const authenticateOwner = require("../middleware/authenticateOwner");
const authenticateToken = require("../middleware/authenticateToken");

router.post(
  "/database",
  authenticateToken,
  authenticateOwner,
  asyncHandler(databaseControllers.showDatabase),
);

router.get(
  "/database/queries",
  authenticateToken,
  authenticateOwner,
  asyncHandler(databaseControllers.listDemoQueries),
);

module.exports = router;
