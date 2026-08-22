require("dotenv").config();
const path = require("path");
const express = require("express");
const userController = require("./controllers/userControllers2");
const taskController = require("./controllers/taskControllers2");
const authenticateToken = require("./middleware/authenticateToken");
const asyncHandler = require("./utils/asyncHandler");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 7000;

// Log every incoming request
app.use((req, res, next) => {
  const safeBody =
    req.body && req.body.password ? { ...req.body, password: "***" } : req.body;
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    `[app] ${req.method} ${req.url} | body:`,
    safeBody,
  );
  next();
});

app.get("/", (req, res) => {
  console.log(new Date().toLocaleTimeString("en-GB"), "[app] GET / hit");
 
  res.sendFile(path.join(__dirname, "AuthProfile.html"));
});

app.post("/tasks", authenticateToken, asyncHandler(taskController.createTask));
app.get("/tasks", authenticateToken, asyncHandler(taskController.getTask));
app.get(
  "/tasks/:id",
  authenticateToken,
  asyncHandler(taskController.getoneTask),
);
app.patch(
  "/tasks/:id",
  authenticateToken,
  asyncHandler(taskController.updateTask),
);
app.patch(
  "/tasks/:id/completed",
  authenticateToken,
  asyncHandler(taskController.completed),
);
app.delete(
  "/tasks/:id",
  authenticateToken,
  asyncHandler(taskController.deleteTask),
);

app.get(
  "/profile",
  authenticateToken,
  asyncHandler((req, res) => {
    console.log(
      new Date().toLocaleTimeString("en-GB"),
      "[app] /profile hit for user:",
      req.user,
    );
    res.send(`Welcome ${req.user.email}, your id is ${req.user.id}`);
  }),
);

app.post("/users/signup", asyncHandler(userController.signup));
app.post("/users/login", asyncHandler(userController.login));
app.get("/users", authenticateToken, asyncHandler(userController.getall));
app.delete(
  "/users",
  authenticateToken,
  asyncHandler(userController.deleteUser),
);
app.patch(
  "/users/:id",
  authenticateToken,
  asyncHandler(userController.updateUser),
);

app.get("/users/:id", authenticateToken, asyncHandler(userController.getUser));

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(new Date().toLocaleTimeString("en-GB"), "[error]", err.message);
  res.status(500).json({ success: false, error: "Something went wrong" });
});

app.listen(port, () => {
  console.log(new Date().toLocaleTimeString("en-GB"), `server running ${port}`);
});
