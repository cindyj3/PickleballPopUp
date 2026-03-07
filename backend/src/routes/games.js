const express = require("express");
const db = require("../db");

const router = express.Router();

/* GET all games */
router.get("/", (req, res) => {
  try {
    const games = db
      .prepare("SELECT * FROM Games ORDER BY GameID DESC")
      .all();

    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* CREATE game */
router.post("/", (req, res) => {
  const { location, time, username } = req.body;

  if (!location || !time || !username) {
    return res.status(400).json({ error: "location, time, username required" });
  }

  try {
    const info = db
      .prepare("INSERT INTO Games (Location, Time, CreatedBy) VALUES (?, ?, ?)")
      .run(location, time, username);

    const game = db
      .prepare("SELECT * FROM Games WHERE GameID = ?")
      .get(info.lastInsertRowid);

    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;