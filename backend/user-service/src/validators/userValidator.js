const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.min": "Name should have at least 3 characters",
    "string.max": "Name should have at most 30 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(6)
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$"
      )
    )
    .messages({
      "string.min": "Password must be at least {#limit} characters long",
      "string.empty": "Password cannot be empty",
      "any.required": "Password is required",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
    }),
  role: Joi.string().valid("user", "admin").default("user").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org", "co", "in"] },
    })
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email cannot be empty",
      "any.required": "Email is required",
    }),
  password: Joi.string().required().messages({
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
});

module.exports = { registerSchema, loginSchema };
