import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ChatCustomizationContext = createContext();

export const ChatCustomizationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState(() => {
    // Try to get settings from localStorage first
    const savedSettings = localStorage.getItem("chatSettings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    // Default settings if nothing in localStorage
    return {
      headerColor: "#33475B",
      backgroundColor: "#FFFFFF",
      welcomeMessage:
        "👋 Want to chat about Hubly? I'm a chatbot here to help you find your way.",
      customMessages: ["How can I help you?", "Ask me anything!"],
      introForm: {
        name: "Your name",
        phone: "+1 (000) 000-0000",
        email: "example@gmail.com",
      },
      missedChatTimer: {
        hours: "12",
        minutes: "00",
        seconds: "00",
      },
    };
  });

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      const newSettings = event.detail;
      // Update both state and localStorage
      setSettings(newSettings);
      localStorage.setItem("chatSettings", JSON.stringify(newSettings));
    };

    window.addEventListener("chatSettingsUpdated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("chatSettingsUpdated", handleSettingsUpdate);
    };
  }, []);

  // Fetch settings from server only when authenticated
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated || !user?.workspace) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const response = await fetch(
          `https://ticket-system-yogiraj.onrender.com/api/chatbot/settings?workspace=${user.workspace}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          localStorage.setItem("chatSettings", JSON.stringify(data));
          // Dispatch event for real-time updates
          window.dispatchEvent(
            new CustomEvent("chatSettingsUpdated", { detail: data })
          );
        }
      } catch (error) {
        console.error("Error fetching chat settings:", error);
      }
    };

    fetchSettings();
  }, [isAuthenticated, user?.workspace]);

  const updateSettings = async (newSettings) => {
    if (!isAuthenticated || !user?.workspace) {
      console.warn(
        "Cannot update settings: User not authenticated or no workspace"
      );
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return false;
      }

      const response = await fetch(
        `https://ticket-system-yogiraj.onrender.com/api/chatbot/settings?workspace=${user.workspace}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newSettings),
        }
      );

      if (response.ok) {
        // Update both state and localStorage
        setSettings(newSettings);
        localStorage.setItem("chatSettings", JSON.stringify(newSettings));
        // Dispatch event for real-time updates
        window.dispatchEvent(
          new CustomEvent("chatSettingsUpdated", { detail: newSettings })
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating chat settings:", error);
      return false;
    }
  };

  return (
    <ChatCustomizationContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ChatCustomizationContext.Provider>
  );
};

export const useChatCustomization = () => {
  const context = useContext(ChatCustomizationContext);
  if (!context) {
    throw new Error(
      "useChatCustomization must be used within a ChatCustomizationProvider"
    );
  }
  return context;
};
