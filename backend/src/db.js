const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../db/pickleball.db");
const db = new Database(dbPath);

const schemaPath = path.join(__dirname, "../../db/schema.sql");

if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
}

module.exports = db;