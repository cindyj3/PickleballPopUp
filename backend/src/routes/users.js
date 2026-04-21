const express = require("express");
const db = require("../db");

const router = express.Router();

/* GET ALL USERS */
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM Users ORDER BY CreatedAt DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* CREATE OR GET USER */
router.post("/", async (req, res) => {
  try {
    let { username } = req.body;
    if (!username) return res.status(400).json({ error: "username required" });

    username = username.trim().toLowerCase();

    await db.query(
      "INSERT INTO Users (Username) VALUES ($1) ON CONFLICT (Username) DO NOTHING",
      [username]
    );

    const { rows } = await db.query("SELECT * FROM Users WHERE Username = $1", [username]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
