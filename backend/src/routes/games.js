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
    // 1. Check if user exists
    let user = db
      .prepare("SELECT * FROM Users WHERE Username = ?")
      .get(username);

    // 2. Create user if not exists
    if (!user) {
      const result = db
        .prepare("INSERT INTO Users (Username) VALUES (?)")
        .run(username);

      user = db
        .prepare("SELECT * FROM Users WHERE UID = ?")
        .get(result.lastInsertRowid);
    }

    // 3. Prevent duplicate join
    const existing = db
      .prepare("SELECT * FROM GamePlayers WHERE GID = ? AND UID = ?")
      .get(gameId, user.UID);

    if (existing) {
      return res.json({ success: true, message: "Already joined" });
    }

    // 4. Insert correctly using UID
    db.prepare(
      "INSERT INTO GamePlayers (GID, UID) VALUES (?, ?)"
    ).run(gameId, user.UID);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/players", (req, res) => {
  const gameId = req.params.id;

  try {
    const players = db.prepare(`
      SELECT Users.Username
      FROM GamePlayers
      JOIN Users ON GamePlayers.UID = Users.UID
      WHERE GamePlayers.GID = ?
    `).all(gameId);

    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;