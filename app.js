require("dotenv").config();
const path = require("path");
const express = require("express");
const userControllers = require("./controllers/userControllers");
const taskControllers = require("./controllers/taskControllers");
const tagControllers = require("./controllers/tagControllers");
const projectMemberControllers = require("./controllers/projectMemberControllers");
const projectControllers = require("./controllers/projectControllers");
const commentControllers = require("./controllers/commentControllers");
const authenticateToken = require("./middleware/authenticateToken");
const authenticateRole = require("./middleware/authenticateRole");

const asyncHandler = require("./utils/asyncHandler");

const app = express();
const cors = require("cors");
const authenticateOwner = require("./middleware/siteOwner");
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 7000;
app.use(express.static(path.join(__dirname, "frontend")));

// users — static/literal sub-paths must come before /users/:requested_id,
// otherwise Express matches "profile"/"projects"/"comments" as the
// :requested_id param and these routes never get reached.

app.get("/testing", authenticateOwner, (req, res) => {
  res.sendFile(path.join(__dirname, "authOwner.html"));
});

app.post("/users/signup", asyncHandler(userControllers.signup));
app.post("/users/login", asyncHandler(userControllers.login));

app.post(
  "/users/profile",
  authenticateToken,
  asyncHandler(userControllers.createProfile),
);
app.patch(
  "/users/profile",
  authenticateToken,
  asyncHandler(userControllers.updateProfile),
);
app.get(
  "/users/profile",
  authenticateToken,
  asyncHandler(userControllers.getProfile),
);

app.get(
  "/users/projects",
  authenticateToken,
  asyncHandler(projectMemberControllers.getAllProjectsOfUser),
);

app.get(
  "/users/comments",
  authenticateToken,
  asyncHandler(commentControllers.getCommentByUser),
);
app.delete(
  "/users/comments/:comment_id",
  authenticateToken,
  asyncHandler(commentControllers.deleteCommentById),
);

app.delete(
  "/users",
  authenticateToken,
  asyncHandler(userControllers.deleteUser),
);

app.patch(
  "/users/:requested_id",
  authenticateToken,
  asyncHandler(userControllers.updateUser),
);
app.get(
  "/users",
  authenticateToken,
  authenticateRole("admin"),
  asyncHandler(userControllers.getAllUser),
);
app.get(
  "/users/:requested_id",
  authenticateToken,
  authenticateRole("admin"),
  asyncHandler(userControllers.getUser),
);

// projects
app.post(
  "/projects",
  authenticateToken,
  asyncHandler(projectControllers.createProject),
);
app.get(
  "/projects/:project_id",
  authenticateToken,
  asyncHandler(projectControllers.getOneProject),
);
app.get(
  "/projects",
  authenticateToken,
  asyncHandler(projectControllers.getProject),
);
app.get(
  "/projects/:project_id/tasks",
  authenticateToken,
  asyncHandler(projectControllers.getTaskByProject),
);

app.patch(
  "/projects/:project_id",
  authenticateToken,
  asyncHandler(projectControllers.updateProject),
);

app.delete(
  "/projects/:project_id",
  authenticateToken,
  asyncHandler(projectControllers.deleteProject),
);

// project member
app.get(
  "/projects/:project_id/membership",
  authenticateToken,
  asyncHandler(projectMemberControllers.getMembership),
);

app.post(
  "/projects/:project_id/users/:target_user_id",
  authenticateToken,
  asyncHandler(projectMemberControllers.addMemberToProject),
);

app.get(
  "/projects/:project_id/members",
  authenticateToken,
  asyncHandler(projectMemberControllers.getAllMembersOfProject),
);

app.delete(
  "/projects/:project_id/users/:target_user_id",
  authenticateToken,
  asyncHandler(projectMemberControllers.removeMemberFromProject),
);

app.patch(
  "/projects/:project_id/users/:target_user_id",
  authenticateToken,
  asyncHandler(projectMemberControllers.changeMemberRole),
);

// tasks
app.post(
  "/projects/:project_id/tasks",
  authenticateToken,
  asyncHandler(taskControllers.createTask),
);
app.get(
  "/tasks",
  authenticateToken,
  asyncHandler(taskControllers.getTaskByUser),
);
app.get(
  "/tasks/:task_id",
  authenticateToken,
  asyncHandler(taskControllers.getOneTask),
);
app.patch(
  "/tasks/:task_id",
  authenticateToken,
  asyncHandler(taskControllers.updateTask),
);
app.patch(
  "/tasks/:task_id/complete",
  authenticateToken,
  asyncHandler(taskControllers.completeTask),
);
app.delete(
  "/tasks/:task_id",
  authenticateToken,
  asyncHandler(taskControllers.deleteTask),
);

// tags
app.post("/tags", authenticateToken, asyncHandler(tagControllers.createTag));
app.get("/tags", authenticateToken, asyncHandler(tagControllers.getAllTags));

// task <-> tag (previously missing — controllers/repository already
// supported this, they just weren't wired to a route)
app.post(
  "/tasks/:task_id/tags/:tag_id",
  authenticateToken,
  asyncHandler(tagControllers.addTagToTask),
);
app.get(
  "/tasks/:task_id/tags",
  authenticateToken,
  asyncHandler(tagControllers.getTaskTags),
);
app.delete(
  "/tasks/:task_id/tags/:tag_id",
  authenticateToken,
  asyncHandler(tagControllers.removeTagFromTask),
);

// comments
app.post(
  "/tasks/:task_id/comments",
  authenticateToken,
  asyncHandler(commentControllers.createComment),
);

app.get(
  "/tasks/:task_id/comments",
  authenticateToken,
  asyncHandler(commentControllers.getCommentByTask),
);

app.delete(
  "/tasks/:task_id/comments",
  authenticateToken,
  asyncHandler(commentControllers.deleteAllCommentFromTask),
);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(new Date().toLocaleTimeString("en-GB"), "[error]", err.message);
  res.status(500).json({ success: false, error: "Something went wrong" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(new Date().toLocaleTimeString("en-GB"), `server running ${port}`);
});
