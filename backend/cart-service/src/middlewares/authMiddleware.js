const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/CustomError");
const axios = require("axios"); // For making internal HTTP calls

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const userValidationResponse = await axios.get(
        `http://user-service:3001/api/users/validate-token`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      req.user = userValidationResponse.data.data;

      if (!req.user || !req.user._id) {
        throw new CustomError(
          "User authentication failed. Invalid token or user data from auth service.",
          401
        );
      }

      next();
    } catch (error) {
      console.error(
        "Token validation with User Service failed:",
        error.message
      );

      if (error.response) {
        if (error.response.status === 401) {
          throw new CustomError(
            "Not authorized, token invalid or expired",
            401
          );
        } else {
          throw new CustomError(
            `Authentication service error: ${error.response.status} ${
              error.response.data.message || error.message
            }`,
            error.response.status
          );
        }
      } else if (error.request) {
        throw new CustomError("Authentication service is unreachable", 503);
      } else {
        throw new CustomError(`Authentication failed: ${error.message}`, 500);
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
