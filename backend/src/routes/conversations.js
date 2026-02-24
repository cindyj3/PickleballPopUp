const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/", (req, res) => {
  const { participantUids } = req.body;
  if (!Array.isArray(participantUids) || participantUids.length < 2) {
    return res.status(400).json({ error: "participantUids must be an array with at least 2 UIDs" });
  }

  const tx = db.transaction(() => {
    const info = db.prepare("INSERT INTO Conversations DEFAULT VALUES").run();
    const cid = info.lastInsertRowid;

    const ins = db.prepare("INSERT INTO ConversationParticipants (CID, UID) VALUES (?, ?)");
    for (const uid of participantUids) ins.run(cid, uid);

    return cid;
  });

  try {
    const cid = tx();
    res.status(201).json({ cid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:cid/messages", (req, res) => {
  const cid = Number(req.params.cid);
  const msgs = db.prepare(`
    SELECT m.MessageID, m.CID, m.SenderUID, u.Username as SenderUsername, m.Content, m.SentAt
    FROM Messages m
    JOIN Users u ON u.UID = m.SenderUID
    WHERE m.CID = ?
    ORDER BY m.SentAt ASC
  `).all(cid);

  res.json(msgs);
});

router.post("/:cid/messages", (req, res) => {
  const cid = Number(req.params.cid);
  const { senderUid, content } = req.body;
  if (!senderUid || !content) return res.status(400).json({ error: "senderUid and content required" });

  try {
    const info = db.prepare(`
      INSERT INTO Messages (CID, SenderUID, Content)
      VALUES (?, ?, ?)
    `).run(cid, senderUid, content);

    const msg = db.prepare("SELECT * FROM Messages WHERE MessageID=?").get(info.lastInsertRowid);
    res.status(201).json(msg);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
