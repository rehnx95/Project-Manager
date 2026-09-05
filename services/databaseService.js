const database = require("../repository/database");

async function showDatabase(sqlQuery) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[databaseService] showDatabase",
  );
  const result = await database.showDatabase(sqlQuery);
  // No rows AND no affected rows means genuinely nothing happened —
  // e.g. a SELECT that matched zero records. That's still a valid,
  // successful result, not an error.
  return {
    success: true,
    value: {
      rows: result.rows,
      rowCount: result.rowCount,
      command: result.command,
    },
  };
}

async function listDemoQueries() {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[databaseService] listDemoQueries",
  );
  const result = await database.listDemoQueries();
  if (!result || result.length === 0) {
    return { success: false, error: "No queries found" };
  }
  return { success: true, value: result };
}

module.exports = {
  showDatabase,
  listDemoQueries,
};
