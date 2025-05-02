import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
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
            }
          `}
        </style>
        <p style={{ color: "#333", fontFamily: "Arial, sans-serif" }}>
          Loading...
        </p>
      </div>
    );
  }

  // Allow access to all public routes, including landing page
  return children;
};

export default PublicRoute;
