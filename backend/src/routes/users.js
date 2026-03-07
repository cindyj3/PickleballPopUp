const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const users = db.prepare("SELECT * FROM Users ORDER BY CreatedAt DESC").all();
  res.json(users);
});

router.post("/", (req, res) => {
  const { username, email } = req.body;
  if (!username) return res.status(400).json({ error: "username required" });

  try {
    const info = db
      .prepare("INSERT INTO Users (Username, Email) VALUES (?, ?)")
      .run(username, email ?? null);

    const user = db.prepare("SELECT * FROM Users WHERE UID=?").get(info.lastInsertRowid);
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
