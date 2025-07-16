const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const CustomError = require("../utils/CustomError");

/**
 * Middleware to protect routes by verifying JWT token.
 * It expects a token in the Authorization header: "Bearer TOKEN"
 */

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]; // Splits "Bearer TOKEN" into ["Bearer", "TOKEN"]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from the token payload and attach to request
      // .select('-password') ensures we don't bring the hashed password into req.user
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        throw new CustomError(
          "User not found. Token is valid but user does not exist.",
          401
        );
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);

      if (error.name === "TokenExpiredError") {
        throw new CustomError("Not authorized, token expired", 401);
      } else if (error.name === "JsonWebTokenError") {
        throw new CustomError(
          "Not authorized, token failed (invalid token)",
          401
        );
      } else {
        throw new CustomError("Not authorized, token failed", 401);
      }
    }
  }

  if (!token) {
    throw new CustomError("Not authorized, no token", 401);
  }
});

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new CustomError(
        `User role ${
          req.user ? req.user.role : "unauthenticated"
        } is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
