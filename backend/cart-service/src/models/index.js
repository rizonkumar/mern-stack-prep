const Cart = require("./cart");
const CartItem = require("./cartItem");
const { sequelize } = require("../config/db");

// A cart has many cart items
Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
  onDelete: "CASCADE",
});

// A cart item belongs to a cart
CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
});

module.exports = { sequelize, Cart, CartItem };
