const database = require("../repository/database");

async function showDatabase(sqlQuery) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[databaseService] showDatabase",
  );
  const result = await database.showDatabase(sqlQuery);
  if (!result || result.length === 0) {
    return { success: false, error: "No data found" };
  }
  return { success: true, value: result };
}

module.exports = {
  showDatabase,
};
