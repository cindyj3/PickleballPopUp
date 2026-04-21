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

  // CHECK DUPLICATE
  const existing = db.prepare(`
    SELECT * FROM Games
    WHERE Location = ? AND GameTime = ?
  `).get(location, time);

  if (existing) {
    return res.status(400).json({ error: "Event already exists!" });
  }

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

/* RECORD SUB-GAME (MATCH) */
router.post("/:id/result", (req, res) => {
  const { winner, score, players } = req.body;
  const gameId = req.params.id;

  if (!winner || !players || !score) {
    return res.json({ error: "Missing data" });
  }

  players.forEach(name => {
    const user = db.prepare("SELECT * FROM Users WHERE Username = ?")
      .get(name.toLowerCase());

    if (user) {
      db.prepare(`
        INSERT INTO GamePlayers (GID, UID, Score, IsWinner)
        VALUES (?, ?, ?, ?)
      `).run(
        gameId,
        user.UID,
        score,
        name === winner ? 1 : 0
      );
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
      GamePlayers.Score,
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
        winner: null,
        score: null
      };
    }

    grouped[row.GID].players.push(row.Username);

    if (row.IsWinner === 1) {
      grouped[row.GID].winner = row.Username;
    }
    if (row.Score) {
      grouped[row.GID].score = row.Score;
    }

  });

  res.json(Object.values(grouped));
});


router.delete("/reset", (req, res) => {
  db.prepare("DELETE FROM GamePlayers").run();
  db.prepare("DELETE FROM Games").run();
  db.prepare("DELETE FROM Messages").run();
  db.prepare("DELETE FROM Conversations").run();
  db.prepare("DELETE FROM ConversationParticipants").run();

  res.json({ message: "Reset complete" });
});

/* CREATE OR GET CONVERSATION FOR EVENT */
router.get("/:id/chat", (req, res) => {
  const gameId = req.params.id;

  let convo = db.prepare(`
    SELECT * FROM Conversations WHERE CID = ?
  `).get(gameId);

  if (!convo) {
    db.prepare(`
      INSERT INTO Conversations (CID) VALUES (?)
    `).run(gameId);
  }

  const messages = db.prepare(`
    SELECT Messages.Content, Messages.SentAt, Users.Username
    FROM Messages
    JOIN Users ON Messages.SenderUID = Users.UID
    WHERE Messages.CID = ?
    ORDER BY Messages.SentAt ASC
  `).all(gameId);

  res.json(messages);
});

/* SEND MESSAGE */
router.post("/:id/chat", (req, res) => {
  const { username, content } = req.body;
  const gameId = req.params.id;

  if (!content) return res.json({ error: "Empty message" });

  let user = db.prepare("SELECT * FROM Users WHERE Username = ?")
    .get(username.toLowerCase());

  if (!user) {
    db.prepare("INSERT INTO Users (Username) VALUES (?)")
      .run(username.toLowerCase());
    user = db.prepare("SELECT * FROM Users WHERE Username = ?")
      .get(username.toLowerCase());
  }

  db.prepare(`
    INSERT INTO Messages (CID, SenderUID, Content)
    VALUES (?, ?, ?)
  `).run(gameId, user.UID, content);

  res.json({ success: true });
});

/* FINISH EVENT */
router.post("/:id/finish", (req, res) => {
  const gameId = req.params.id;

  db.prepare(`
    UPDATE Games SET Status = 'completed'
    WHERE GID = ?
  `).run(gameId);

  res.json({ success: true });
});

module.exports = router;