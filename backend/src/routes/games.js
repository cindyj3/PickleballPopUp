
console.log("🔥 GAMES ROUTE FILE LOADED");
const express = require("express");
const db = require("../db");

const router = express.Router();

/* GET games */
router.get("/", (req, res) => {
  const games = db.prepare(
    "SELECT * FROM Games ORDER BY GameTime ASC"
  ).all();

  res.json(games);
});

/* CREATE (with duplicate prevention) */
router.post("/", (req, res) => {
  const { location, time, type } = req.body;
  const username = req.body.username.trim().toLowerCase();
  console.log("🔥 CREATE ROUTE HIT");
  console.log("BODY:", req.body);
  console.log("CREATE REQUEST:", req.body); // 👈 ADD THIS DEBUG

  const existing = db.prepare(`
    SELECT * FROM Games
    WHERE Location = ? AND GameTime = ? AND Status = 'scheduled'
  `).get(location, time);

  if (existing) {
    return res.json({ error: "Game already exists" });
  }

  db.prepare(`
    INSERT INTO Games (Location, GameTime, Status, Type, CreatedBy)
    VALUES (?, ?, ?, ?, ?)
  `).run(location, time, "scheduled", type, username);

  res.json({ success: true });
});

/* DELETE */
router.post("/:id/delete", (req, res) => {
  const username = req.body.username.trim().toLowerCase();
  const gameId = req.params.id;

  const game = db.prepare("SELECT * FROM Games WHERE GID = ?").get(gameId);

  if (!game) return res.json({ error: "Game not found" });

  if (game.CreatedBy !== username) {
    return res.json({ error: "Not authorized" });
  }

  db.prepare("DELETE FROM GamePlayers WHERE GID = ?").run(gameId);
  db.prepare("DELETE FROM Games WHERE GID = ?").run(gameId);

  res.json({ success: true });
});


/* JOIN */
router.post("/:id/join", (req, res) => {
  const username = req.body.username.trim().toLowerCase();
  const gameId = req.params.id;

  db.prepare("INSERT OR IGNORE INTO Users (Username) VALUES (?)").run(username);

  const user = db.prepare("SELECT * FROM Users WHERE Username = ?").get(username);

  const count = db.prepare(
    "SELECT COUNT(*) as total FROM GamePlayers WHERE GID = ?"
  ).get(gameId).total;

  if (count >= 4) return res.json({ error: "Game full" });

  const exists = db.prepare(
    "SELECT * FROM GamePlayers WHERE GID = ? AND UID = ?"
  ).get(gameId, user.UID);

  if (!exists) {
    db.prepare("INSERT INTO GamePlayers (GID, UID) VALUES (?, ?)")
      .run(gameId, user.UID);
  }

  res.json({ success: true });
});

/* LEAVE */
router.post("/:id/leave", (req, res) => {
  const username = req.body.username.trim().toLowerCase();
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

/* RESULT */
router.post("/:id/result", (req, res) => {
  const { winner } = req.body;
  const gameId = req.params.id;

  const user = db.prepare("SELECT * FROM Users WHERE Username = ?").get(winner);

  const players = db.prepare(
    "SELECT * FROM GamePlayers WHERE GID = ?"
  ).all(gameId);

  players.forEach(p => {
    db.prepare(`
      UPDATE GamePlayers
      SET IsWinner = ?
      WHERE GID = ? AND UID = ?
    `).run(p.UID === user.UID ? 1 : 0, gameId, p.UID);
  });

  db.prepare(`
    UPDATE Games
    SET Status = 'completed'
    WHERE GID = ?
  `).run(gameId);

  res.json({ success: true });
});

/* LEADERBOARD */
router.get("/leaderboard", (req, res) => {
  const data = db.prepare(`
    SELECT 
      Users.Username,
      COUNT(GamePlayers.GID) as totalGames,
      SUM(CASE WHEN GamePlayers.IsWinner = 1 THEN 1 ELSE 0 END) as wins
    FROM Users
    LEFT JOIN GamePlayers ON Users.UID = GamePlayers.UID
    GROUP BY Users.UID
    ORDER BY wins DESC
  `).all();

  res.json(data);
});

/* HISTORY */
router.get("/history", (req, res) => {
  const games = db.prepare(`
    SELECT * FROM Games
    WHERE Status = 'completed'
    ORDER BY GameTime DESC
  `).all();

  res.json(games);
});

module.exports = router;