// frontend/src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

function Home() {
  return (
    <div className="text-center mt-12 p-8 bg-white rounded-lg shadow-xl max-w-2xl mx-auto">
      <h2 className="text-5xl font-extrabold text-blue-700 mb-4 animate-fadeIn">
        Welcome to E-Shop!
      </h2>
      <p className="text-xl text-gray-700 mb-8 leading-relaxed animate-slideUp">
        Your ultimate destination for a seamless online shopping experience.
        Explore a wide range of products, build your perfect cart, and enjoy our
        fast and reliable service.
      </p>

      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        <Link
          to="/products"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full 
                     transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Explore Products
        </Link>
        <Link
          to="/cart"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full 
                     transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          View Cart
        </Link>
      </div>

      <p className="mt-12 text-sm text-gray-500 animate-fadeIn delay-500">
        Built with cutting-edge microservices architecture, Kafka, Redis, and
        more.
      </p>
    </div>
  );
}

export default Home;
