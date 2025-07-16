const Joi = require("joi");

const addItemToCartSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    "string.uuid": "Product ID must be a valid UUID",
    "string.empty": "Product ID cannot be empty",
    "any.required": "Product ID is required",
  }),

  quantity: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least {#limit}",
    "any.required": "Quantity is required",
  }),
});

const updateCartItemQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity cannot be negative",
    "any.required": "Quantity is required",
  }),
});

module.exports = {
  addItemToCartSchema,
  updateCartItemQuantitySchema,
};
