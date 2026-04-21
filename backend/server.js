const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
const gameRoutes = require("./src/routes/games");
app.use("/api/games", gameRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// start server
const PORT = process.env.PORT || 3001;

console.log("Starting server...");

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});