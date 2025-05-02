import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  BarChart2,
  Package,
  Users,
  Settings,
  LogOut,
  User,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { BsCloudHaze2 } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close the profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const styles = {
    leftSidebar: {
      width: "85px",
      backgroundColor: "#ffffff",
      borderRight: "1px solid #e0e0e0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 0",
      height: "100vh",
      position: "fixed",
    },
    logoContainer: {
      marginBottom: "24px",
    },
    logo: {
      width: "32px",
      height: "32px",
      borderRadius: "6px",
      backgroundColor: "#0057b8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "18px",
    },
    navContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    navLink: {
      padding: "8px",
      color: "#666",
      background: "none",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textDecoration: "none",
    },
    activeNavLink: {
      color: "#0057b8",
      backgroundColor: "#e6f0ff",
    },
    profileContainer: {
      marginTop: "auto",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    profileButton: {
      padding: "8px",
      color: "#333",
      background: "none",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    avatar: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "#e0e7ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      color: "#333",
      marginBottom: "5px",
    },
    profileMenu: {
      position: "absolute",
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      width: "180px",
      backgroundColor: "white",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      borderRadius: "4px",
      padding: "8px 0",
      marginBottom: "12px",
      zIndex: 10,
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      padding: "8px 16px",
      color: "#333",
      textDecoration: "none",
      fontSize: "14px",
      width: "100%",
      textAlign: "left",
      border: "none",
      background: "none",
      cursor: "pointer",
    },
    menuItemRed: {
      color: "#d32f2f",
    },
    menuHeader: {
      padding: "8px 16px",
      borderBottom: "1px solid #eee",
      fontWeight: "bold",
      fontSize: "14px",
      color: "#333",
    },
    menuIcon: {
      marginRight: "12px",
    },
    menuArrow: {
      position: "absolute",
      bottom: "-10px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "0",
      height: "0",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: "10px solid white",
    },
    userInfo: {
      marginTop: "4px",
      fontSize: "12px",
      color: "#666",
      maxWidth: "65px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      textAlign: "center",
    },
  };

  const navItems = [
    { icon: <Home size={20} />, label: "Home", path: "/dashboard" },
    {
      icon: <MessageSquare size={20} />,
      label: "Messages",
      path: "/chat-center",
    },
    { icon: <BarChart2 size={20} />, label: "Analytics", path: "/analysis" },
    { icon: <Package size={20} />, label: "Products", path: "/chatbot-custom" },
    {
      icon: <Users size={20} />,
      label: "Team",
      path: "/team",
      visible: true,
    },
    { icon: <Settings size={20} />, label: "Settings", path: "/profile" },
  ];

  return (
    <div style={styles.leftSidebar}>
      <div style={styles.logoContainer}>
        <BsCloudHaze2 size={40} />
      </div>

      <nav style={styles.navContainer}>
        {navItems
          .filter((item) => item.visible !== false)
          .map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              title={item.label}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeNavLink : {}),
              })}
            >
              {item.icon}
            </NavLink>
          ))}
      </nav>

      <div style={styles.profileContainer} ref={menuRef}>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={styles.profileButton}
          title={user?.name || "Profile"}
        >
          <div style={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          {showProfileMenu ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {showProfileMenu && (
          <div style={styles.profileMenu}>
            <div style={styles.menuHeader}>
              {user?.name || "User"} {user?.role === "admin" ? "(Admin)" : ""}
            </div>
            <NavLink to="/profile" style={styles.menuItem}>
              <User size={16} style={styles.menuIcon} />
              Profile Settings
            </NavLink>
            <button
              onClick={handleLogout}
              style={{ ...styles.menuItem, ...styles.menuItemRed }}
            >
              <LogOut size={16} style={styles.menuIcon} />
              Logout
            </button>
            <div style={styles.menuArrow}></div>
          </div>
        )}
      </div>
    </div>
  );
}
