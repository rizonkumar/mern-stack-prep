const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

connectDB();

app.get("/", (req, res) => {
  res.send("User Service API is running...");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
