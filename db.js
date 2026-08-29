require("dotenv").config();
const { Pool, types } = require("pg"); // 1. Added 'types' import

// 2. Force Postgres TIMESTAMP (1114) and TIMESTAMPTZ (1184) to return as clean text strings
types.setTypeParser(1114, (val) => val.replace("T", " ").split(".")[0]); 
types.setTypeParser(1184, (val) => val.replace("T", " ").split(".")[0]);

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
});
module.exports = pool;
