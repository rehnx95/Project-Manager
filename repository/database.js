const pool = require("../db");

async function showDatabase(sqlQuery) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[showDatabase] showDatabase",
  );
  const result = await pool.query(sqlQuery);
  return {
    rows: result.rows,
    rowCount: result.rowCount,
    command: result.command,
  };
}

async function listDemoQueries() {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[showDatabase] listDemoQueries",
  );
  const result = await pool.query("SELECT * FROM queries");
  return result.rows;
}

module.exports = {
  showDatabase,
  listDemoQueries,
};
