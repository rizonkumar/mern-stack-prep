const asyncHandler = require("express-async-handler");
const {
  addItemToCartSchema,
  updateCartItemQuantitySchema,
} = require("../validators/cartValidator");
const cartService = require("../services/cartService");
const CustomError = require("../utils/CustomError");

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private (User specific)
 */
const getUserCart = asyncHandler(async (req, res) => {
  // We assume req.user is populated by authentication middleware
  if (!req.user || !req.user._id) {
    throw new CustomError("User not authenticated or ID missing", 401);
  }
  const userId = req.user._id; // Get the authenticated user's ID

  const cart = await cartService.getUserCart(userId);

  res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    data: cart,
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private (User specific)
 */
const addItemToCart = asyncHandler(async (req, res) => {
  // Get authenticated user's ID
  if (!req.user || !req.user._id) {
    throw new CustomError("User not authenticated or ID missing", 401);
  }
  const userId = req.user._id;

  // Validate request body using Joi
  const { error, value } = addItemToCartSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));
    throw new CustomError("Validation failed", 400, errors);
  }

  const { productId, quantity } = value; // Use validated values

  const cartItem = await cartService.addItemToCart(userId, productId, quantity);

  res.status(201).json({
    success: true,
    message: "Item added to cart successfully",
    data: cartItem,
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/update/:productId
 * @access  Private (User specific)
 */
const updateCartItemQuantity = asyncHandler(async (req, res) => {
  // Get authenticated user's ID
  if (!req.user || !req.user._id) {
    throw new CustomError("User not authenticated or ID missing", 401);
  }
  const userId = req.user._id;

  const { productId } = req.params; // Get productId from URL params

  // Validate request body (new quantity) using Joi
  const { error, value } = updateCartItemQuantitySchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));
    throw new CustomError("Validation failed", 400, errors);
  }

  const { quantity } = value; // This is the new quantity

  const updatedItem = await cartService.updateCartItemQuantity(
    userId,
    productId,
    quantity
  );

  res.status(200).json({
    success: true,
    message: "Cart item quantity updated successfully",
    data: updatedItem,
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/remove/:productId
 * @access  Private (User specific)
 */
const removeCartItem = asyncHandler(async (req, res) => {
  // Get authenticated user's ID
  if (!req.user || !req.user._id) {
    throw new CustomError("User not authenticated or ID missing", 401);
  }
  const userId = req.user._id;

  const { productId } = req.params; // Get productId from URL params

  await cartService.removeCartItem(userId, productId);

  res.status(200).json({
    success: true,
    message: "Product removed from cart successfully",
  });
});

/**
 * @desc    Clear user's cart
 * @route   DELETE /api/cart/clear
 * @access  Private (User specific)
 */
const clearCart = asyncHandler(async (req, res) => {
  // Get authenticated user's ID
  if (!req.user || !req.user._id) {
    throw new CustomError("User not authenticated or ID missing", 401);
  }
  const userId = req.user._id;

  await cartService.clearCart(userId);

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
  });
});

module.exports = {
  getUserCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
