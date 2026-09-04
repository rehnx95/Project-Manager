require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

const userRoutes = require("./route/userRoutes");
const noteRoutes = require("./route/noteRoutes");
const projectRoutes = require("./route/projectRoutes");
const projectMemberRoutes = require("./route/projectMemberRoutes");
const taskRoutes = require("./route/taskRoutes");
const tagRoutes = require("./route/tagRoutes");
const commentRoutes = require("./route/commentRoutes");

app.use("/", noteRoutes);
app.use("/", userRoutes);
app.use("/", projectRoutes);
app.use("/", projectMemberRoutes);
app.use("/", taskRoutes);
app.use("/", tagRoutes);
app.use("/", commentRoutes);

const authenticateOwner = require("./middleware/siteOwner");
app.get("/testing", authenticateOwner, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "testing.html"));
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(new Date().toLocaleTimeString("en-GB"), "[error]", err.message);
  res.status(500).json({ success: false, error: "Something went wrong" });
});

const port = process.env.PORT || 7000;
app.listen(port, "0.0.0.0", () => {
  console.log(new Date().toLocaleTimeString("en-GB"), `server running ${port}`);
});
