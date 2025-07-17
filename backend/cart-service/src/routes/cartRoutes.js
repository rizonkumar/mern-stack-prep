const express = require("express");
const {
  getUserCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getUserCart);
router.post("/add", protect, addItemToCart);
router.put("/update/:productId", protect, updateCartItemQuantity);
router.delete("/remove/:productId", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

module.exports = router;
