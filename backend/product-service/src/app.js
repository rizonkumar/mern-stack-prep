const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const {
  connectProducer,
  disconnectProducer,
} = require("./utils/kafkaProducer");

dotenv.config();

const app = express();

connectDB();

connectProducer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Product Service API is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(
    `Product Service running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

process.on("SIGTERM", async () => {
  console.log(
    "SIGTERM signal received: closing HTTP server and Kafka Producer"
  );
  await disconnectProducer();
  server.close(() => {
    console.log("HTTP server closed.");
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server and Kafka Producer");
  await disconnectProducer();
  server.close(() => {
    console.log("HTTP server closed.");
  });
});
