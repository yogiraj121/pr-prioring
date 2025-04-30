import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Signup.css";
import logo from "../../public/images/logo.png";
import employee from "../../public/images/employee.png";
import toast from "react-hot-toast";
const SignupComponent = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Attempting to register with:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        passwordLength: formData.password.length,
        role: "admin",
      });

      // Register as admin by default
      const response = await authService.register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        "admin" // Always set the role to admin for signup
      );

      console.log("Registration successful:", response.data);

      // Navigate to login page with success message flag and email
      navigate("/login", {
        state: {
          fromRegistration: true,
          email: formData.email,
        },
      });
    } catch (err) {
      console.error("Registration error - full error:", err);
      console.error("Error response data:", err.response?.data);
      console.error("Error status:", err.response?.status);

      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="form-section">
        <div className="form-content">
          <div className="logo">
            <img src={logo} alt="Logo" className="logo-icon" />
          </div>

          <span>
            <h1 className="form-title">
              Create an account{" "}
              <span className="login-link">
                <button
                  onClick={() => navigate("/login")}
                  className="bold-link"
                >
                  Sign in instead
                </button>
              </span>
            </h1>
          </span>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <span>
                <input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)} required/>

                <label className="form-label-checkbox" >
                  By creating an account, you agree to the terms and conditions
                </label>
              </span>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>

      <div className="image-container">
        <img src={employee} alt="Signup" className="signup-image" />
      </div>
    </div>
  );
};

export default SignupComponent;
