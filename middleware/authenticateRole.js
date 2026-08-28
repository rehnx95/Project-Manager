const { success } = require("zod");

function authenticateRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = authenticateRole;
