const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersDatabase = require("../repository/usersDatabase");

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
  const created_user = await usersDatabase.createUsers(new_user);
  return { success: true, value: created_user };
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

async function selfUpdateEmail(user_id, old_email, new_email) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userService] selfUpdateEmail",
  );
  const email_check = await usersDatabase.findByEmail(new_email);
  if (email_check && email_check.id !== user_id) {
    return { success: false, error: "Email Already Exist" };
  }
  const updated_user = await usersDatabase.updateEmail(user_id, new_email);
  if (!updated_user) {
    return { success: false, error: "User Not Exist" };
  }
  const new_user = {
    id: updated_user.id,
    oldEmail: old_email,
    newEmail: updated_user.email,
  };
  return { success: true, value: new_user };
}

async function updateOtherEmail(
  requested_id,
  requested_email,
  requested_role,
  target_id,
  new_email,
) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userService] updateOtherEmail",
  );

  if (requested_role !== "admin") {
    return {
      success: false,
      error: "Forbidden Only Owner Can Update Other Email",
    };
  }

  const email_check = await usersDatabase.findByEmail(new_email);
  if (email_check && email_check.id !== target_id) {
    return { success: false, error: "Email Already Exist" };
  }

  const user = await usersDatabase.getUser(target_id);
  const updated_user = await usersDatabase.updateEmail(target_id, new_email);
  if (!updated_user) {
    return { success: false, error: "User Not Exist" };
  }

  const new_user = {
    id: target_id,
    oldEmail: user.email,
    newEmail: new_email,
    requestedAdminId: requested_id,
    requestedAdminEmail: requested_email,
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

async function getAllUsers() {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userService] getAllUsers",
  );
  const all_users = await usersDatabase.getAllUsers();
  return { success: true, value: all_users };
}

async function deleteUser(email) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userService] deleteUser",
  );
  const deleted_user = await usersDatabase.deleteUser(email);
  if (!deleted_user) {
    return { success: false, error: "User Not Exist" };
  }
  return { success: true, value: deleted_user };
}

async function createProfile(user_id, new_name, new_bio) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userService] createProfile",
  );

  const new_profile = {
    user_id,
    new_name,
    new_bio,
  };
  const created_profile = await usersDatabase.createProfile(new_profile);
  return { success: true, value: created_profile };
}

async function updateProfile(user_id, new_name, new_bio) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userService] updateProfile",
  );

  const updated_profile = await usersDatabase.updateProfile(
    user_id,
    new_name,
    new_bio,
  );
  if (!updated_profile) return { success: false, error: "Profile Not Exist" };

  return { success: true, value: updated_profile };
}

async function getProfile(user_id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userService] getProfile",
  );

  const profile = await usersDatabase.getProfile(user_id);
  if (!profile) return { success: false, error: "Profile Not Exist" };
  return { success: true, value: profile };
}

module.exports = {
  signup,
  login,
  getAllUsers,
  deleteUser,
  getUser,
  selfUpdateEmail,
  updateOtherEmail,
  updateProfile,
  createProfile,
  getProfile,
};
