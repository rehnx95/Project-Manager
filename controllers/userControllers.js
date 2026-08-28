const { z } = require("zod");
const UserService = require("../services/userService");

const idParamSchema = z.coerce.number().int().positive();

function parsePositiveIntParam(req, res) {
  const result = idParamSchema.safeParse(req.params.id);
  if (!result.success) {
    res.status(400).json({ success: false, error: "Invalid task id" });
    return null;
  }
  return result.data;
}

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

const profile_schema = z.object({
  name: z.string().min(3),
  bio: z.string().min(1),
});

async function signup(req, res) {;
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { email, password } = result.data;
  const outcome = await UserService.signup(email, password);
  if (outcome.success === false) {
    return res.status(409).json({ success: false, error: outcome.error });
  }
  res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function login(req, res) {

  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { email, password } = result.data;
  const outcome = await UserService.login(email, password);
  if (outcome.success === false) {
    return res.status(401).json({ success: false, error: outcome.error });
  }
  res.status(200).json({
    success: true,
    value: "Login Successful",
    token: outcome.value,
  });
}

async function updateUser(req, res) {

  const requested_id = req.params.id;
  if (Number(requested_id) !== req.user.id) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  const result = updateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }

  const outcome = await UserService.updateUser(
    Number(requested_id),
    result.data.email,
  );
  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function getUser(req, res) {
  const requested_id = parsePositiveIntParam(req, res);
  if (requested_id === null) return;

  // Intentionally no ownership check here: this route is admin-only
  // (gated by authenticateRole("admin") in app.js), so any authenticated
  // admin is allowed to look up any user by id.
  const requested_user = await UserService.getUser(requested_id);
  if (requested_user.success === false) {
    return res
      .status(404)
      .json({ success: false, error: requested_user.error });
  }
  res.status(200).json({ success: true, value: requested_user.value });
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
  const id = req.user.id;
  const outcome = await UserService.deleteUser(email);
  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
  }
  res.status(204).send();
}

async function createProfile(req, res) {
  const result = profile_schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const outcome = await UserService.createProfile(
    req.user.id,
    result.data.name,
    result.data.bio,
  );
  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
  }
  res.status(201).json({ success: true, value: outcome.value });
}

async function updateProfile(req, res) {
  const result = profile_schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const outcome = await UserService.updateProfile(
    req.user.id,
    result.data.name,
    result.data.bio,
  );
  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
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
};
