const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const asyncHandler = require("express-async-handler");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getUserProfile);

router.get(
  "/validate-token",
  protect,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: "Token is valid",
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  })
);

module.exports = router;
