const User = require("../models/user");
const jwt = require("jsonwebtoken");
const CustomError = require("../utils/CustomError.js");

// Helper function to generate JWT token

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Registers a new user.
 * @param {object} userData - The user data from the request body (name, email, password, etc.).
 * @returns {object} - The created user (excluding password) and a JWT token.
 * @throws {CustomError} If user with email already exists.
 */

const registerUser = async (userData) => {
  const { email } = userData;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new CustomError("User with this email already exists", 400);
  }

  const user = await User.create(userData);

  if (user) {
    // Generate JWT token
    const token = generateToken(user._id);

    // return user data and token
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    };
  } else {
    throw new CustomError("Invalid user data received", 400);
  }
};

/**
 * Authenticates a user and generates a JWT token.
 * @param {string} email - The user's email.
 * @param {string} password - The user's plain-text password.
 * @returns {object} - The authenticated user (excluding password) and a JWT token.
 * @throws {CustomError} If authentication fails (invalid credentials).
 */

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Generate JWT token
    const token = generateToken(user._id);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    };
  } else {
    throw new CustomError("Invalid email or password", 401);
  }
};

/**
 * Get user profile by ID.
 * @param {string} userId - The ID of the user.
 * @returns {object} - The user profile (excluding password).
 * @throws {CustomError} If user not found.
 */

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  } else {
    throw new CustomError("User not found", 404);
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
