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

async function deleteUser(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] deleteUser hit, user:",
    req.user,
  );
  const email = req.user.email;
  const id = req.user.id;
  await UserService.deleteUser(email);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] deleteUser done for email:",
    email,
  );
  res.json({
    success: true,
    id,
    email,
  });
}

async function getUser(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] getUser hit, params:",
    req.params,
  );
  const requested_id = req.params.id;
  // if (requested_id !== req.user.id) {
  //   return res.status(404).json({ success: false, value: "User Not Exist" });
  // }
  const user = await UserService.getUser(requested_id);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] getUser outcome:",
    user,
  );
  if (user.success === false) {
    return res.json({ success: false, error: user.error });
  }
  res.json({ success: true, user: user.value });
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
    return res.status(403).json({ success: false, value: "Forbidden" });
  }
  const user = await UserService.updateUser(requested_id, req.body.email);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] updateUser outcome:",
    user,
  );
  if (user.success === false) {
    return res.json({ success: false, error: user.error });
  }
  res.json({ success: true, updatedUser: user.value });
}

async function getall(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] getall hit, requester:",
    req.user,
  );
  const trusteduser = req.user.email;
  const trusteduser_id = req.user.id;
  const users = await UserService.getall();
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[controller:user] getall outcome count:",
    users.value ? users.value.length : 0,
  );
  res.json({
    success: true,
    value: users.value,
    trusteduser,
    trusteduser_id,
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
    res.status(409).json({ success: false, error: outcome.error });
  } else {
    res.json({
      success: true,
      value: `SignUp Successful With Email: ${outcome.value}`,
    });
  }
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
  const token =outcome.value;
  if (outcome.success === false) {
    return res.status(401).json({ success: false, error: outcome.error });
  } else {
    res.json({
      success: true,
      value: "Login Successful",
      token: token, 
    });
  }
}

module.exports = { signup, login, getall, deleteUser, getUser, updateUser };
