function authenticateRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[middleware] authenticateRole checking role:",
      userRole,
      "against allowed:",
      allowedRoles,
      "for:",
      req.url,
    );
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log(
        new Date().toLocaleTimeString("en-GB"),
        "[middleware] authenticateRole - forbidden, role:",
        userRole,
        "not in",
        allowedRoles,
      );
      return res.status(403).send("Forbidden: insufficient role");
    }
    next();
  };
}

module.exports = authenticateRole;