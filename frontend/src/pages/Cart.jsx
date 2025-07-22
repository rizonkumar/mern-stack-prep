import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../api/axiosConfig";
import { Link } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/cart");
      setCart(response.data.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError(err.response?.data?.message || "Could not load cart data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (productId, quantity) => {
    setActionMessage("");
    try {
      const response = await apiClient.put(`/cart/update/${productId}`, {
        quantity,
      });

      await fetchCart();
      setActionMessage(response.data.message || "Cart updated!");
    } catch (err) {
      console.error("Failed to update cart item quantity:", err);
      setActionMessage(
        err.response?.data?.message || "Failed to update item quantity."
      );
    } finally {
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  const handleRemoveItem = async (productId) => {
    setActionMessage("");
    try {
      const response = await apiClient.delete(`/cart/remove/${productId}`);
      await fetchCart();
      setActionMessage(response.data.message || "Item removed from cart!");
    } catch (err) {
      console.error("Failed to remove item:", err);
      setActionMessage(
        err.response?.data?.message || "Failed to remove item from cart."
      );
    } finally {
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  const handleClearCart = async () => {
    setActionMessage("");
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        const response = await apiClient.delete("/cart/clear");
        await fetchCart();
        setActionMessage(response.data.message || "Cart cleared successfully!");
      } catch (err) {
        console.error("Failed to clear cart:", err);
        setActionMessage(
          err.response?.data?.message || "Failed to clear cart."
        );
      } finally {
        setTimeout(() => setActionMessage(""), 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
        <p className="text-sm mt-2">
          Please ensure you are logged in and the Cart Service is running.
        </p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center mt-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Your Cart is Empty!
        </h2>
        <p className="text-gray-600 text-lg mb-6">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/products"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.items.reduce(
    (sum, item) => sum + parseFloat(item.productPrice || 0) * item.quantity,
    0
  );

  return (
    <div className="mt-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Your Shopping Cart
      </h2>

      {actionMessage && (
        <div
          className={`py-2 px-4 rounded mb-4 text-center ${
            actionMessage.includes("failed") || actionMessage.includes("error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {actionMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b last:border-b-0 py-4"
          >
            <div className="flex items-center space-x-4">
              <img
                src={
                  item.productImageUrl ||
                  "https://via.placeholder.com/60?text=No+Image"
                }
                alt={item.productName}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.productName}
                </h3>
                <p className="text-gray-600 text-sm">
                  ${parseFloat(item.productPrice || 0).toFixed(2)} each
                </p>
                {/* Display stock/availability messages */}
                {item.message && (
                  <p
                    className={`text-xs font-medium mt-1 ${
                      item.isOutOfStock || item.isUnavailable
                        ? "text-red-500"
                        : item.isPartiallyAvailable
                        ? "text-orange-500"
                        : "text-green-500"
                    }`}
                  >
                    {item.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.productId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.productId, item.quantity + 1)
                  }
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleRemoveItem(item.productId)}
                className="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
        <div>
          <p className="text-xl font-semibold text-gray-800">
            Total Items: {totalItems}
          </p>
          <p className="text-2xl font-bold text-blue-600">
            Total Price: ${totalPrice.toFixed(2)}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleClearCart}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
          >
            Clear Cart
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200">
            Proceed to Checkout (Coming Soon!)
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
