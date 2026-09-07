const jwt = require("jsonwebtoken");
require("dotenv").config();
const userRepository = require("../repository/usersDatabase");
const securityDatabase = require("../repository/securityDatabase");

async function authenticateToken(req, res, next) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[authenticateToken] authenticateToken");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, error: "Invalid authorization header" });
  }

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
    if (!decoded.jti || !(await securityDatabase.isTokenActive(decoded.jti, decoded.id))) {
      return res.status(401).json({ success: false, error: "Session expired or revoked" });
    }
    const user = await userRepository.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: "User no longer exists" });
    }
    req.user = user;
    req.auth = decoded;
    next();
  } catch (dbErr) {
    console.error(new Date().toLocaleTimeString("en-GB"), "[authenticateToken] DB error", dbErr.message);
    return res.status(503).json({ success: false, error: "Server temporarily unavailable — please try again" });
  }
}

module.exports = authenticateToken;