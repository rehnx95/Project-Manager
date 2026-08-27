const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersDatabase = require("../repository/usersDatabase");

async function signup(email, password) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service] signup called for:",
    email,
  );
  const existing = await usersDatabase.findByEmail(email);
  if (existing) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[service:user] signup - email already exists:",
      email,
    );
    return { success: false, error: "Email Already Exist" };
  }
  const hashed_password = await bcrypt.hash(password, 10);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] signup - password hashed for:",
    email,
  );
  const new_user = {
    email,
    password: hashed_password,
  };
  const result = await usersDatabase.createUsers(new_user);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] signup - user created:",
    result,
  );
  return { success: true, value: result };
}

async function login(email, password) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service] login called for:",
    email,
  );
  const user = await usersDatabase.findByEmail(email);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] login - user lookup result:",
    user ? "found" : "not found",
  );
  const hash_to_compare = user
    ? user.password
    : "$2b$10$invalidsaltinvalidsaltinvalidsa";
  const is_match = await bcrypt.compare(password, hash_to_compare);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] login - password match:",
    is_match,
  );

  if (!user || !is_match) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[service:user] login - unauthorized for:",
      email,
    );
    return { success: false, error: "Unauthorize" };
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] login - token issued for:",
    email,
  );
  return { success: true, value: token };
}

async function updateUser(id, new_email) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] updateUser called with id:",
    id,
    "email:",
    new_email,
  );
  const user = await usersDatabase.getUser(id);
  if (!user) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[service:user] updateUser - no user found for id:",
      id,
    );
    return { success: false, error: "User Not Exist" };
  }
  const email_check = await usersDatabase.findByEmail(new_email);
  if (email_check && email_check.id !== id) {
    return { success: false, error: "Email Already Exist" };
  }
  const updated_user = await usersDatabase.updateUser(id, new_email);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] updateUser result:",
    updated_user,
  );
  const new_user = {
    id: updated_user.id,
    oldEmail: user.email,
    newEmail: updated_user.email,
  };
  return { success: true, value: new_user };
}

async function getUser(id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] getUser called with id:",
    id,
  );
  const user = await usersDatabase.getUser(id);
  if (!user) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[service:user] getUser - user not found for id:",
      id,
    );
    return { success: false, error: "User Not Exist" };
  }
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] getUser found:",
    user,
  );
  return { success: true, value: user };
}

async function getall() {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] getall called",
  );
  const result = await usersDatabase.getall();
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] getall found",
    result.length,
    "users",
  );
  return { success: true, value: result };
}

async function deleteUser(email) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] deleteUser called with email:",
    email,
  );
  const result = await usersDatabase.deleteUser(email);
  if (!result) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[service:user] deleteUser - no user deleted for email:",
      email,
    );
    return { success: false, error: "User Not Exist" };
  }
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] deleteUser done for email:",
    email,
  );
  return { success: true, value: result };
}

async function createProfile(user_id, new_name, new_bio) {
  const user = await usersDatabase.getUser(user_id);
  if (!user) {
    return { success: false, error: "User Not Found" };
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
  const user = await usersDatabase.getUser(user_id);
  if (!user) {
    return { success: false, error: "User Not Found" };
  }
  const updated_profile = await usersDatabase.updateProfile(
    user_id,
    new_name,
    new_bio,
  );
  return { success: true, value: updated_profile };
}

module.exports = {
  signup,
  login,
  getall,
  deleteUser,
  getUser,
  updateUser,
  updateProfile,
  createProfile,
};
