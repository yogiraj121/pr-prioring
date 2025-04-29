import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Prof.css";

export default function SettingsProfileForm() {
  const { user, updateUserContext, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await authService.getProfile();
        console.log("Fetched user data:", userData);

        if (userData) {
          setFormData({
            firstName:
              userData.firstName ||
              userData.firstname ||
              (userData.name && userData.name.split(" ")[0]) ||
              "",
            lastName:
              userData.lastName ||
              userData.lastname ||
              (userData.name && userData.name.split(" ").slice(1).join(" ")) ||
              "",
            email: userData.email || user?.email || "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      } catch (err) {
        console.error("Error in fetchUserData:", err);
        setError(
          "Failed to fetch user data: " + (err.message || "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      // Only update password if both fields are filled
      if (formData.newPassword && formData.confirmPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await authService.updatePassword({
          newPassword: formData.newPassword,
        });
      }

      const updatedUser = await authService.updateProfile(updateData);
      console.log("Updated user data:", updatedUser);

      // Update the auth context with the new user data
      if (updateUserContext) {
        updateUserContext({
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
        });
      }

      // Store updated user in localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
        })
      );

      setSuccess("Profile updated successfully");

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));

      // Show different message if password was changed
      if (formData.newPassword && formData.confirmPassword) {
        setSuccess(
          "Password updated successfully. All team members' passwords have been updated to match."
        );
      }

      setTimeout(() => {
        logout();
      }, 1000);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="sidebar-container">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">Settings</h1>
        </div>

        {/* Form Section */}
        <div className="form-section">
          {/* Tabs */}
          <div className="tabs">
            <div className="active-tab">Edit Profile</div>
          </div>

          {/* Error and Success Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">First name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-container">
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="form-group with-tooltip">
              <label className="form-label">Confirm New Password</label>
              <div className="input-container">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm new password"
                />
                <div
                  className="tooltip-icon"
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#999">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>

                  {tooltipVisible && (
                    <div className="tooltip-content">
                      User will be logged out immediately after password change
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="button-container">
              <button type="submit" disabled={loading} className="save-button">
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
