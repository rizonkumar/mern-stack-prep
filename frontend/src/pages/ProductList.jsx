import React, { useState, useEffect } from "react";
import apiClient from "../api/axiosConfig";
import ProductCard from "../components/ProductCard";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addToCartMessage, setAddToCartMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get("/products");
        setProducts(response.data.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err.response?.data?.message || "Could not load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId, quantity) => {
    setAddToCartMessage("");
    try {
      const response = await apiClient.post("/cart/add", {
        productId,
        quantity,
      });
      setAddToCartMessage(response.data.message || "Item added to cart!");
      setTimeout(() => setAddToCartMessage(""), 3000);
    } catch (err) {
      console.error("Add to cart failed:", err);
      setAddToCartMessage(
        err.response?.data?.message || "Failed to add item to cart."
      );
      setTimeout(() => setAddToCartMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Our Products
      </h2>

      {addToCartMessage && (
        <div
          className={`py-2 px-4 rounded mb-4 text-center ${
            addToCartMessage.includes("failed") ||
            addToCartMessage.includes("insufficient")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {addToCartMessage}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No products available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
