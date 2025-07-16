const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isInt: { msg: "Quantity must be an integer" },
        min: { args: [1], msg: "Quantity must be at least 1" },
      },
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: true, // Will be populated from product service
    },
    productPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Will be populated from product service
    },
    productImageUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: "cart_items",
  }
);

module.exports = CartItem;
