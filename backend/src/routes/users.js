const express = require("express");
const db = require("../db");

const router = express.Router();

/* GET all users */
router.get("/", (req, res) => {
  const users = db
    .prepare("SELECT * FROM Users ORDER BY CreatedAt DESC")
    .all();

  res.json(users);
});

/* CREATE or GET user (safe, no duplicates) */
router.post("/", (req, res) => {
  let { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username required" });
  }

  // normalize username
  username = username.trim().toLowerCase();

  try {
    // insert safely (won’t crash if duplicate)
    db.prepare("INSERT OR IGNORE INTO Users (Username) VALUES (?)")
      .run(username);

    // always fetch the user
    const user = db
      .prepare("SELECT * FROM Users WHERE Username = ?")
      .get(username);

    res.json(user);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;