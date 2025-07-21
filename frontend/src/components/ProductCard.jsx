import React from "react";

function ProductCard({ product, onAddToCart }) {
  const defaultImageUrl = "https://via.placeholder.com/150?text=No+Image";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center">
      <img
        src={product.imageUrl || defaultImageUrl}
        alt={product.name}
        className="w-32 h-32 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {product.name}
      </h3>
      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
        {product.description}
      </p>
      <div className="flex justify-between items-center w-full mb-4">
        <span className="text-xl font-bold text-blue-600">
          ${product.price}
        </span>
        <span
          className={`text-sm font-medium ${
            product.quantity > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {product.quantity > 0
            ? `In Stock: ${product.quantity}`
            : "Out of Stock"}
        </span>
      </div>
      {product.quantity > 0 ? (
        <button
          onClick={() => onAddToCart(product.id, 1)} // Assumes adding 1 quantity
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
        >
          Add to Cart
        </button>
      ) : (
        <button
          disabled
          className="bg-gray-400 text-white font-bold py-2 px-4 rounded-full cursor-not-allowed"
        >
          Out of Stock
        </button>
      )}
    </div>
  );
}

export default ProductCard;
