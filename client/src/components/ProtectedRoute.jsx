import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f7",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #1a73e8",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "16px",
          }}
        />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
          `}
        </style>
        <p style={{ color: "#333", fontFamily: "Arial, sans-serif" }}>
          Loading your account...
        </p>
      </div>
    );
  }

  // 🛑 Real protection:
  if (!isAuthenticated || !user || Object.keys(user).length === 0) {
    // Not logged in properly
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🛑 Important: If authenticated but from "/" or token is fake
  if (location.pathname === "/") {
    return <Navigate to="/login" replace />;
  }

  // ✅ If authenticated, user exists, and not at "/", allow
  return children;
};

export default ProtectedRoute;
