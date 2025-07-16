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
