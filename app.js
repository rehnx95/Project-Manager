require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Keep the legacy `value` field available while exposing a predictable
// response contract for interactive clients.
app.use((req, res, next) => {
  const sendJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === "object") {
      if (body.success === true && !Object.prototype.hasOwnProperty.call(body, "data")) {
        body.data = body.value ?? null;
      }
      if (body.success === false) {
        const raw = body.error;
        const message = raw && typeof raw === "object" ? raw.message : Array.isArray(raw) ? raw.join(", ") : raw;
        body.error = {
          code: body.error?.code || (res.statusCode === 401 ? "UNAUTHORIZED" : res.statusCode === 403 ? "FORBIDDEN" : res.statusCode === 404 ? "NOT_FOUND" : res.statusCode === 409 ? "CONFLICT" : "REQUEST_FAILED"),
          message: message || "Request failed",
          ...(raw && typeof raw === "object" && raw.fields ? { fields: raw.fields } : {}),
        };
      }
    }
    return sendJson(body);
  };
  next();
});
const authenticateOwner = require("./middleware/authenticateOwner");
app.post("/testing/access", (req, res) => {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ success: false, error: "Server Misconfigured" });
  }
  if (!authenticateOwner.isValidSecret(req.body?.key, secret)) {
    return res.status(403).json({ success: false, error: "Forbidden: invalid key" });
  }
  const token = authenticateOwner.createAccessToken(secret);
  res.setHeader(
    "Set-Cookie",
    `testing_access=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Max-Age=300; Path=/`,
  );
  return res.status(204).send();
});
app.get("/testing.html", authenticateOwner, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "testing.html"));
});

const clientDist = path.join(__dirname, "client", "dist");
function acceptsHtml(req) {
  return (req.get("accept") || "").split(",").some((mediaType) =>
    mediaType.split(";")[0].trim().toLowerCase() === "text/html",
  );
}
function serveSpaRoute(req, res, next) {
  if (!fs.existsSync(clientDist) || !acceptsHtml(req)) return next();
  return res.sendFile(path.join(clientDist, "index.html"));
}
app.get("/dashboard", serveSpaRoute);
app.get("/projects/:project_id", (req, res, next) => {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.project_id)) {
    return serveSpaRoute(req, res, next);
  }
  return next();
});
app.get("/tasks/:task_id", (req, res, next) => {
  if (/^[1-9]\d*$/.test(req.params.task_id)) return serveSpaRoute(req, res, next);
  return next();
});

const userRoutes = require("./route/userRoutes");
const noteRoutes = require("./route/noteRoutes");
const projectRoutes = require("./route/projectRoutes");
const projectMemberRoutes = require("./route/projectMemberRoutes");
const taskRoutes = require("./route/taskRoutes");
const tagRoutes = require("./route/tagRoutes");
const commentRoutes = require("./route/commentRoutes");
const databaseRoutes = require("./route/databaseRoutes");

app.use("/", noteRoutes);
app.use("/", userRoutes);
app.use("/", projectRoutes);
app.use("/", projectMemberRoutes);
app.use("/", taskRoutes);
app.use("/", tagRoutes);
app.use("/", commentRoutes);
app.use("/", databaseRoutes);

app.get("/testing", authenticateOwner, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "testing.html"));
});

app.get("/css/testing.css", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "css", "testing.css"));
});
app.get("/js/testing.js", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "js", "testing.js"));
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    const apiPrefixes = [
      "/users", "/projects", "/tasks", "/dashboard", "/database",
      "/testing", "/api",
    ];
    if (
      apiPrefixes.some((prefix) => req.path === prefix || req.path.startsWith(prefix + "/")) ||
      !acceptsHtml(req)
    ) {
      return next();
    }
    return res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(new Date().toLocaleTimeString("en-GB"), "[error]", err.message);
  res.status(500).json({ success: false, error: "Something went wrong" });
});

const port = 9000;
app.listen(port, "0.0.0.0", () => {
  console.log(new Date().toLocaleTimeString("en-GB"), `server is running ${port}`);
});
