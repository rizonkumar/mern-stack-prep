const { Cart, CartItem } = require("../models");
const { redisClient } = require("../config/db");
const CustomError = require("../utils/CustomError");
const axios = require("axios");

const PRODUCT_SERVICE_URL = "http://product-service:3002/api/products";
const PRODUCT_CACHE_TTL = 3600;

/**
 * Fetches product details from Product Service, with Redis caching.
 * @param {string} productId - The ID of the product.
 * @returns {object} - Product details (id, name, price, quantity, imageUrl).
 * @throws {CustomError} If product not found or Product Service is unreachable.
 */

const getProductDetailsFromService = async (productId) => {
  const cacheKey = `product:${productId}`;
  let productDetails;

  // 1. Try to fetch from Redis cache
  try {
    const cachedProduct = await redisClient.get(cacheKey);
    if (cachedProduct) {
      productDetails = JSON.parse(cachedProduct);
      console.log(
        `[Cart Service] Product details fetched from Redis cache: ${productId}`
      );
      return productDetails;
    }
  } catch (error) {
    console.error(
      `[Cart Service] Error fetching product details from Redis cache: ${error.message}`
    );
  }

  // 2. If not in cache, fetch from Product Service
  try {
    console.log(
      `[Cart Service] Fetching product ${productId} from Product Service.`
    );

    const response = await axios.get(`${PRODUCT_SERVICE_URL}/${productId}`);

    productDetails = response.data.data;
    if (!productDetails) {
      throw new CustomError(
        `Product with ID ${productId} not found in Product Service.`,
        404
      );
    }

    // 3. Cache the fetched product details in Redis
    try {
      await redisClient.setex(
        cacheKey,
        PRODUCT_CACHE_TTL,
        JSON.stringify(productDetails)
      );
      console.log(`[Cart Service] Cached product ${productId} in Redis.`);
    } catch (cacheError) {
      console.warn(
        `[Cart Service] Redis cache write error for ${productId}:`,
        cacheError.message
      );
    }
    return productDetails;
  } catch (error) {
    if (error.response && error.response.status) {
      if (error.response.status === 404) {
        throw new CustomError(`Product with ID ${productId} not found.`, 404);
      } else {
        throw new CustomError(
          `Error fetching product details from service: ${
            error.response.data.message || error.message
          }`,
          error.response.status
        );
      }
    } else if (error.request) {
      throw new CustomError(
        "Product Service is unreachable or no response",
        503
      );
    } else {
      throw new CustomError(
        `Error preparing request to Product Service: ${error.message}`,
        500
      );
    }
  }
};

/**
 * Retrieves a user's cart, creating one if it doesn't exist.
 * It also updates item details with real-time data from Product Service (via Redis cache).
 * @param {string} userId - The ID of the user.
 * @returns {object} - The user's cart object, including its items with live data.
 */

const getUserCart = async (userId) => {
  // Find the cart by userId, or create if it doesn't exist
  // "include" ensure that associated cartItems are loaded with the cart

  let cart = await Cart.findOne({
    where: { userId },
    include: { model: CartItem, as: "items" },
  });

  // If no cart exists, create one
  if (!cart) {
    cart = await Cart.create({ userId });
    console.log(`[Cart Service] Created new cart for user ${userId}.`);
  }

  // Re-fetch the cart after creation to ensure associations are properly loaded,
  // though for a new cart, 'items' will be empty.

  cart = await Cart.findOne({
    where: { userId },
    include: { model: CartItem, as: "items" },
  });

  // For real time price and stock, iterate through each cart item and fetch it's live detauls from the product service via caching helper

  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    console.log(
      `[Cart Service] Updating item ${item.id} with live data.`,
      item
    );
    try {
      const liveProduct = await getProductDetailsFromService(item.productId);
      // Update item details in memory (for this response only) with live data.
      // We use setDataValue as we are modifying model instance directly without saving to DB.
      item.setDataValue("productName", liveProduct.name);
      item.setDataValue("productPrice", liveProduct.price);
      item.setDataValue("productImageUrl", liveProduct.imageUrl);

      // Check and set availability status for the frontend
      if (!liveProduct.isActive || liveProduct.quantity === 0) {
        item.setDataValue("availableQuantity", liveProduct.quantity);
        item.setDataValue("isOutOfStock", true);
        item.setDataValue("isPartiallyAvailable", false);
        item.setDataValue(
          "message",
          liveProduct.isActive ? "Out of stock" : "Product inactive"
        );
      } else if (liveProduct.quantity < item.quantity) {
        item.setDataValue("availableQuantity", liveProduct.quantity);
        item.setDataValue("isOutOfStock", false);
        item.setDataValue("isPartiallyAvailable", true);
        item.setDataValue(
          "message",
          `Only ${liveProduct.quantity} available. Your quantity has been adjusted.`
        );
      } else {
        item.setDataValue("availableQuantity", liveProduct.quantity);
        item.setDataValue("isOutOfStock", false);
        item.setDataValue("isPartiallyAvailable", false);
        item.setDataValue("message", "");
      }
    } catch (error) {
      console.warn(
        `[Cart Service] Could not fetch live details for product ${item.productId}: ${error.message}`
      );
      item.setDataValue("isUnavailable", true);
      item.setDataValue(
        "message",
        "Product details unavailable or product deleted."
      );
    }
  }

  return cart;
};

