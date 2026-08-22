function authenticateRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).send("Forbidden: insufficient role");
    }
    next();
  };
}

module.exports = authenticateRole;
