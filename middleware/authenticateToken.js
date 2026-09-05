const jwt = require("jsonwebtoken");
require("dotenv").config();
const userRepository = require("../repository/usersDatabase");

async function authenticateToken(req, res, next) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[authenticateToken] authenticateToken");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];

  // Step 1: verify the token itself. Only THIS failing means "log the user out."
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }

  // Step 2: look the user up. A failure here is a server/DB hiccup, not a bad
  // token — don't punish the client's session for it.
  try {
    const user = await userRepository.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: "User no longer exists" });
    }
    req.user = user;
    next();
  } catch (dbErr) {
    console.error(new Date().toLocaleTimeString("en-GB"), "[authenticateToken] DB error", dbErr.message);
    return res.status(503).json({ success: false, error: "Server temporarily unavailable — please try again" });
  }
}

module.exports = authenticateToken;