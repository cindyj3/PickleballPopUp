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

/* LEADERBOARD */
router.get("/leaderboard", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        Users.Username,
        COUNT(DISTINCT sgp.sgid) as "totalGames",
        SUM(CASE WHEN sgp.iswinner = true THEN 1 ELSE 0 END) as wins
      FROM Users
      JOIN SubGamePlayers sgp ON Users.UID = sgp.uid
      JOIN SubGames sg ON sgp.SGID = sg.SGID
      JOIN Games g ON sg.GID = g.GID
      WHERE g.Status = 'completed'
      GROUP BY Users.UID, Users.Username
      HAVING COUNT(DISTINCT sgp.sgid) > 0
      ORDER BY wins DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* HISTORY */
router.get("/history", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        Games.GID,
        Games.Location,
        Games.GameTime,
        SubGames.SGID,
        SubGames.Team1Score,
        SubGames.Team2Score,
        SubGames.CreatedAt as SubGameTime,
        sgp.IsWinner,
        Users.Username
      FROM Games
      JOIN SubGames ON Games.GID = SubGames.GID
      JOIN SubGamePlayers sgp ON SubGames.SGID = sgp.SGID
      JOIN Users ON sgp.UID = Users.UID
      ORDER BY SubGames.CreatedAt DESC
    `);

    const grouped = {};
    rows.forEach(row => {
      const key = row.sgid;
      if (!grouped[key]) {
        grouped[key] = {
          sgid: row.sgid,
          gid: row.GID,
          location: row.Location,
          time: row.SubGameTime,
          team1score: row.team1score,
          team2score: row.team2score,
          players: [],
          winners: [],
        };
      }
      grouped[key].players.push(row.Username);
      if (row.iswinner) grouped[key].winners.push(row.Username);
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
      SELECT Users.Username
      FROM GamePlayers
      JOIN Users ON GamePlayers.UID = Users.UID
      WHERE GamePlayers.GID = $1
    `, [req.params.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* GET SUB-GAMES FOR EVENT */
router.get("/:id/subgames", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        SubGames.SGID,
        SubGames.Team1Score,
        SubGames.Team2Score,
        SubGames.CreatedAt,
        sgp.IsWinner,
        sgp.Team,
        Users.Username
      FROM SubGames
      JOIN SubGamePlayers sgp ON SubGames.SGID = sgp.SGID
      JOIN Users ON sgp.UID = Users.UID
      WHERE SubGames.GID = $1
      ORDER BY SubGames.CreatedAt ASC
    `, [req.params.id]);

    const grouped = {};
    rows.forEach(row => {
      const key = row.sgid;
      if (!grouped[key]) {
        grouped[key] = {
          sgid: row.sgid,
          team1score: row.team1score,
          team2score: row.team2score,
          createdat: row.createdat,
          team1: [],
          team2: [],
        };
      }
      if (row.team === 1) grouped[key].team1.push(row.Username);
      if (row.team === 2) grouped[key].team2.push(row.Username);
    });

    res.json(Object.values(grouped));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* RECORD SUB-GAME */
router.post("/:id/subgame", async (req, res) => {
  try {
    const { team1, team2, team1score, team2score } = req.body;
    const gameId = req.params.id;

    if (!team1 || !team2 || team1score === undefined || team2score === undefined) {
      return res.status(400).json({ error: "Missing data" });
    }

    // Create sub-game
    const { rows: sgRows } = await db.query(
      "INSERT INTO SubGames (GID, Team1Score, Team2Score) VALUES ($1, $2, $3) RETURNING SGID",
      [gameId, team1score, team2score]
    );
    const sgid = sgRows[0].sgid;
    const team1wins = parseInt(team1score) > parseInt(team2score);

    // Record team 1 players
    for (const name of team1) {
      const { rows } = await db.query("SELECT * FROM Users WHERE Username = $1", [name.toLowerCase()]);
      if (rows.length > 0) {
        await db.query(
          "INSERT INTO SubGamePlayers (SGID, UID, Team, IsWinner) VALUES ($1, $2, $3, $4)",
          [sgid, rows[0].uid, 1, team1wins]
        );
      }
    }

    // Record team 2 players
    for (const name of team2) {
      const { rows } = await db.query("SELECT * FROM Users WHERE Username = $1", [name.toLowerCase()]);
      if (rows.length > 0) {
        await db.query(
          "INSERT INTO SubGamePlayers (SGID, UID, Team, IsWinner) VALUES ($1, $2, $3, $4)",
          [sgid, rows[0].uid, 2, !team1wins]
        );
      }
    }

    res.json({ success: true, sgid });
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
    await db.query("DELETE FROM SubGamePlayers");
    await db.query("DELETE FROM SubGames");
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