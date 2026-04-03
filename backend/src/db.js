const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbDir = path.join(__dirname, "../../db");
const dbPath = path.join(dbDir, "pickleball.db");

// ensure db folder exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 🔥 DELETE DATABASE ON RENDER (PRODUCTION ONLY)
if (process.env.NODE_ENV === "production") {
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log("Old database deleted");
    } else {
      console.log("No existing database found");
    }
  } catch (err) {
    console.log("Error deleting DB:", err);
  }
}

// create database
const db = new Database(dbPath);

// load schema
const schemaPath = path.join(process.cwd(), "db/schema.sql");

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