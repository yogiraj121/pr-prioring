import React, { useState, useEffect } from "react";
import { useChatCustomization } from "../context/ChatCustomizationContext";
import { saveChatSettings, getChatSettings } from "../services/api";
import { Send, X, Edit2 } from "lucide-react";
import Sidebar from "./Sidebar";

const ChatBotCustomization = () => {
  const { settings, updateSettings } = useChatCustomization();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings from backend when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const savedSettings = await getChatSettings();
        if (savedSettings) {
          setLocalSettings(savedSettings);
          updateSettings(savedSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setError("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update local settings when context settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleColorChange = (type, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleMessageChange = (type, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleCustomMessageChange = (index, value) => {
    setLocalSettings((prev) => {
      const newMessages = [...prev.customMessages];
      newMessages[index] = value;
      return {
        ...prev,
        customMessages: newMessages,
      };
    });
  };

  const handleAddCustomMessage = () => {
    setLocalSettings((prev) => ({
      ...prev,
      customMessages: [...prev.customMessages, ""],
    }));
  };

  const handleRemoveCustomMessage = (index) => {
    setLocalSettings((prev) => {
      const newMessages = [...prev.customMessages];
      newMessages.splice(index, 1);
      return {
        ...prev,
        customMessages: newMessages,
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      setIsLoading(true);
      await saveChatSettings(localSettings);
      updateSettings(localSettings);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
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
      await saveChatSettings(defaultSettings);
      setLocalSettings(defaultSettings);
      updateSettings(defaultSettings);
      setSuccess("Settings reset successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error resetting settings:", error);
      setError("Failed to reset settings");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      overflowY: "auto",
    },
    sidebar: {
      width: "85px",
    },
    activeIcon: {
      backgroundColor: "#e9e9e9",
      color: "#1e88e5",
    },
    content: {
      flex: 1,
      display: "flex",
    },
    chatPreview: {
      flex: 1,
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    customizationPanel: {
      width: "400px",
      marginLeft: "20px",
      marginRight: "80px",
      backgroundColor: "#fff",
      marginBottom: "80px",
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#333",
    },
    optionSection: {
      marginBottom: "30px",
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      marginBottom: "15px",
      color: "#333",
    },
    colorOptions: {
      display: "flex",
      gap: "10px",
      marginBottom: "10px",
    },
    colorCircle: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      cursor: "pointer",
      border: "2px solid transparent",
    },
    colorCircleSelected: {
      border: "2px solid #333",
    },
    colorInput: {
      padding: "8px",
      width: "100%",
      maxWidth: "120px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      marginTop: "10px",
    },
    customMessage: {
      backgroundColor: "#f5f5f5",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    messageText: {
      flex: 1,
    },
    editButton: {
      border: "none",
      background: "none",
      cursor: "pointer",
      color: "#555",
      padding: "5px",
    },
    formField: {
      marginBottom: "15px",
    },
    formLabel: {
      display: "block",
      fontSize: "14px",
      color: "#666",
      marginBottom: "5px",
    },
    formInput: {
      width: "95%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
    },
    button: {
      backgroundColor: "#1e4d7b",
      color: "white",
      border: "none",
      padding: "12px 20px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
      width: "100%",
    },
    chatContainer: {
      width: "300px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      overflow: "hidden",
      backgroundColor: "#fff",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    chatHeader: {
      backgroundColor: localSettings.headerColor,
      color: "#fff",
      padding: "15px",
      display: "flex",
      alignItems: "center",
    },
    chatBody: {
      backgroundColor: localSettings.backgroundColor,
      padding: "15px",
      height: "450px",
      display: "flex",
      flexDirection: "column",
    },
    introFormContainer: {
      backgroundColor: "#fff",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "15px",
      width: "80%",
      height: "100%",
    },
    chatInput: {
      width: "100%",
      display: "flex",
      borderTop: "1px solid #ddd",
      padding: "10px",
    },
    chatInputField: {
      width: "80%",
      border: "none",
      outline: "none",
      padding: "5px",
      fontSize: "14px",
      color: "#999",
    },
    sendButton: {
      background: "none",
      border: "none",
      color: "#1e88e5",
      cursor: "pointer",
    },
    welcomeMessageContainer: {
      display: "flex",
      backgroundColor: "#fff",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "10px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    welcomeMessageText: {
      flex: 1,
      fontSize: "14px",
    },
    welcomeMessageDate: {
      fontSize: "12px",
      color: "#999",
    },
    timerContainer: {
      display: "flex",
      gap: "5px",
      marginBottom: "10px",
    },
    timerInput: {
      width: "50px",
      padding: "8px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      textAlign: "center",
    },
    timerSeparator: {
      alignSelf: "center",
      fontSize: "20px",
      color: "#999",
    },
    saveButton: {
      backgroundColor: "#1e4d7b",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
      marginTop: "20px",
      alignSelf: "flex-end",
    },
    saveButtonContainer: {
      display: "flex",
      justifyContent: "flex-end",
    },
    savedStatus: {
      color: "#4caf50",
      marginRight: "10px",
      alignSelf: "center",
    },
    errorStatus: {
      color: "#f44336",
      marginRight: "10px",
      alignSelf: "center",
    },
    successMessage: {
      position: "absolute",
      top: "15px",
      right: "15px",
      color: "#4caf50",
      marginRight: "20px",
      alignSelf: "center",
      backgroundColor: "#ffff",
      padding: "10px",
      borderRadius: "5px",
      fontSize: "20px",
    },
    errorMessage: {
      position: "absolute",
      top: "10px",
      right: "10px",
      color: "#f44336",
      marginRight: "20px",
      backgroundColor: "#ffff",
      padding: "10px",
      borderRadius: "5px",
    },
  };

  return (
    <div className="customization-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {error && <div style={styles.errorMessage}>{error}</div>}

      {success && <div style={styles.successMessage}>{success}</div>}

      <div style={styles.container}>
        <div style={styles.sidebar}>
          <Sidebar />
        </div>

        <div style={styles.content}>
          <div style={styles.chatPreview}>
            <div style={styles.chatContainer}>
              {/* Chat Header */}
              <div style={styles.chatHeader}>
                <div style={styles.chatAvatar}>H</div>
                <div>Hubly</div>
              </div>

              {/* Chat Body */}
              <div style={styles.chatBody}>
                {/* Custom Messages */}
                <div>
                  {localSettings.customMessages.map((message, index) => (
                    <div key={index} style={styles.customMessage}>
                      <div style={styles.messageText}>{message}</div>
                    </div>
                  ))}
                </div>

                {/* Intro Form */}
                <div style={styles.introFormContainer}>
                  <div style={styles.sectionTitle}>Introduction Yourself</div>
                  <div style={styles.formField}>
                    <div style={styles.formLabel}>Your name</div>
                    <input
                      type="text"
                      value={localSettings.introForm.name}
                      style={styles.formInput}
                      readOnly
                    />
                  </div>
                  <div style={styles.formField}>
                    <div style={styles.formLabel}>Your Phone</div>
                    <input
                      type="text"
                      value={localSettings.introForm.phone}
                      style={styles.formInput}
                      readOnly
                    />
                  </div>
                  <div style={styles.formField}>
                    <div style={styles.formLabel}>Your Email</div>
                    <input
                      type="text"
                      value={localSettings.introForm.email}
                      style={styles.formInput}
                      readOnly
                    />
                  </div>
                  <button style={styles.button}>Thank You!</button>
                </div>
              </div>

              {/* Chat Input */}
              <div style={styles.chatInput}>
                <input
                  style={styles.chatInputField}
                  placeholder="Write a message"
                  readOnly
                />
                <button style={styles.sendButton}>
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Welcome Message Preview */}
            <div style={{ marginTop: "30px", width: "300px" }}>
              <div style={styles.welcomeMessageContainer}>
                <div style={styles.chatAvatar}>H</div>
                <div style={{ marginLeft: "10px", flex: 1 }}>
                  <div style={styles.welcomeMessageText}>
                    {localSettings.welcomeMessage}
                  </div>
                </div>
                <div style={styles.welcomeMessageDate}>
                  <X size={16} />
                </div>
              </div>
            </div>
          </div>

          <div style={styles.customizationPanel}>
            <h2 style={styles.title}>Chat Bot</h2>

            {/* Header Color */}
            <div style={styles.optionSection}>
              <h3 style={styles.sectionTitle}>Header Color</h3>
              <div style={styles.colorOptions}>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#FFFFFF",
                    ...(localSettings.headerColor === "#FFFFFF"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() => handleColorChange("headerColor", "#FFFFFF")}
                ></div>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#000000",
                    ...(localSettings.headerColor === "#000000"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() => handleColorChange("headerColor", "#000000")}
                ></div>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#33475B",
                    ...(localSettings.headerColor === "#33475B"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() => handleColorChange("headerColor", "#33475B")}
                ></div>
              </div>
              <input
                type="text"
                value={localSettings.headerColor}
                onChange={(e) =>
                  handleColorChange("headerColor", e.target.value)
                }
                onBlur={() =>
                  handleColorChange("headerColor", localSettings.headerColor)
                }
                style={styles.colorInput}
              />
            </div>

            {/* Background Color */}
            <div style={styles.optionSection}>
              <h3 style={styles.sectionTitle}>Custom Background Color</h3>
              <div style={styles.colorOptions}>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#FFFFFF",
                    ...(localSettings.backgroundColor === "#FFFFFF"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() =>
                    handleColorChange("backgroundColor", "#FFFFFF")
                  }
                ></div>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#000000",
                    ...(localSettings.backgroundColor === "#000000"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() =>
                    handleColorChange("backgroundColor", "#000000")
                  }
                ></div>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#EEEEEE",
                    ...(localSettings.backgroundColor === "#EEEEEE"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() =>
                    handleColorChange("backgroundColor", "#EEEEEE")
                  }
                ></div>
              </div>
              <input
                type="text"
                value={localSettings.backgroundColor}
                onChange={(e) =>
                  handleColorChange("backgroundColor", e.target.value)
                }
                onBlur={() =>
                  handleColorChange(
                    "backgroundColor",
                    localSettings.backgroundColor
                  )
                }
                style={styles.colorInput}
              />
            </div>

            {/* Custom Messages */}
            <div style={styles.optionSection}>
              <h3 style={styles.sectionTitle}>Customize Message</h3>
              {localSettings.customMessages.map((message, index) => (
                <div key={index} style={styles.customMessage}>
                  <div style={styles.messageText}>{message}</div>
                  <button
                    style={styles.editButton}
                    onClick={() => handleCustomMessageChange(index, "")}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              ))}

              {isEditing &&
                localSettings.customMessages.map((message, index) => (
                  <div key={index} style={styles.customMessage}>
                    <div style={styles.messageText}>{message}</div>
                    <button
                      style={styles.editButton}
                      onClick={() => handleCustomMessageChange(index, "")}
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                ))}
            </div>

            {/* Welcome Message */}
            <div style={styles.optionSection}>
              <h3 style={styles.sectionTitle}>Welcome Message</h3>
              <div style={styles.customMessage}>
                <div style={styles.messageText}>
                  {localSettings.welcomeMessage}
                </div>
                <button
                  style={styles.editButton}
                  onClick={() => handleMessageChange("welcomeMessage", "")}
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {isEditing && localSettings.welcomeMessage !== "" && (
                <div style={{ marginTop: "10px" }}>
                  <input
                    type="text"
                    value={localSettings.welcomeMessage}
                    onChange={(e) =>
                      handleMessageChange("welcomeMessage", e.target.value)
                    }
                    style={{ ...styles.formInput, marginBottom: "10px" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        handleMessageChange("welcomeMessage", "");
                      }}
                      style={{
                        padding: "8px 15px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      style={{
                        padding: "8px 15px",
                        borderRadius: "4px",
                        backgroundColor: "#1e4d7b",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Intro Form Fields */}
            <div style={styles.optionSection}>
              <h3 style={styles.sectionTitle}>Intro Form Fields</h3>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Name Field Label</label>
                <input
                  type="text"
                  value={localSettings.introForm.name}
                  onChange={(e) =>
                    handleMessageChange("introForm", {
                      ...localSettings.introForm,
                      name: e.target.value,
                    })
                  }
                  style={styles.formInput}
                  placeholder="Enter name field label"
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Phone Field Label</label>
                <input
                  type="text"
                  value={localSettings.introForm.phone}
                  onChange={(e) =>
                    handleMessageChange("introForm", {
                      ...localSettings.introForm,
                      phone: e.target.value,
                    })
                  }
                  style={styles.formInput}
                  placeholder="Enter phone field label"
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Email Field Label</label>
                <input
                  type="text"
                  value={localSettings.introForm.email}
                  onChange={(e) =>
                    handleMessageChange("introForm", {
                      ...localSettings.introForm,
                      email: e.target.value,
                    })
                  }
                  style={styles.formInput}
                  placeholder="Enter email field label"
                />
              </div>
            </div>

            {/* Timer Settings */}
            <div style={styles.optionSection}>
              <h3 style={styles.sectionTitle}>Missed Chat Timer</h3>
              <div style={styles.timerContainer}>
                <input
                  type="text"
                  value={localSettings.missedChatTimer.hours}
                  onChange={(e) =>
                    handleMessageChange("missedChatTimer", {
                      ...localSettings.missedChatTimer,
                      hours: e.target.value,
                    })
                  }
                  style={styles.timerInput}
                  placeholder="HH"
                />
                <span style={styles.timerSeparator}>:</span>
                <input
                  type="text"
                  value={localSettings.missedChatTimer.minutes}
                  onChange={(e) =>
                    handleMessageChange("missedChatTimer", {
                      ...localSettings.missedChatTimer,
                      minutes: e.target.value,
                    })
                  }
                  style={styles.timerInput}
                  placeholder="MM"
                />
                <span style={styles.timerSeparator}>:</span>
                <input
                  type="text"
                  value={localSettings.missedChatTimer.seconds}
                  onChange={(e) =>
                    handleMessageChange("missedChatTimer", {
                      ...localSettings.missedChatTimer,
                      seconds: e.target.value,
                    })
                  }
                  style={styles.timerInput}
                  placeholder="SS"
                />
              </div>
            </div>

            {/* Save Button */}
            <div style={styles.saveButtonContainer}>
              <button style={styles.saveButton} onClick={handleSave}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotCustomization;
