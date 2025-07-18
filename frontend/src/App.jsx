import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";

import "./index.css";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header /> {/* Header will be present on all pages */}
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />{" "}
            {/* Protected route, will add logic later */}
            <Route path="/products" element={<ProductList />} />{" "}
            {/* Will create */}
            <Route path="/cart" element={<Cart />} /> {/* Will create */}
            <Route path="*" element={<NotFound />} />{" "}
            {/* Catch-all for unknown routes */}
          </Routes>
        </main>
        {/* You could add a Footer component here */}
      </div>
    </Router>
  );
}

export default App;
