const express = require("express");
const db = require("../db");

const router = express.Router();

/* GET ALL EVENTS */
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM Games ORDER BY GameTime DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* GET USERS */
router.get("/users", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT Username FROM Users");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* LEADERBOARD - must be before /:id routes */
router.get("/leaderboard", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        Users.Username,
        COUNT(GamePlayers.GID) as "totalGames",
        SUM(CASE WHEN GamePlayers.IsWinner = true THEN 1 ELSE 0 END) as wins
      FROM Users
      LEFT JOIN GamePlayers 
        ON Users.UID = GamePlayers.UID 
        AND GamePlayers.IsWinner IS NOT NULL
      GROUP BY Users.UID, Users.Username
      ORDER BY wins DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* HISTORY - must be before /:id routes */
router.get("/history", async (req, res) => {
  try {
    const { rows } = await db.query(`
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
      WHERE GamePlayers.IsWinner IS NOT NULL
      ORDER BY Games.GameTime DESC
    `);

    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.GID]) {
        grouped[row.GID] = {
          location: row.Location,
          time: row.GameTime,
          players: [],
          winner: null,
          score: null,
        };
      }
      if (row.IsWinner !== null) grouped[row.GID].players.push(row.Username);
      if (row.IsWinner === true) grouped[row.GID].winner = row.Username;
      if (row.Score) grouped[row.GID].score = row.Score;
    });

    res.json(Object.values(grouped));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* CREATE EVENT */
router.post("/", async (req, res) => {
  try {
    let { location, time, username } = req.body;
    if (!location || !time) return res.status(400).json({ error: "Missing fields" });

    location = location.trim().toLowerCase();
    username = username?.trim().toLowerCase();

    const existing = await db.query(
      "SELECT * FROM Games WHERE Location = $1 AND GameTime = $2",
      [location, time]
    );
    if (existing.rows.length > 0) return res.status(400).json({ error: "Event already exists!" });

    await db.query(
      "INSERT INTO Games (Location, GameTime, Status, CreatedBy) VALUES ($1, $2, 'scheduled', $3)",
      [location, time, username]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* GET PLAYERS FOR EVENT */
router.get("/:id/players", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT Users.Username, GamePlayers.IsWinner
      FROM GamePlayers
      JOIN Users ON GamePlayers.UID = Users.UID
      WHERE GamePlayers.GID = $1
    `, [req.params.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* JOIN EVENT */
router.post("/:id/join", async (req, res) => {
  try {
    const username = req.body.username.trim().toLowerCase();
    const gameId = req.params.id;

    await db.query("INSERT INTO Users (Username) VALUES ($1) ON CONFLICT (Username) DO NOTHING", [username]);
    const { rows } = await db.query("SELECT * FROM Users WHERE Username = $1", [username]);
    const user = rows[0];

    await db.query(
      "INSERT INTO GamePlayers (GID, UID) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [gameId, user.uid]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* LEAVE EVENT */
router.post("/:id/leave", async (req, res) => {
  try {
    const username = req.body.username.trim().toLowerCase();
    const gameId = req.params.id;

    const { rows } = await db.query("SELECT * FROM Users WHERE Username = $1", [username]);
    if (rows.length > 0) {
      await db.query("DELETE FROM GamePlayers WHERE GID = $1 AND UID = $2", [gameId, rows[0].uid]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* DELETE EVENT */
router.post("/:id/delete", async (req, res) => {
  try {
    const username = req.body.username.trim().toLowerCase();
    const gameId = req.params.id;

    const { rows } = await db.query("SELECT * FROM Games WHERE GID = $1", [gameId]);
    if (rows.length === 0) return res.status(404).json({ error: "Game not found" });
    if (rows[0].createdby !== username) return res.status(403).json({ error: "Not authorized" });

    await db.query("DELETE FROM GamePlayers WHERE GID = $1", [gameId]);
    await db.query("DELETE FROM Games WHERE GID = $1", [gameId]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* RECORD RESULT */
router.post("/:id/result", async (req, res) => {
  try {
    const { winner, score, players } = req.body;
    const gameId = req.params.id;

    if (!winner || !players || !score) return res.status(400).json({ error: "Missing data" });

    for (const name of players) {
      const { rows } = await db.query("SELECT * FROM Users WHERE Username = $1", [name.toLowerCase()]);
      if (rows.length > 0) {
        const user = rows[0];
        await db.query(
          `INSERT INTO GamePlayers (GID, UID, Score, IsWinner)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (GID, UID) DO UPDATE SET Score = $3, IsWinner = $4`,
          [gameId, user.uid, score, name === winner]
        );
      }
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* FINISH EVENT */
router.post("/:id/finish", async (req, res) => {
  try {
    await db.query("UPDATE Games SET Status = 'completed' WHERE GID = $1", [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* GET CHAT */
router.get("/:id/chat", async (req, res) => {
  try {
    const gameId = req.params.id;
    await db.query("INSERT INTO Conversations (CID) VALUES ($1) ON CONFLICT DO NOTHING", [gameId]);
    const { rows } = await db.query(`
      SELECT Messages.Content, Messages.SentAt, Users.Username
      FROM Messages
      JOIN Users ON Messages.SenderUID = Users.UID
      WHERE Messages.CID = $1
      ORDER BY Messages.SentAt ASC
    `, [gameId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* SEND CHAT */
router.post("/:id/chat", async (req, res) => {
  try {
    const { username, content } = req.body;
    const gameId = req.params.id;

    if (!content) return res.status(400).json({ error: "Empty message" });

    await db.query("INSERT INTO Users (Username) VALUES ($1) ON CONFLICT (Username) DO NOTHING", [username.toLowerCase()]);
    const { rows } = await db.query("SELECT * FROM Users WHERE Username = $1", [username.toLowerCase()]);
    const user = rows[0];

    await db.query(
      "INSERT INTO Messages (CID, SenderUID, Content) VALUES ($1, $2, $3)",
      [gameId, user.uid, content]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* RESET */
router.delete("/reset", async (req, res) => {
  try {
    await db.query("DELETE FROM GamePlayers");
    await db.query("DELETE FROM Games");
    await db.query("DELETE FROM Messages");
    await db.query("DELETE FROM Conversations");
    res.json({ message: "Reset complete" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
