const jwt = require("jsonwebtoken");
require("dotenv").config();
const userRepository = require("../repository/usersDatabase");
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.getUser(decoded.id);
    if (!user)
      return res
        .status(401)
        .json({ success: false, error: "User no longer exists" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}

module.exports = authenticateToken;
