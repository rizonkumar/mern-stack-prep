import React, { useState, useEffect } from "react";
import apiClient from "../api/axiosConfig";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/users/profile");
        setUser(response.data.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err.response?.data?.message || "Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
        <p className="text-sm mt-2">Please ensure you are logged in.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-8 text-gray-600">
        <p>No user data found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        User Profile
      </h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <span className="font-semibold text-gray-700 w-24">Name:</span>
          <span className="text-gray-800">{user.name}</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-gray-700 w-24">Email:</span>
          <span className="text-gray-800">{user.email}</span>
        </div>
        {user.role && (
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 w-24">Role:</span>
            <span className="text-blue-600 font-medium capitalize">
              {user.role}
            </span>
          </div>
        )}
        {user.createdAt && (
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 w-24">Joined:</span>
            <span className="text-gray-600">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
