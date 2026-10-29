const { title } = require("node:process");
const noteService = require("../services/noteService");
const { z } = require("zod");

const id_schema = z.coerce.number().int().positive();

function parseIdParam(req, res, param_name) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[userControllers] parseIdParam",
  );
  const result = id_schema.safeParse(req.params[param_name]);
  if (!result.success) {
    res.status(400).json({ success: false, error: `Invalid ${param_name}` });
    return null;
  }
  return result.data;
}

const note_schema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

function handleServiceError(res, error) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[noteControllers] handleServiceError",
  );
  if (error === "Notes Not Exist") {
    return res.status(404).json({ success: false, error });
  }

  return res.status(400).json({ success: false, error });
}

async function createNotes(req, res) {
  const result = note_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }
  const { title, body } = result.data;
  const outcome = await noteService.createNotes(req.user.id, title, body);
  res.status(201).json({ success: true, value: outcome.value });
}

async function listNotes(req, res) {
  const outcome = await noteService.listNotes(req.user.id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function getOneNote(req, res) {
  const note_id = parseIdParam(req, res, "note_id");
  if (note_id === null) return;
  const outcome = await noteService.getOneNote(req.user.id, note_id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function updateNote(req, res) {
  const note_id = parseIdParam(req, res, "note_id");
  if (note_id === null) return;
  const result = note_schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ success: false, error: errors });
  }
  const { title, body } = result.data;
  const outcome = await noteService.updateNote(
    req.user.id,
    note_id,
    title,
    body,
  );
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(200).json({ success: true, value: outcome.value });
}

async function deleteNote(req, res) {
  const note_id = parseIdParam(req, res, "note_id");
  if (note_id === null) return;
  const outcome = await noteService.deleteNote(req.user.id, note_id);
  if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(204).send();
}

async function deleteAllNotes(req, res) {
  const outcome = await noteService.deleteAllNotes(req.user.id);
 if (outcome.success === false) {
    return handleServiceError(res, outcome.error);
  }
  res.status(204).send();
}

module.exports = {
  createNotes,
  listNotes,
  getOneNote,
  updateNote,
  deleteAllNotes,
  deleteNote,
};
