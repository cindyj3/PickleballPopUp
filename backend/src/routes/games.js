const express = require("express");
const db = require("../db");

const router = express.Router();

/* GET all games */
router.get("/", (req, res) => {
  try {
    const games = db
      .prepare("SELECT * FROM Games ORDER BY GID DESC")
      .all();

    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* CREATE game */
router.post("/", (req, res) => {
  const { location, time } = req.body;

  if (!location || !time) {
    return res.status(400).json({ error: "location and time required" });
  }

  try {
    const info = db
      .prepare(
        "INSERT INTO Games (Location, GameTime, Status) VALUES (?, ?, ?)"
      )
      .run(location, time, "scheduled");

    const game = db
      .prepare("SELECT * FROM Games WHERE GID = ?")
      .get(info.lastInsertRowid);

    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* JOIN game */
router.post("/:id/join", (req, res) => {
  const gameId = req.params.id;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username required" });
  }

  try {
    db.prepare(
      "INSERT INTO GamePlayers (GID, Username) VALUES (?, ?)"
    ).run(gameId, username);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;