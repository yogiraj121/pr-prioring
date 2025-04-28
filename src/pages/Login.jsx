import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import employee from "../assets/employee.png";
import logo from "../assets/logo.png";
const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Check if user came from registration page
    const fromRegistration = location.state?.fromRegistration;
    const registeredEmail = location.state?.email;

    if (fromRegistration) {
      setSuccessMessage(
        "Account created successfully ! Please log in with your new account."
      );

      // Pre-fill the email if it was passed from signup
      if (registeredEmail) {
        setEmail(registeredEmail);
      }
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      console.log("Attempting login with:", { email, password });
      const response = await authService.login(email, password);
      console.log("Login response:", response.data);

      // Use the context login function to store token and user data
      login(response.data.user, response.data.token);

      // Redirect to intended destination or dashboard
      const intendedPath = location.state?.from || "/dashboard";
      navigate(intendedPath);
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
      <div className="login-form-content">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-icon" />
          
        </div>

        <h1 className="form-title">Sign in</h1>
        <p className="form-subtitle">
          Sign in as an admin or team member to access the ticket system
        </p>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="signup-link">
          Don't have an account?{" "}
          <button onClick={() => navigate("/signup")} className="bold-link">
            Sign up as admin
          </button>
        </div>

        <div className="terms">
          This is an internal ticketing system for authorized users only.
        </div>
      
      </div></div>

      <div className="image-container">
        <img
          src={employee}
          alt="Person working at computer with charts"
          className="login-image"
        />
      </div>
    </div>
  );
};

export default LoginComponent;
