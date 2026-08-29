const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersDatabase = require("../repository/usersDatabase");
const { success } = require("zod");

async function signup(email, password) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[userService] signup");
  const existing = await usersDatabase.findByEmail(email);
  if (existing) {
    return { success: false, error: "Email Already Exist" };
  }
  const hashed_password = await bcrypt.hash(password, 10);
  const new_user = {
    email,
    password: hashed_password,
  };
  const result = await usersDatabase.createUsers(new_user);
  return { success: true, value: result };
}

async function login(email, password) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[userService] login");
  const user = await usersDatabase.findByEmail(email);
  const hash_to_compare = user
    ? user.password
    : "$2b$10$invalidsaltinvalidsaltinvalidsa";
  const is_match = await bcrypt.compare(password, hash_to_compare);

  if (!user || !is_match) {
    return { success: false, error: "Unauthorize" };
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
  return { success: true, value: token };
}

async function updateUser(id, new_email) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[userService] updateUser");
  const user = await usersDatabase.getUser(id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }
  const email_check = await usersDatabase.findByEmail(new_email);
  if (email_check && email_check.id !== id) {
    return { success: false, error: "Email Already Exist" };
  }
  const updated_user = await usersDatabase.updateUser(id, new_email);
  const new_user = {
    id: updated_user.id,
    oldEmail: user.email,
    newEmail: updated_user.email,
  };
  return { success: true, value: new_user };
}

async function getUser(id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[userService] getUser");
  const user = await usersDatabase.getUser(id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }
  return { success: true, value: user };
}

async function getAllUser() {
  console.log(new Date().toLocaleTimeString("en-GB"), "[userService] getAllUser");
  const result = await usersDatabase.getall();
  return { success: true, value: result };
}

async function deleteUser(email) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[userService] deleteUser");
  const result = await usersDatabase.deleteUser(email);
  if (!result) {
    return { success: false, error: "User Not Exist" };
  }
  return { success: true, value: result };
}

async function createProfile(user_id, new_name, new_bio) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[userService] createProfile");
  const user = await usersDatabase.getUser(user_id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }

  const new_profile = {
    user_id,
    new_name,
    new_bio,
  };
  const created_profile = await usersDatabase.createProfile(new_profile);
  return { success: true, value: created_profile };
}

async function updateProfile(user_id, new_name, new_bio) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[userService] updateProfile");
  const user = await usersDatabase.getUser(user_id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }
  const updated_profile = await usersDatabase.updateProfile(
    user_id,
    new_name,
    new_bio,
  );
  if (!updated_profile) return { success: false, error: "Profile Not Exist" };

  return { success: true, value: updated_profile };
}

async function getProfile(user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[userService] getProfile");
  const user = await usersDatabase.getUser(user_id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }
  const profile = await usersDatabase.getProfile(user_id);
  if (!profile) return { success: false, error: "Profile Not Exist" };
  return { success: true, value: profile };
}

module.exports = {
  signup,
  login,
  getAllUser,
  deleteUser,
  getUser,
  updateUser,
  updateProfile,
  createProfile,
  getProfile,
};