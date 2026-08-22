const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repository/usersDatabase");

async function getUser(id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] getUser called with id:",
    id,
  );
  const user = await userRepository.getUser(id);
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

async function updateUser(id, email) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] updateUser called with id:",
    id,
    "email:",
    email,
  );
  const user=await userRepository.getUser(id);
  const updatedUser = await userRepository.updateUser(id, email);

  if (!updatedUser) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[service:user] updateUser - no user updated for id:",
      id,
    );
    return { success: false, error: "User Not Exist" };
  }
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] updateUser result:",
    updatedUser,
  );
  const newuser = {
    id: id,
    oldEmail: user.email,
    newEmail: updatedUser.email,
  };
  return { success: true, value: newuser };
}

async function deleteUser(email) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] deleteUser called with email:",
    email,
  );
  await userRepository.deleteUser(email);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] deleteUser done for email:",
    email,
  );
  return { success: true };
}

async function getall() {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] getall called",
  );
  const result = await userRepository.getall();
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] getall found",
    result.length,
    "users",
  );
  return { success: true, value: result };
}

async function signup(email, password) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service] signup called for:",
    email,
  );
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[service:user] signup - email already exists:",
      email,
    );
    return { success: false, error: "Email Already Exist" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] signup - password hashed for:",
    email,
  );
  const newUser = {
    email,
    password: hashedPassword,
  };
  const result = await userRepository.create(newUser);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] signup - user created:",
    result,
  );
  return { success: true, value: result.email };
}

async function login(email, password) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service] login called for:",
    email,
  );
  const user = await userRepository.findByEmail(email);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] login - user lookup result:",
    user ? "found" : "not found",
  );
  const hashToCompare = user
    ? user.password
    : "$2b$10$invalidsaltinvalidsaltinvalidsa";
  const isMatch = await bcrypt.compare(password, hashToCompare);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[service:user] login - password match:",
    isMatch,
  );

  if (!user || !isMatch) {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[service:user] login - unauthorized for:",
      email,
    );
    return { success: false, error: "Unauthorize" };
  }
  const token = jwt.sign(
    { id: user.id, email: user.email },
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

module.exports = { signup, login, getall, deleteUser, getUser, updateUser };
