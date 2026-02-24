const express = require("express");
const cors = require("cors");

const usersRouter = require("./src/routes/users");
const gamesRouter = require("./src/routes/games");
const conversationsRouter = require("./src/routes/conversations");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/users", usersRouter);
app.use("/api/games", gamesRouter);
app.use("/api/conversations", conversationsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
