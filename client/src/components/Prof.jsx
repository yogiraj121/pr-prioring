import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import "../styles/Prof.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function SettingsProfileForm() {
  const { user, updateUserContext, logout } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
            currentPassword: "",
            newPassword: "",
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

      // Only update password if password fields are filled
      if (formData.newPassword || formData.currentPassword) {
        if (!formData.currentPassword) {
          throw new Error("Current password is required");
        }
        if (!formData.newPassword) {
          throw new Error("New password is required");
        }
        if (formData.newPassword === formData.currentPassword) {
          throw new Error(
            "New password must be different from current password"
          );
        }

        // Update password with current password verification
        await authService.updatePassword({
          currentPassword: formData.currentPassword,
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

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));

      // Show different message if password was changed
      if (formData.newPassword) {
        toast.success("Profile updated successfully.");
        setTimeout(() => {
          logout();
        }, 3000);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error(
        err.message || "Invalid Crendentials . Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <ToastContainer position="top-right" autoClose={3000} />
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
              <label className="form-label">Current Password</label>
              <div className="input-container">
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter current password"
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
