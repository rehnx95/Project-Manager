const { z, success } = require("zod");
const UserService = require("../services/userService");
const { error } = require("node:console");

const uuid_schema = z.uuid();

function parseUUIDParam(req, res, param_name) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] parseUUIDParam",
  );
  const result = uuid_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}
const signup_schema = z.object({
  email: z.email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const login_schema = z.object({
  email: z.email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const update_user_schema = z.object({
  email: z.email("Please enter a valid email address").toLowerCase(),
});

const profile_schema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
});

function handleServiceError(res, error) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] handleServiceError",
  );
  if (
    error === "Unauthorize" ||
    error === "Forbidden Only Owner Can Update Other Email"
  ) {
    return res.status(403).json({ success: false, error });
  }
  if (error === "User Not Exist" || error === "Profile Not Exist") {
    return res.status(404).json({ success: false, error });
  }

  if (error === "Email Already Exist") {
    return res.status(409).json({ success: false, error });
  }

  return res.status(400).json({ success: false, error });
}

async function signup(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] signup",
  );
  const result = signup_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }
  const { email, password } = result.data;
  const outcome = await UserService.signup(email, password);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function login(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] login",
  );
  const result = login_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }
  const { email, password } = result.data;
  const outcome = await UserService.login(email, password);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: "Login Successful",
    token: outcome.value,
  });
}

async function selfUpdateEmail(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] selfUpdateEmail",
  );

  const result = update_user_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }

  const outcome = await UserService.selfUpdateEmail(
    req.user.id,
    req.user.email,
    result.data.email,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function updateOtherEmail(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] updateUser",
  );

  const target_id = parseUUIDParam(req, res, "target_id");
  if (target_id === null) return;

  const result = update_user_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }

  const outcome = await UserService.updateOtherEmail(
    req.user.id,
    req.user.email,
    req.user.role,
    target_id,
    result.data.email,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function getUser(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] getUser",
  );
  const target_id = parseUUIDParam(req, res, "target_id");
  if (target_id === null) return;

  // Intentionally no ownership check here: this route is admin-only
  // (gated by authenticateRole("admin") in app.js), so any authenticated
  // admin is allowed to look up any user by id.
  const outcome = await UserService.getUser(target_id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function getAllUsers(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] getAllUsers",
  );
  const outcome = await UserService.getAllUsers();
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function deleteUser(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] deleteUser",
  );
  const email = req.user.email;
  const outcome = await UserService.deleteUser(email);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(204).send();
}

async function createProfile(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] createProfile",
  );
  const result = profile_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }
  const outcome = await UserService.createProfile(
    req.user.id,
    result.data.name,
    result.data.bio,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(201).json({ success: true, value: outcome.value });
}

async function updateProfile(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] updateProfile",
  );
  const result = profile_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }
  const outcome = await UserService.updateProfile(
    req.user.id,
    result.data.name,
    result.data.bio,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function getProfile(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] getProfile",
  );
  const outcome = await UserService.getProfile(req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

module.exports = {
  signup,
  login,
  getAllUsers,
  deleteUser,
  getUser,
  selfUpdateEmail,
  updateOtherEmail,
  createProfile,
  updateProfile,
  getProfile,
};
