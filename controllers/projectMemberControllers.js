const projectMemberService = require("../services/projectMemberService");
const { z } = require("zod");

const role_schema = z.object({
  role: z.enum(["owner", "member"], {
    errorMap: () => ({ message: "Role must be either 'owner' or 'member'" }),
  }),
});

const uuid_schema = z.uuid();

function parseUUIDParam(req, res, param_name) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMemberControllers] parseUUIDParam");
  const result = uuid_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

function handleServiceError(res, error) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMemberControllers] handleServiceError");
  if (error.startsWith("Forbidden")) {
    return res.status(403).json({ success: false, error });
  }
  if (error === "Project Not Exist") {
    return res.status(404).json({ success: false, error });
  }

  return res.status(400).json({ success: false, error });
}

async function getMembership(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMemberControllers] getMembership");
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;

  const outcome = await projectMemberService.getMembership(
    project_id,
    req.user.id,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function addMemberToProject(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMemberControllers] addMemberToProject");
  const result = role_schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.errors[0].message,
    });
  }

  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;
  const target_user_id = parseUUIDParam(req, res, "target_user_id");
  if (target_user_id === null) return;

  const requesting_user_id = req.user.id;
  const { role } = result.data;
  const outcome = await projectMemberService.addMemberToProject(
    project_id,
    target_user_id,
    role,
    requesting_user_id,
  );

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(201).json({
    success: true,
    value: outcome.value,
  });
}

async function getAllMembersOfProject(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMemberControllers] getAllMembersOfProject");
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;

  const outcome = await projectMemberService.getAllMembersOfProject(
    req.user.id,
    project_id,
  );

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

async function removeMemberFromProject(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMemberControllers] removeMemberFromProject");
  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;

  const target_user_id = parseUUIDParam(req, res, "target_user_id");
  if (target_user_id === null) return;

  const requesting_user_id = req.user.id;

  const outcome = await projectMemberService.removeMemberFromProject(
    project_id,
    requesting_user_id,
    target_user_id,
  );

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(204).send();
}

async function changeMemberRole(req, res) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMemberControllers] changeMemberRole");
  const result = role_schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.errors[0].message,
    });
  }

  const project_id = parseUUIDParam(req, res, "project_id");
  if (project_id === null) return;

  const target_user_id = parseUUIDParam(req, res, "target_user_id");
  if (target_user_id === null) return;

  const requesting_user_id = req.user.id;
  const { role } = result.data;

  const outcome = await projectMemberService.changeMemberRole(
    project_id,
    requesting_user_id,
    target_user_id,
    role,
  );

  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({
    success: true,
    value: outcome.value,
  });
}

module.exports = {
  getMembership,
  addMemberToProject,
  getAllMembersOfProject,
  removeMemberFromProject,
  changeMemberRole,
};