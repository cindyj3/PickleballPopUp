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

/*  GET ALL USERS (ADD THIS RIGHT HERE) */
router.get("/users", (req, res) => {
  const users = db.prepare("SELECT Username FROM Users").all();
  res.json(users);
});

/* CREATE */
router.post("/", (req, res) => {
  let { location, time, type, username } = req.body;

  if (!location || !time) {
    return res.json({ error: "Missing fields" });
  }

  location = location.trim().toLowerCase();
  username = username?.trim().toLowerCase();

  const existing = db.prepare(`
    SELECT * FROM Games
    WHERE Location = ? AND GameTime = ? AND Status = 'scheduled'
  `).get(location, time);

  if (existing) {
    return res.json({ error: "Game already exists" });
  }

  db.prepare(`
    INSERT INTO Games (Location, GameTime, Status, Type, CreatedBy)
    VALUES (?, ?, 'scheduled', ?, ?)
  `).run(location, time, type, username);

  res.json({ success: true });
});

/* GET PLAYERS */
router.get("/:id/players", (req, res) => {
  const players = db.prepare(`
    SELECT Users.Username, GamePlayers.IsWinner
    FROM GamePlayers
    JOIN Users ON GamePlayers.UID = Users.UID
    WHERE GamePlayers.GID = ?
  `).all(req.params.id);

  res.json(players);
});

/* JOIN */
router.post("/:id/join", (req, res) => {
  const username = req.body.username.trim().toLowerCase();
  const gameId = req.params.id;

  let user = db.prepare("SELECT * FROM Users WHERE Username = ?").get(username);

  // If user exists, allow (same user rejoining)
  // BUT if you want stricter uniqueness per session, see note below

  if (!user) {
    db.prepare("INSERT INTO Users (Username) VALUES (?)").run(username);
    user = db.prepare("SELECT * FROM Users WHERE Username = ?").get(username);
  }
  const count = db.prepare(
    "SELECT COUNT(*) as total FROM GamePlayers WHERE GID = ?"
  ).get(gameId).total;

  const game = db.prepare("SELECT * FROM Games WHERE GID = ?").get(gameId);

  const maxPlayers = game.Type === "singles" ? 2 : 4;

  if (count >= maxPlayers) {
    return res.json({ error: "Game full" });
  }

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

/* DELETE */
router.post("/:id/delete", (req, res) => {
  const username = req.body.username.trim().toLowerCase();
  const gameId = req.params.id;

  const game = db.prepare("SELECT * FROM Games WHERE GID = ?").get(gameId);

  if (!game) return res.json({ error: "Game not found" });
  if (game.CreatedBy !== username) return res.json({ error: "Not authorized" });

  db.prepare("DELETE FROM GamePlayers WHERE GID = ?").run(gameId);
  db.prepare("DELETE FROM Games WHERE GID = ?").run(gameId);

  res.json({ success: true });
});

/* 🔥 RECORD RESULT */
router.post("/:id/result", (req, res) => {
  const { winner, score } = req.body;
  const gameId = req.params.id;

  const game = db.prepare("SELECT * FROM Games WHERE GID = ?").get(gameId);
  if (!game) return res.json({ error: "Game not found" });

  if (game.Status === "completed") {
    return res.json({ error: "Game already recorded" });
  }

  const user = db.prepare("SELECT * FROM Users WHERE Username = ?")
    .get(winner.trim().toLowerCase());

  if (!user) return res.json({ error: "Winner not found" });

  const players = db.prepare(
    "SELECT * FROM GamePlayers WHERE GID = ?"
  ).all(gameId);

  if (players.length === 0) {
    return res.json({ error: "No players in game" });
  }

  players.forEach(p => {
    db.prepare(`
      UPDATE GamePlayers
      SET IsWinner = ?, Score = ?
      WHERE GID = ? AND UID = ?
    `).run(
      p.UID === user.UID ? 1 : 0,
      score || null,
      gameId,
      p.UID
    );
  });

  db.prepare(`
    UPDATE Games
    SET Status = 'completed'
    WHERE GID = ?
  `).run(gameId);

  res.json({ success: true });
});

/* 🔥 LEADERBOARD */
router.get("/leaderboard", (req, res) => {
  const data = db.prepare(`
    SELECT 
      Users.Username,
      COUNT(GamePlayers.GID) as totalGames,
      SUM(CASE WHEN GamePlayers.IsWinner = 1 THEN 1 ELSE 0 END) as wins
    FROM Users
    LEFT JOIN GamePlayers ON Users.UID = GamePlayers.UID
    LEFT JOIN Games ON GamePlayers.GID = Games.GID
    WHERE Games.Status = 'completed'
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

/* RESET DATABASE (TEMPORARY) */
router.post("/reset", (req, res) => {
  db.prepare("DELETE FROM GamePlayers").run();
  db.prepare("DELETE FROM Games").run();
  db.prepare("DELETE FROM Users").run();

  res.json({ success: true });
});

module.exports = router;