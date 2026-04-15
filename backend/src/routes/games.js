const express = require("express");
const db = require("../db");

const router = express.Router();

/* GET EVENTS */
router.get("/", (req, res) => {
  const games = db.prepare(
    "SELECT * FROM Games ORDER BY GameTime ASC"
  ).all();

  res.json(games);
});

/* GET USERS */
router.get("/users", (req, res) => {
  const users = db.prepare("SELECT Username FROM Users").all();
  res.json(users);
});

/* CREATE EVENT */
router.post("/", (req, res) => {
  let { location, time, username } = req.body;

  if (!location || !time) {
    return res.json({ error: "Missing fields" });
  }

  location = location.trim().toLowerCase();
  username = username?.trim().toLowerCase();

  db.prepare(`
    INSERT INTO Games (Location, GameTime, Status, CreatedBy)
    VALUES (?, ?, 'scheduled', ?)
  `).run(location, time, username);

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

/* JOIN EVENT */
router.post("/:id/join", (req, res) => {
  const username = req.body.username.trim().toLowerCase();
  const gameId = req.params.id;

  let user = db.prepare("SELECT * FROM Users WHERE Username = ?").get(username);

  if (!user) {
    db.prepare("INSERT INTO Users (Username) VALUES (?)").run(username);
    user = db.prepare("SELECT * FROM Users WHERE Username = ?").get(username);
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

/* LEAVE EVENT */
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

/* DELETE EVENT */
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

/* 🔥 RECORD SUB-GAME (MATCH) */
router.post("/:id/result", (req, res) => {
  const { winner, players } = req.body;
  const gameId = req.params.id;

  if (!winner || !players) {
    return res.json({ error: "Missing data" });
  }

  players.forEach(name => {
    const user = db.prepare("SELECT * FROM Users WHERE Username = ?")
      .get(name.toLowerCase());

    if (user) {
      db.prepare(`
        INSERT INTO GamePlayers (GID, UID, IsWinner)
        VALUES (?, ?, ?)
      `).run(gameId, user.UID, name === winner ? 1 : 0);
    }
  });

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
  const rows = db.prepare(`
    SELECT 
      Games.GID,
      Games.Location,
      Games.GameTime,
      GamePlayers.IsWinner,
      Users.Username
    FROM Games
    JOIN GamePlayers ON Games.GID = GamePlayers.GID
    JOIN Users ON GamePlayers.UID = Users.UID
    ORDER BY Games.GameTime DESC
  `).all();

  const grouped = {};

  rows.forEach(row => {
    if (!grouped[row.GID]) {
      grouped[row.GID] = {
        location: row.Location,
        time: row.GameTime,
        players: [],
        winner: null
      };
    }

    grouped[row.GID].players.push(row.Username);

    if (row.IsWinner === 1) {
      grouped[row.GID].winner = row.Username;
    }
  });

  res.json(Object.values(grouped));
});

module.exports = router;