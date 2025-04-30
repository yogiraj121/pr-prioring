import React, { useState, useEffect } from "react";
import { useChatCustomization } from "../context/ChatCustomizationContext";
import { Send, X, Edit2 } from "lucide-react";
import Sidebar from "./Sidebar";

const ChatBotCustomization = () => {
  const { settings, updateSettings, isLoading, error } = useChatCustomization();
  const {
    headerColor,
    backgroundColor,
    welcomeMessage,
    customMessages,
    introForm,
    missedChatTimer,
  } = settings;

  const [headerColorHex, setHeaderColorHex] = useState(headerColor);
  const [backgroundColorHex, setBackgroundColorHex] = useState(backgroundColor);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [tempMessage, setTempMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Handle success/error messages
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleEditMessage = (index) => {
    setEditingMessage(index);
    setTempMessage(settings.customMessages[index]);
  };

  const handleUpdateMessage = (index) => {
    const updatedMessages = [...settings.customMessages];
    updatedMessages[index] = tempMessage;

    const success = updateSettings({
      ...settings,
      customMessages: updatedMessages,
    });

    if (success) {
      setShowSuccess(true);
    } else {
      setShowError(true);
    }

    setEditingMessage(null);
    setTempMessage("");
  };

  const handleEditWelcomeMessage = () => {
    setIsEditing(true);
    setEditingMessage("welcome");
    setTempMessage(welcomeMessage);
  };

  const handleUpdateWelcomeMessage = () => {
    const success = updateSettings({
      ...settings,
      welcomeMessage: tempMessage,
    });

    if (success) {
      setShowSuccess(true);
    } else {
      setShowError(true);
    }
    setIsEditing(false);
    setEditingMessage(null);
  };

  const handleHeaderColorChange = (color) => {
    setHeaderColorHex(color);
    const success = updateSettings({
      ...settings,
      headerColor: color,
    });

    if (success) {
      setShowSuccess(true);
    } else {
      setShowError(true);
    }
  };

  const handleBackgroundColorChange = (color) => {
    setBackgroundColorHex(color);
    const success = updateSettings({
      ...settings,
      backgroundColor: color,
    });

    if (success) {
      setShowSuccess(true);
    } else {
      setShowError(true);
    }
  };

  const handleSaveSettings = () => {
    const success = updateSettings(settings);
    if (success) {
      setShowSuccess(true);
    } else {
      setShowError(true);
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
      backgroundColor: headerColor,
      color: "#fff",
      padding: "15px",
      display: "flex",
      alignItems: "center",
    },
    chatBody: {
      backgroundColor: backgroundColor,
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
      top: "10px",
      right: "10px",
      color: "#4caf50",
      marginRight: "20px",
      alignSelf: "center",
      backgroundColor: "#ffff",
      padding: "10px",
      borderRadius: "5px",
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

      {showSuccess && (
        <div style={styles.successMessage}>Settings saved successfully!</div>
      )}

      {showError && (
        <div style={styles.errorMessage}>
          Failed to save settings. Please try again.
        </div>
      )}

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
                  {customMessages.map((message, index) => (
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
                      value={introForm.name}
                      style={styles.formInput}
                      readOnly
                    />
                  </div>
                  <div style={styles.formField}>
                    <div style={styles.formLabel}>Your Phone</div>
                    <input
                      type="text"
                      value={introForm.phone}
                      style={styles.formInput}
                      readOnly
                    />
                  </div>
                  <div style={styles.formField}>
                    <div style={styles.formLabel}>Your Email</div>
                    <input
                      type="text"
                      value={introForm.email}
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
                  <div style={styles.welcomeMessageText}>{welcomeMessage}</div>
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
                    ...(headerColor === "#FFFFFF"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() => handleHeaderColorChange("#FFFFFF")}
                ></div>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#000000",
                    ...(headerColor === "#000000"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() => handleHeaderColorChange("#000000")}
                ></div>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#33475B",
                    ...(headerColor === "#33475B"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() => handleHeaderColorChange("#33475B")}
                ></div>
              </div>
              <input
                type="text"
                value={headerColorHex}
                onChange={(e) => setHeaderColorHex(e.target.value)}
                onBlur={() => handleHeaderColorChange(headerColorHex)}
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
                    ...(backgroundColor === "#FFFFFF"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() => handleBackgroundColorChange("#FFFFFF")}
                ></div>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#000000",
                    ...(backgroundColor === "#000000"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() => handleBackgroundColorChange("#000000")}
                ></div>
                <div
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: "#EEEEEE",
                    ...(backgroundColor === "#EEEEEE"
                      ? styles.colorCircleSelected
                      : {}),
                  }}
                  onClick={() => handleBackgroundColorChange("#EEEEEE")}
                ></div>
              </div>
              <input
                type="text"
                value={backgroundColorHex}
                onChange={(e) => setBackgroundColorHex(e.target.value)}
                onBlur={() => handleBackgroundColorChange(backgroundColorHex)}
                style={styles.colorInput}
              />
            </div>

            {/* Custom Messages */}
            <div style={styles.optionSection}>
              <h3 style={styles.sectionTitle}>Customize Message</h3>
              {customMessages.map((message, index) => (
                <div key={index} style={styles.customMessage}>
                  <div style={styles.messageText}>{message}</div>
                  <button
                    style={styles.editButton}
                    onClick={() => handleEditMessage(index)}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              ))}

              {isEditing &&
                editingMessage !== null &&
                editingMessage !== "welcome" && (
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="text"
                      value={tempMessage}
                      onChange={(e) => setTempMessage(e.target.value)}
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
                          setEditingMessage(null);
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
                        onClick={handleUpdateMessage}
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

            {/* Welcome Message */}
            <div style={styles.optionSection}>
              <h3 style={styles.sectionTitle}>Welcome Message</h3>
              <div style={styles.customMessage}>
                <div style={styles.messageText}>{welcomeMessage}</div>
                <button
                  style={styles.editButton}
                  onClick={handleEditWelcomeMessage}
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {isEditing && editingMessage === "welcome" && (
                <div style={{ marginTop: "10px" }}>
                  <input
                    type="text"
                    value={tempMessage}
                    onChange={(e) => setTempMessage(e.target.value)}
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
                        setEditingMessage(null);
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
                      onClick={handleUpdateWelcomeMessage}
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
                  value={introForm.name}
                  onChange={(e) =>
                    updateSettings({ ...introForm, name: e.target.value })
                  }
                  style={styles.formInput}
                  placeholder="Enter name field label"
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Phone Field Label</label>
                <input
                  type="text"
                  value={introForm.phone}
                  onChange={(e) =>
                    updateSettings({ ...introForm, phone: e.target.value })
                  }
                  style={styles.formInput}
                  placeholder="Enter phone field label"
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Email Field Label</label>
                <input
                  type="text"
                  value={introForm.email}
                  onChange={(e) =>
                    updateSettings({ ...introForm, email: e.target.value })
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
                  value={missedChatTimer.hours}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      missedChatTimer: {
                        ...missedChatTimer,
                        hours: e.target.value,
                      },
                    })
                  }
                  style={styles.timerInput}
                  placeholder="HH"
                />
                <span style={styles.timerSeparator}>:</span>
                <input
                  type="text"
                  value={missedChatTimer.minutes}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      missedChatTimer: {
                        ...missedChatTimer,
                        minutes: e.target.value,
                      },
                    })
                  }
                  style={styles.timerInput}
                  placeholder="MM"
                />
                <span style={styles.timerSeparator}>:</span>
                <input
                  type="text"
                  value={missedChatTimer.seconds}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      missedChatTimer: {
                        ...missedChatTimer,
                        seconds: e.target.value,
                      },
                    })
                  }
                  style={styles.timerInput}
                  placeholder="SS"
                />
              </div>
            </div>

            {/* Save Button */}
            <div style={styles.saveButtonContainer}>
              <button style={styles.saveButton} onClick={handleSaveSettings}>
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
