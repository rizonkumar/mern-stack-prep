const asyncHandler = require("express-async-handler");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validators/productValidator");
const productService = require("../services/productService");
const CustomError = require("../utils/CustomError");

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Admin only - will apply middleware later)
 */

const createProduct = asyncHandler(async (req, res) => {
  const { error, value } = createProductSchema.validate(req.body);

  if (error) {
    const errors = error.details.map((err) => ({
      path: err.path[0],
      message: err.message,
    }));

    throw new CustomError("Validation error", 400, errors);
  }

  const product = await productService.createProduct(value);

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: product,
  });
});

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();

  res.status(200).json({
    status: "success",
    message: "Products fetched successfully",
    data: products,
    count: products.length,
  });
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await productService.getProductById(id);

  res.status(200).json({
    status: "success",
    message: "Product fetched successfully",
    data: product,
  });
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private (Admin only - will apply middleware later)
 */

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateProductSchema.validate(req.body);

  if (error) {
    const errors = error.details.map((err) => ({
      path: err.path[0],
      message: err.message,
    }));

    throw new CustomError("Validation error", 400, errors);
  }

  const product = await productService.updateProduct(id, value);

  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
  });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only - will apply middleware later)
 */

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await productService.deleteProduct(id);

  res.status(200).json({
    status: "success",
    message: "Product deleted successfully",
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
