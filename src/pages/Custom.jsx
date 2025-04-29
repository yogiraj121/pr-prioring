import { useState } from "react";
import { useChatCustomization } from "../context/ChatCustomizationContext";
import { saveChatSettings } from "../services/api";
import { Send, X, Edit2 } from "lucide-react";
import Sidebar from "./Sidebar";

function ChatBotCustomization() {
  const { settings, updateSettings } = useChatCustomization();
  const [headerColor, setHeaderColor] = useState(
    settings?.headerColor || "#33475B"
  );
  const [headerColorHex, setHeaderColorHex] = useState(
    settings?.headerColor || "#33475B"
  );
  const [backgroundColor, setBackgroundColor] = useState(
    settings?.backgroundColor || "#FFFFFF"
  );
  const [backgroundColorHex, setBackgroundColorHex] = useState(
    settings?.backgroundColor || "#FFFFFF"
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    settings?.welcomeMessage ||
      "👋 Want to chat about Hubly? I'm a chatbot here to help you find your way."
  );
  const [customMessages, setCustomMessages] = useState(
    settings?.customMessages || ["How can I help you?", "Ask me anything!"]
  );
  const [introForm, setIntroForm] = useState(
    settings?.introForm || {
      name: "Your name",
      phone: "+1 (000) 000-0000",
      email: "example@gmail.com",
    }
  );
  const [missedChatTimer, setMissedChatTimer] = useState(
    settings?.missedChatTimer || {
      hours: "12",
      minutes: "00",
      seconds: "00",
    }
  );
  const [editingMessage, setEditingMessage] = useState(null);
  const [tempMessage, setTempMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savedStatus, setSavedStatus] = useState("");

  const updateLocalSettings = (newSettings) => {
    updateSettings(newSettings);
    setSavedStatus("Settings updated!");
    setTimeout(() => setSavedStatus(""), 3000);
  };

  const handleEditMessage = (index) => {
    setEditingMessage(index);
    setTempMessage(customMessages[index]);
    setIsEditing(true);
  };

  const handleUpdateMessage = () => {
    if (editingMessage !== null && tempMessage.trim() !== "") {
      const updatedMessages = [...customMessages];
      updatedMessages[editingMessage] = tempMessage;
      setCustomMessages(updatedMessages);
      setEditingMessage(null);
      setTempMessage("");
      setIsEditing(false);

      updateLocalSettings({
        headerColor,
        backgroundColor,
        welcomeMessage,
        customMessages: updatedMessages,
        introForm,
        missedChatTimer,
      });
    }
  };

  const handleEditWelcomeMessage = () => {
    setTempMessage(welcomeMessage);
    setIsEditing(true);
    setEditingMessage("welcome");
  };

  const handleUpdateWelcomeMessage = () => {
    if (tempMessage.trim() !== "") {
      setWelcomeMessage(tempMessage);
      setEditingMessage(null);
      setTempMessage("");
      setIsEditing(false);

      updateLocalSettings({
        headerColor,
        backgroundColor,
        welcomeMessage: tempMessage,
        customMessages,
        introForm,
        missedChatTimer,
      });
    }
  };

  const handleHeaderColorChange = (color) => {
    setHeaderColor(color);
    setHeaderColorHex(color);

    updateLocalSettings({
      headerColor: color,
      backgroundColor,
      welcomeMessage,
      customMessages,
      introForm,
      missedChatTimer,
    });
  };

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
    setBackgroundColorHex(color);

    updateLocalSettings({
      headerColor,
      backgroundColor: color,
      welcomeMessage,
      customMessages,
      introForm,
      missedChatTimer,
    });
  };

  const handleSaveSettings = async () => {
    const newSettings = {
      headerColor,
      backgroundColor,
      welcomeMessage,
      customMessages,
      introForm,
      missedChatTimer,
    };

    try {
      await saveChatSettings(newSettings);
      updateSettings(newSettings);

      // Dispatch custom event to notify Chatbot.jsx of settings update
      const event = new CustomEvent("chatSettingsUpdated", {
        detail: newSettings,
      });
      window.dispatchEvent(event);

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  // Styles
  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
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
      backgroundColor: "#f9f9f9",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    customizationPanel: {
      flex: 1,
      backgroundColor: "#fff",
      padding: "20px",
      boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.1)",
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
      width: "100%",
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
    chatAvatar: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: "#ff9800",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginRight: "10px",
      fontSize: "14px",
      color: "#fff",
    },
    chatBody: {
      backgroundColor: backgroundColor,
      padding: "15px",
      height: "400px",
      display: "flex",
      flexDirection: "column",
    },
    messageContainer: {
      marginBottom: "10px",
    },
    botMessageBubble: {
      backgroundColor: "#f0f0f0",
      padding: "10px",
      borderRadius: "15px",
      maxWidth: "80%",
      display: "inline-block",
    },
    userMessageContainer: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "10px",
    },
    userMessageBubble: {
      backgroundColor: "#e1f5fe",
      padding: "10px",
      borderRadius: "15px",
      maxWidth: "80%",
    },
    introFormContainer: {
      backgroundColor: "#fff",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "15px",
      width: "80%",
    },
    chatInput: {
      width: "100%",
      display: "flex",
      borderTop: "1px solid #ddd",
      padding: "10px",
    },
    chatInputField: {
      flex: 1,
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
  };

  return (
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
              {/* Intro Form */}
              <div style={styles.introFormContainer}>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "10px",
                    color: "#333",
                    fontSize: "16px",
                  }}
                >
                  Introduction Yourself
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "5px",
                    }}
                  >
                    Your name
                  </div>
                  <input
                    type="text"
                    value={introForm.name}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                    readOnly
                  />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "5px",
                    }}
                  >
                    Your Phone
                  </div>
                  <input
                    type="text"
                    value={introForm.phone}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                    readOnly
                  />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "5px",
                    }}
                  >
                    Your Email
                  </div>
                  <input
                    type="text"
                    value={introForm.email}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
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
                  setIntroForm({ ...introForm, name: e.target.value })
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
                  setIntroForm({ ...introForm, phone: e.target.value })
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
                  setIntroForm({ ...introForm, email: e.target.value })
                }
                style={styles.formInput}
                placeholder="Enter email field label"
              />
            </div>
          </div>

          {/* Missed Chat Timer */}
          <div style={styles.optionSection}>
            <h3 style={styles.sectionTitle}>Missed chat timer</h3>
            <div style={styles.timerContainer}>
              <input
                type="text"
                value={missedChatTimer.hours}
                onChange={(e) =>
                  setMissedChatTimer({
                    ...missedChatTimer,
                    hours: e.target.value,
                  })
                }
                style={styles.timerInput}
              />
              <span style={styles.timerSeparator}>:</span>
              <input
                type="text"
                value={missedChatTimer.minutes}
                onChange={(e) =>
                  setMissedChatTimer({
                    ...missedChatTimer,
                    minutes: e.target.value,
                  })
                }
                style={styles.timerInput}
              />
              <span style={styles.timerSeparator}>:</span>
              <input
                type="text"
                value={missedChatTimer.seconds}
                onChange={(e) =>
                  setMissedChatTimer({
                    ...missedChatTimer,
                    seconds: e.target.value,
                  })
                }
                style={styles.timerInput}
              />
            </div>
          </div>

          {/* Save Button */}
          <div style={styles.saveButtonContainer}>
            {savedStatus && (
              <div
                style={
                  savedStatus.includes("Error")
                    ? styles.errorStatus
                    : styles.savedStatus
                }
              >
                {savedStatus}
              </div>
            )}
            <button style={styles.saveButton} onClick={handleSaveSettings}>
              Save Settings
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        // ... existing styles ...
      `}</style>
    </div>
  );
}

export default ChatBotCustomization;
