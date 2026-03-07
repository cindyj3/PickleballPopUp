const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbDir = path.join(__dirname, "../../db");
const dbPath = path.join(dbDir, "pickleball.db");

// ensure db folder exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

const schemaPath = path.join(process.cwd(), "backend/db/schema.sql");

console.log("Schema path:", schemaPath);
console.log("Schema exists:", fs.existsSync(schemaPath));

if (fs.existsSync(schemaPath)) {
  console.log("Running schema...");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
} else {
  console.log("Schema file not found");
}

module.exports = db;