const { z } = require("zod");
const UserService = require("../services/userService");

const id_schema = z.coerce.number().int().positive();
const uuid_schema = z.uuid();

function parseIdParam(req, res, param_name) {
  const result = id_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

function parseUUIDParam(req, res, param_name) {
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
  if (error === "Unauthorize") {
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

async function updateUser(req, res) {
  const requested_id = parseUUIDParam(req, res, "requested_id");
  if (requested_id === null) return;
  if (requested_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: "Forbidden Not Allow To Update Other Email",
    });
  }

  const result = update_user_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }

  const outcome = await UserService.updateUser(requested_id, result.data.email);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function getUser(req, res) {
  const requested_id = parseUUIDParam(req, res, "requested_id");
  if (requested_id === null) return;

  // Intentionally no ownership check here: this route is admin-only
  // (gated by authenticateRole("admin") in app.js), so any authenticated
  // admin is allowed to look up any user by id.
  const outcome = await UserService.getUser(requested_id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function getAllUser(req, res) {
  const outcome = await UserService.getAllUser();
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function deleteUser(req, res) {
  const email = req.user.email;
  const outcome = await UserService.deleteUser(email);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(204).send();
}

async function createProfile(req, res) {
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
  const outcome = await UserService.getProfile(req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

module.exports = {
  signup,
  login,
  getAllUser,
  deleteUser,
  getUser,
  updateUser,
  createProfile,
  updateProfile,
  getProfile,
};
