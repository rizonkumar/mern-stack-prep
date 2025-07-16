// backend/cart-service/src/routes/cartRoutes.js
const express = require("express");
const {
  getUserCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController"); // Get our cart controllers
const { protect } = require("../middlewares/authMiddleware"); // Auth middleware

const router = express.Router();

// All cart operations are user-specific and require authentication
router.get("/", protect, getUserCart); // GET /api/cart
router.post("/add", protect, addItemToCart); // POST /api/cart/add
router.put("/update/:productId", protect, updateCartItemQuantity); // PUT /api/cart/update/:productId
router.delete("/remove/:productId", protect, removeCartItem); // DELETE /api/cart/remove/:productId
router.delete("/clear", protect, clearCart); // DELETE /api/cart/clear

module.exports = router;
