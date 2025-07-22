const express = require("express");
const dotenv = require("dotenv");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const Redis = require("ioredis");
const asyncHandler = require("express-async-handler");
const CustomError = require("./utils/CustomError");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware.js");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
redisClient.on("connect", () =>
  console.log("Redis Connected (API Gateway) for Rate Limiting")
);
redisClient.on("error", (err) =>
  console.error("Redis Error (API Gateway):", err)
);

const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: "rl-global:",
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});
app.use(globalLimiter);

const authenticateUser = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const response = await axios.get(
        `${process.env.USER_SERVICE_URL}/validate-token`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      req.user = response.data.data;
      next();
    } catch (error) {
      console.error("API Gateway Auth Error:", error.message);
      if (error.response && error.response.status === 401) {
        throw new CustomError(
          "Authentication failed: Invalid or expired token",
          401
        );
      } else if (error.response) {
        throw new CustomError(
          `Authentication service error: ${error.response.status} ${
            error.response.data.message || error.message
          }`,
          error.response.status
        );
      } else {
        throw new CustomError(
          "Authentication service unreachable or other network error",
          503
        );
      }
    }
  } else if (
    req.path.startsWith("/api/users/login") ||
    req.path.startsWith("/api/users/register")
  ) {
    next();
  } else {
    throw new CustomError("Authentication required: No token provided", 401);
  }
});
app.use(authenticateUser);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/users": "/api/users" },
  })
);

app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/products": "/api/products" },
  })
);

app.use(
  "/api/cart",
  createProxyMiddleware({
    target: process.env.CART_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/cart": "/api/cart" },
  })
);

app.get("/", (req, res) => {
  res.send("API Gateway is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `API Gateway running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
