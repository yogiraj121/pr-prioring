import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";
import employee from "../../public/images/employee.png";
import logo from "../../public/images/logo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      console.log("Attempting login with:", { email, password });
      const response = await authService.login(email, password);
      toast.success("Login successful");
      console.log("Login response:", response.data);
      login(response.data.user, response.data.token);

      setTimeout(() => {
        const intendedPath = location.state?.from || "/dashboard";
      navigate(intendedPath);
      }, 2000);
      
      
    
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      toast.error(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
       <ToastContainer position="top-right" autoClose={3000} />
      <div className="login-form">
      <div className="login-form-content">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-icon" />
          
        </div>

        <h1 className="form-title">Sign in to your Plexify</h1>
        

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
            Sign up 
          </button>
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
