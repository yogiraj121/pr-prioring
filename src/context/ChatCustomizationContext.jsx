import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

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
    try {
      const savedSettings = localStorage.getItem("chatbotSettings");
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error("Error loading settings:", error);
      return defaultSettings;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized update function to prevent unnecessary re-renders
  const updateSettings = useCallback((newSettings) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update state
      setSettings(newSettings);

      // Save to localStorage
      localStorage.setItem("chatbotSettings", JSON.stringify(newSettings));

      // Dispatch event immediately
      const event = new CustomEvent("chatSettingsUpdated", {
        detail: newSettings,
      });
      window.dispatchEvent(event);

      return true;
    } catch (error) {
      setError("Failed to update settings");
      console.error("Error updating settings:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    updateSettings(defaultSettings);
  }, [updateSettings]);

  // Listen for settings updates from other components
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      try {
        if (event.detail) {
          setSettings(event.detail);
          localStorage.setItem("chatbotSettings", JSON.stringify(event.detail));
        }
      } catch (error) {
        console.error("Error handling settings update:", error);
      }
    };

    window.addEventListener("chatSettingsUpdated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("chatSettingsUpdated", handleSettingsUpdate);
    };
  }, []);

  // Sync settings across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "chatbotSettings") {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettings(newSettings);
        } catch (error) {
          console.error("Error syncing settings:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const value = {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    error,
  };

  return (
    <ChatCustomizationContext.Provider value={value}>
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