/**
 * Adds a product to the user's cart or updates its quantity if already present.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to add.
 * @param {number} quantity - The quantity to add/set.
 * @returns {object} - The updated or newly created cart item.
 * @throws {CustomError} If product not found, inactive, or insufficient stock.
 */

const addItemToCart = async (userId, productId, quantity) => {
  // 1. Get or create the user cart
  const [userCart, created] = await Cart.findOrCreate({
    where: { userId },
  });

  // 2. Get real time product details from product service (with redis caching)
  const productDetails = await getProductDetailsFromService(productId);

  // Initial check for product availability and validity

  if (!productDetails.isActive) {
    throw new CustomError(
      `Product "${productDetails.name}" is not active and cannot be added.`,
      400
    );
  }

  // 3. Find if the item is already exists in the cart
  let cartItem = await CartItem.findOne({
    where: { cartId: userCart.id, productId: productId },
  });

  // 4. Determine new quantity and check stock
  const finalQuantity = quantity; // Quantity to add for new item

  if (cartItem) {
    // If item exists, sum current quantitu with new quantity
    finalQuantity = cartItem.quantity + quantity;
  }

  if (productDetails.quantity < finalQuantity) {
    throw new CustomError(
      `Insufficient stock for "${productDetails.name}". ` +
        `Requested: ${finalQuantity}, available: ${productDetails.quantity}.` +
        (cartItem ? ` You currently have ${cartItem.quantity} in cart.` : ""),
      400
    );
  }

  // 5. If item exists, update its quantity; otherwise, create a new cart item.
  if (cartItem) {
    cartItem.quantity = finalQuantity;
    await cartItem.save();
    console.log(
      `[Cart Service] Updated quantity for product ${productId} in cart ${userCart.id} to ${finalQuantity}.`
    );
  } else {
    cartItem = await CartItem.create({
      cartId: userCart.id,
      productId: productId,
      quantity: finalQuantity,
      productName: productDetails.name,
      productPrice: productDetails.price,
      productImageUrl: productDetails.imageUrl,
    });
    console.log(
      `[Cart Service] Added product ${productId} to cart ${userCart.id} with quantity ${quantity}.`
    );
  }
  return cartItem;
};

/**
 * Updates the quantity of a specific item in the cart.
 * If newQuantity is 0, the item is removed from the cart.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to update.
 * @param {number} newQuantity - The new quantity for the item.
 * @returns {object} - The updated cart item or a message if removed.
 * @throws {CustomError} If cart or item not found, or insufficient stock.
 */

const updateCartItemQuantity = async (userId, productId, newQuantity) => {
  const cart = await Cart.findOne({
    where: { userId },
  });

  if (!cart) {
    throw new CustomError("Cart not found for user", 404);
  }

  let cartItem = await CartItem.findOne({
    where: { cartId: cart.id, productId: productId },
  });

  if (!cartItem) {
    throw new CustomError("Product not found in cart", 404);
  }

  // If newQuantity is 0, remove the item from the cart
  if (newQuantity === 0) {
    await cartItem.destroy();
    console.log(
      `[Cart Service] Removed product ${productId} from cart ${cart.id} by setting quantity to 0.`
    );

    return { message: "Product removed from cart successfully." };
  }

  // Get real-time product details for stock check
  const productDetails = await getProductDetailsFromService(productId);

  // Check if new quantity exceed available stock
  if (productDetails.quantity < newQuantity) {
    throw new CustomError(
      `Insufficient stock for "${productDetails.name}". Cannot set quantity to ${newQuantity}. Only ${productDetails.quantity} available.`,
      400
    );
  }

  // Update quanity and save to DB
  cartItem.quantity = newQuantity;
  await cartItem.save();
  console.log(
    `[Cart Service] Updated quantity for product ${productId} in cart ${cart.id} to ${newQuantity}.`
  );

  return cartItem;
};

/**
 * Removes a specific item from the cart.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to remove.
 * @returns {object} - A message confirming removal.
 * @throws {CustomError} If cart or item not found.
 */

const removeCartItem = async (userId, productId) => {
  const cart = await Cart.findOne({
    where: { userId },
  });

  if (!cart) {
    throw new CustomError("Cart not found for user", 404);
  }

  const cartItem = await CartItem.findOne({
    where: { cartId: cart.id, productId: productId },
  });

  if (!cartItem) {
    throw new CustomError("Product not found in cart", 404);
  }

  await cartItem.destroy();
  console.log(
    `[Cart Service] Removed product ${productId} from cart ${cart.id}.`
  );
  return { message: "Product removed from cart successfully." };
};

/**
 * Clears all items from a user's cart.
 * @param {string} userId - The ID of the user.
 * @returns {object} - A message confirming the cart is cleared.
 * @throws {CustomError} If cart not found.
 */

const clearCart = async (userId) => {
  const cart = await Cart.findOne({
    where: { userId },
  });

  if (!cart) {
    throw new CustomError("Cart not found for user", 404);
  }

  await CartItem.destroy({ where: { cartId: cart.id } });
  console.log(`[Cart Service] Cleared all items from cart ${cart.id}.`);

  return { message: "Cart cleared successfully." };
};

module.exports = {
  getUserCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
