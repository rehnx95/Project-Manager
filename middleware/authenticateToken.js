const jwt = require("jsonwebtoken");
require("dotenv").config();
const userRepository=require("../repository/usersDatabase")
async function authenticateToken(req, res, next) {
  console.log(new Date().toLocaleTimeString("en-GB"),"[middleware] authenticateToken running for:", req.url);
  const authHeader = req.headers.authorization;
  console.log(new Date().toLocaleTimeString("en-GB"),"[middleware] authHeader:", authHeader);
  if (!authHeader) {
    console.log(new Date().toLocaleTimeString("en-GB"),"[middleware] no token provided");
    return res.status(401).send("No token provided");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(new Date().toLocaleTimeString("en-GB"),"[middleware] token valid, decoded:", decoded);
    const user = await userRepository.getUser(decoded.id); 
    if (!user) return res.status(401).send("User no longer exists");
    req.user = decoded;
    next();
  } catch (err) {
    console.log(new Date().toLocaleTimeString("en-GB"),"[middleware] token invalid:", err.message);
    return res.status(401).send("invalid token");
  }
}

module.exports = authenticateToken;