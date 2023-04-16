const express = require("express");
const connectToMongo = require("./db");
const cors = require("cors");
require("dotenv").config();

connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Available routes

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log("listening app at", `http://localhost:${port}`);
});
