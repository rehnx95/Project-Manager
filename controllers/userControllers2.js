const { z } = require("zod");
const UserService = require("../services/userService2");

const signupSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string(),
});

const updateUserSchema = z.object({
  email: z.string().email().toLowerCase(),
});

async function deleteUser(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] deleteUser hit, user:",
    req.user,
  );
  const email = req.user.email;
  const id = req.user.id;
  const outcome = await UserService.deleteUser(email);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] deleteUser outcome:",
    outcome,
  );
  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
  }
  res.json({
    success: true,
    value: { id, email },
  });
}

async function getUser(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] getUser hit, params:",
    req.params,
  );
  const requested_id = req.params.id;
  // Intentionally no ownership check here: this route is admin-only
  // (gated by authenticateRole("admin") in app.js), so any authenticated
  // admin is allowed to look up any user by id.
  const requested_user = await UserService.getUser(requested_id);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] getUser outcome:",
    requested_user,
  );
  if (requested_user.success === false) {
    return res.status(404).json({ success: false, error: requested_user.error });
  }
  res.json({ success: true, value: requested_user.value });
}

async function updateUser(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] updateUser hit, params:",
    req.params,
    "body:",
    req.body,
    "user:",
    req.user,
  );
  const requested_id = req.params.id;
  if (Number(requested_id) !== req.user.id) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:user] updateUser - forbidden, requested_id:",
      requested_id,
      "!= req.user.id:",
      req.user.id,
    );
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  const result = updateUserSchema.safeParse(req.body);
  if (!result.success) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:user] updateUser validation failed:",
      result.error.issues,
    );
    return res.status(400).json({ success: false, error: result.error.issues });
  }

  const outcome = await UserService.updateUser(requested_id, result.data.email);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] updateUser outcome:",
    outcome,
  );
  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
  }
  res.json({ success: true, value: outcome.value });
}

async function getall(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] getall hit, requester:",
    req.user,
  );
  const outcome = await UserService.getall();
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] getall outcome count:",
    outcome.value ? outcome.value.length : 0,
  );
  res.json({
    success: true,
    value: outcome.value,
  });
}

async function signup(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller] signup hit, body:",
    { ...req.body, password: "***" },
  );
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:user] signup validation failed:",
      result.error.issues,
    );
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { email, password } = result.data;
  const outcome = await UserService.signup(email, password);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] signup outcome:",
    outcome,
  );
  if (outcome.success === false) {
    return res.status(409).json({ success: false, error: outcome.error });
  }
  res.status(201).json({
    success: true,
    value: `SignUp Successful With Email: ${outcome.value}`,
  });
}

async function login(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller] login hit, body:",
    { ...req.body, password: "***" },
  );
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[controller:user] login validation failed:",
      result.error.issues,
    );
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { email, password } = result.data;
  const outcome = await UserService.login(email, password);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] login outcome:",
    outcome.success ? "success" : outcome.error,
  );
  if (outcome.success === false) {
    return res.status(401).json({ success: false, error: outcome.error });
  }
  res.json({
    success: true,
    value: "Login Successful",
    token: outcome.value,
  });
}

module.exports = { signup, login, getall, deleteUser, getUser, updateUser };