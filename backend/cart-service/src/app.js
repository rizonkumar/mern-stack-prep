const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const cartRoutes = require("./routes/cartRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const {
  connectConsumer,
  disconnectConsumer,
} = require("./utils/kafkaConsumer");

dotenv.config();

const app = express();

connectDB();

connectConsumer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("Cart Service API is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, () => {
  console.log(
    `Cart Service running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

process.on("SIGTERM", async () => {
  console.log(
    "SIGTERM signal received: closing HTTP server and Kafka Consumer"
  );
  await disconnectConsumer();
  server.close(() => {
    console.log("HTTP server closed.");
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server and Kafka Consumer");
  await disconnectConsumer();
  server.close(() => {
    console.log("HTTP server closed.");
  });
});
