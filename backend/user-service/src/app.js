const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const cors = require("cors");
dotenv.config();

const app = express();

connectDB();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("User Service API is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `User Service running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
