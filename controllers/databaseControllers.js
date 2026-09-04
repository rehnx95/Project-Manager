const databaseService = require("../services/databaseService");
const { z } = require("zod");

const sqlQuery_schema = z.object({
  sqlQuery: z.string().min(1, "Enter SQL query"),
});

async function showDatabase(req, res) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[databaseControllers] showDatabase",
  );
  const result = sqlQuery_schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.issues[0].message,
    });
  }
  const { sqlQuery } = result.data;
  const outcome = await databaseService.showDatabase(sqlQuery);
  if (outcome.success === false) {
    return res.status(404).json({ success: false, error: outcome.error });
  }
  return res.status(200).json({ success: true, value: outcome.value });
}

module.exports = {
  showDatabase,
};