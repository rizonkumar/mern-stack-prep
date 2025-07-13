const asyncHandler = require("express-async-handler");
const { registerSchema, loginSchema } = require("../validators/userValidator");
const userService = require("../services/userService");
const CustomError = require("../utils/CustomError");

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */

const registerUser = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));

    throw new CustomError("Validation error", 400, errors);
  }

  const user = await userService.registerUser(value);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */

const loginUser = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));

    throw new CustomError("Validation error", 400, errors);
  }

  const { email, password } = value;
  const user = await userService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: user,
  });
});

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private (Requires authentication)
 */

const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new CustomError("Not authorized, no token or user ID", 401);
  }

  const userProfile = await userService.getUserProfile(req.user._id);

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: userProfile,
  });
});

module.exports = { registerUser, loginUser, getUserProfile };
