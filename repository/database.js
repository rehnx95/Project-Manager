const pool = require("../db");

async function showDatabase(sqlQuery) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[showDatabase] showDatabase",
  );
  const result = await pool.query(sqlQuery);
  return result.rows;
}

async function listDemoQueries() {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[showDatabase] listDemoQueries",
  );
}

module.exports = {
  showDatabase,
};
