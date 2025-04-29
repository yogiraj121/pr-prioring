import React, { createContext, useState, useContext, useEffect } from "react";

const ChatCustomizationContext = createContext();

const defaultSettings = {
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

export const ChatCustomizationProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("chatbotSettings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const updateSettings = (newSettings) => {
    // Update state
    setSettings(newSettings);

    // Save to localStorage
    localStorage.setItem("chatbotSettings", JSON.stringify(newSettings));

    // Dispatch event with a small delay to ensure state is updated
    setTimeout(() => {
      const event = new CustomEvent("chatSettingsUpdated", {
        detail: newSettings,
      });
      window.dispatchEvent(event);
    }, 0);

    return true;
  };

  // Listen for settings updates from other components
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      setSettings(event.detail);
    };

    window.addEventListener("chatSettingsUpdated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("chatSettingsUpdated", handleSettingsUpdate);
    };
  }, []);

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
