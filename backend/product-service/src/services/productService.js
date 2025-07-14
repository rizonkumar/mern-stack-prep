const Product = require("../models/productModel");
const CustomError = require("../utils/CustomError");

/**
 * Creates a new product.
 * @param {object} productData - The validated product data (name, description, price, etc.).
 * @returns {object} - The newly created product object.
 * @throws {CustomError} If a product with the same name already exists.
 */

const createProduct = async (productData) => {
  const { name } = productData;

  const existingProduct = await Product.findOne({ where: { name } });

  if (existingProduct) {
    throw new CustomError("Product with this name alread exists", 400);
  }

  const product = await Product.create(productData);

  return product;
};

/**
 * Retrieves all products.
 * @param {object} [options] - Optional query options (e.g., filters, pagination).
 * @returns {Array<object>} - An array of product objects.
 */

const getAllProducts = async (options = {}) => {
  // TODO: Impelement pagaintion, filtering, sorting

  const product = await Product.findAll(options);
  return product;
};

/**
 * Retrieves a single product by its ID.
 * @param {string} productId - The UUID of the product.
 * @returns {object} - The product object.
 * @throws {CustomError} If product not found.
 */

const getProductById = async (productId) => {
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  return product;
};

/**
 * Updates an existing product.
 * @param {string} productId - The UUID of the product to update.
 * @param {object} updateData - The validated data to update (partial or full).
 * @returns {object} - The updated product object.
 * @throws {CustomError} If product not found or update fails.
 */
const updateProduct = async (productId, updateData) => {
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  // If updating the name, check for uniqueness (only if name is actually changing)
  if (updateData.name && updateData.name !== product.name) {
    const existingProduct = await Product.findOne({
      where: { name: updateData.name },
    });
    if (existingProduct) {
      throw new CustomError("Product with this name already exists", 400);
    }
  }

  const updatedProduct = await product.update(updateData);

  return updatedProduct;
};

/**
 * Deletes a product.
 * @param {string} productId - The UUID of the product to delete.
 * @returns {number} - 1 if deleted, 0 if not found.
 * @throws {CustomError} If product not found.
 */

const deleteProduct = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  await product.destroy();
  return { message: "Product deleted successfully" };
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
