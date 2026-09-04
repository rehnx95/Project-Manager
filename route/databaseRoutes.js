const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");

const databaseControllers = require("../controllers/databaseControllers");
const authenticateOwner = require("../middleware/siteOwner");

router.post(
  "/database",
  authenticateOwner,
  asyncHandler(databaseControllers.showDatabase),
);

module.exports = router;
