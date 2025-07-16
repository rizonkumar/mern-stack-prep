const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Cart Service API is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(
    `Cart Service running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
