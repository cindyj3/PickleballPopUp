const express = require("express");
const db = require("../db");

const router = express.Router();

/* GET games (sorted by time) */
router.get("/", (req, res) => {
  const games = db.prepare(
    "SELECT * FROM Games ORDER BY GameTime ASC"
  ).all();

  res.json(games);
});

/* CREATE game */
router.post("/", (req, res) => {
  const { location, time, type } = req.body;

  const info = db.prepare(
    "INSERT INTO Games (Location, GameTime, Status, Type) VALUES (?, ?, ?, ?)"
  ).run(location, time, "scheduled", type);

  res.json({ success: true });
});

/* JOIN */
router.post("/:id/join", (req, res) => {
  const { username } = req.body;
  const gameId = req.params.id;

  let user = db.prepare("SELECT * FROM Users WHERE Username = ?").get(username);

  if (!user) {
    const result = db.prepare("INSERT INTO Users (Username) VALUES (?)").run(username);
    user = db.prepare("SELECT * FROM Users WHERE UID = ?").get(result.lastInsertRowid);
  }

  const count = db.prepare(
    "SELECT COUNT(*) as total FROM GamePlayers WHERE GID = ?"
  ).get(gameId).total;

  if (count >= 4) {
    return res.json({ error: "Game full" });
  }

  const exists = db.prepare(
    "SELECT * FROM GamePlayers WHERE GID = ? AND UID = ?"
  ).get(gameId, user.UID);

  if (!exists) {
    db.prepare("INSERT INTO GamePlayers (GID, UID) VALUES (?, ?)").run(gameId, user.UID);
  }

  res.json({ success: true });
});

/* LEAVE */
router.post("/:id/leave", (req, res) => {
  const { username } = req.body;
  const gameId = req.params.id;

  const user = db.prepare("SELECT * FROM Users WHERE Username = ?").get(username);

  if (user) {
    db.prepare("DELETE FROM GamePlayers WHERE GID = ? AND UID = ?")
      .run(gameId, user.UID);
  }

  res.json({ success: true });
});

/* PLAYERS */
router.get("/:id/players", (req, res) => {
  const players = db.prepare(`
    SELECT Username FROM Users
    JOIN GamePlayers ON Users.UID = GamePlayers.UID
    WHERE GamePlayers.GID = ?
  `).all(req.params.id);

  res.json(players);
});

/* RESET */
router.post("/reset", (req, res) => {
  db.prepare("DELETE FROM GamePlayers").run();
  db.prepare("DELETE FROM Users").run();
  db.prepare("DELETE FROM Games").run();

  res.json({ success: true });
});

module.exports = router;