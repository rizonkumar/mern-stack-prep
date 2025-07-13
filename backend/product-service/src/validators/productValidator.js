const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    "string.min": "Product name must be at least {#limit} characters long",
    "string.max": "Product name must not exceed {#limit} characters",
    "string.empty": "Product name cannot be empty",
    "any.required": "Product name is required",
  }),

  description: Joi.string().max(5000).optional().messages({
    "string.max": "Product description must not exceed {#limit} characters",
  }),

  price: Joi.number().precision(2).positive().required().messages({
    "number.base": "Product price must be a number",
    "number.precision":
      "Product price can have at most {#limit} decimal places",
    "number.positive": "Product price must be a positive number",
    "any.required": "Product price is required",
  }),

  quantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Product quantity must be a number",
    "number.integer": "Product quantity must be an integer",
    "number.min": "Product quantity cannot be negative",
    "any.required": "Product quantity is required",
  }),

  imageUrl: Joi.string().uri().max(1024).optional().messages({
    "string.uri": "Product image URL must be a valid URL",
    "string.max": "Product image URL must not exceed {#limit} characters",
  }),

  category: Joi.string().max(100).optional().messages({
    "string.max": "Product category must not exceed {#limit} characters",
  }),

  isActive: Joi.boolean().optional().default(true).messages({
    "boolean.base": "isActive must be a boolean value (true/false)",
  }),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional().messages({
    "string.min": "Product name must be at least {#limit} characters long",
    "string.max": "Product name must not exceed {#limit} characters",
    "string.empty": "Product name cannot be empty",
  }),

  description: Joi.string().max(5000).optional().messages({
    "string.max": "Product description must not exceed {#limit} characters",
  }),

  price: Joi.number().precision(2).positive().optional().messages({
    "number.base": "Product price must be a number",
    "number.precision":
      "Product price can have at most {#limit} decimal places",
    "number.positive": "Product price must be a positive number",
  }),

  quantity: Joi.number().integer().min(0).optional().messages({
    "number.base": "Product quantity must be a number",
    "number.integer": "Product quantity must be an integer",
    "number.min": "Product quantity cannot be negative",
  }),

  imageUrl: Joi.string().uri().max(1024).optional().messages({
    "string.uri": "Product image URL must be a valid URL",
    "string.max": "Product image URL must not exceed {#limit} characters",
  }),

  category: Joi.string().max(100).optional().messages({
    "string.max": "Product category must not exceed {#limit} characters",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean value (true/false)",
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
