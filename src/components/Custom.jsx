import React, { useState, useEffect } from "react";
import { useChatCustomization } from "../context/ChatCustomizationContext";
import { saveChatSettings, getChatSettings } from "../services/api";
import { Send, X, Edit2 } from "lucide-react";
import Sidebar from "./Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Custom.css";

const ChatBotCustomization = () => {
  const { settings, updateSettings } = useChatCustomization();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editingWelcomeMessage, setEditingWelcomeMessage] = useState(false);

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
      const newMessages = [...(prev.customMessages || [])];
      newMessages[index] = value;
      return {
        ...prev,
        customMessages: newMessages,
      };
    });
  };

  const handleCustomMessageEdit = (index) => {
    setEditingMessageIndex(index);
  };

  const handleWelcomeMessageEdit = () => {
    setEditingWelcomeMessage(true);
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      setIsLoading(true);
      const settingsToSave = {
        ...localSettings,
        customMessages: localSettings.customMessages || [],
      };
      await saveChatSettings(settingsToSave);
      updateSettings(settingsToSave);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={3000} />
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {error && <div className="errorMessage">{error}</div>}

      {success && <div className="successMessage">{success}</div>}

      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="content">
        <div className="chatPreview">
          <div className="chatContainer">
            {/* Chat Header */}
            <div
              className="chatHeader"
              style={{ backgroundColor: localSettings.headerColor }}
            >
              <div className="chatAvatar">H</div>
              <div>Hubly</div>
            </div>

            {/* Chat Body */}
            <div
              className="chatBody"
              style={{ backgroundColor: localSettings.backgroundColor }}
            >
              {/* Custom Messages */}
              <div className="optionSection">
                {localSettings.customMessages.map((message, index) => (
                  <div key={index} className="customMessage">
                    {editingMessageIndex === index ? (
                      <input
                        type="text"
                        value={message}
                        onChange={(e) =>
                          handleCustomMessageChange(index, e.target.value)
                        }
                        className="formInput"
                        onBlur={() => setEditingMessageIndex(null)}
                      />
                    ) : (
                      <>
                        <div className="messageText">{message}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Intro Form */}
              <div className="introFormContainer">
                <div className="sectionTitle">Introduction Yourself</div>
                <div className="formField">
                  <div className="formLabel">Your name</div>
                  <input
                    type="text"
                    value={localSettings.introForm.name}
                    className="formInput"
                    readOnly
                  />
                </div>
                <div className="formField">
                  <div className="formLabel">Your Phone</div>
                  <input
                    type="text"
                    value={localSettings.introForm.phone}
                    className="formInput"
                    readOnly
                  />
                </div>
                <div className="formField">
                  <div className="formLabel">Your Email</div>
                  <input
                    type="text"
                    value={localSettings.introForm.email}
                    className="formInput"
                    readOnly
                  />
                </div>
                <button className="button">Thank You!</button>
              </div>
            </div>

            {/* Chat Input */}
            <div className="chatInput">
              <input
                className="chatInputField"
                placeholder="Write a message"
                readOnly
              />
              <button className="sendButton">
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Welcome Message Preview */}
          <div className="welcomeMessageContainer">
            <div className="chatAvatar">H</div>
            <div className="welcomeMessageText">
              {localSettings.welcomeMessage}
            </div>
            <div className="welcomeMessageDate">
              <X size={16} />
            </div>
          </div>
        </div>

        <div className="customizationPanel">
          <h2 className="title">Chat Bot</h2>

          {/* Header Color */}
          <div className="optionSection">
            <h3 className="sectionTitle">Header Color</h3>
            <div className="colorOptions">
              <div
                className={`colorCircle ${
                  localSettings.headerColor === "#FFFFFF"
                    ? "colorCircleSelected"
                    : ""
                }`}
                style={{ backgroundColor: "#FFFFFF" }}
                onClick={() => handleColorChange("headerColor", "#FFFFFF")}
              ></div>
              <div
                className={`colorCircle ${
                  localSettings.headerColor === "#000000"
                    ? "colorCircleSelected"
                    : ""
                }`}
                style={{ backgroundColor: "#000000" }}
                onClick={() => handleColorChange("headerColor", "#000000")}
              ></div>
              <div
                className={`colorCircle ${
                  localSettings.headerColor === "#33475B"
                    ? "colorCircleSelected"
                    : ""
                }`}
                style={{ backgroundColor: "#33475B" }}
                onClick={() => handleColorChange("headerColor", "#33475B")}
              ></div>
            </div>
            <input
              type="text"
              value={localSettings.headerColor}
              onChange={(e) => handleColorChange("headerColor", e.target.value)}
              onBlur={() =>
                handleColorChange("headerColor", localSettings.headerColor)
              }
              className="colorInput"
            />
          </div>

          {/* Background Color */}
          <div className="optionSection">
            <h3 className="sectionTitle">Custom Background Color</h3>
            <div className="colorOptions">
              <div
                className={`colorCircle ${
                  localSettings.backgroundColor === "#FFFFFF"
                    ? "colorCircleSelected"
                    : ""
                }`}
                style={{ backgroundColor: "#FFFFFF" }}
                onClick={() => handleColorChange("backgroundColor", "#FFFFFF")}
              ></div>
              <div
                className={`colorCircle ${
                  localSettings.backgroundColor === "#000000"
                    ? "colorCircleSelected"
                    : ""
                }`}
                style={{ backgroundColor: "#000000" }}
                onClick={() => handleColorChange("backgroundColor", "#000000")}
              ></div>
              <div
                className={`colorCircle ${
                  localSettings.backgroundColor === "#EEEEEE"
                    ? "colorCircleSelected"
                    : ""
                }`}
                style={{ backgroundColor: "#EEEEEE" }}
                onClick={() => handleColorChange("backgroundColor", "#EEEEEE")}
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
              className="colorInput"
            />
          </div>

          {/* Custom Messages */}
          <div className="optionSection">
            <h3 className="sectionTitle">Customize Message</h3>
            {localSettings.customMessages.map((message, index) => (
              <div key={index} className="customMessage">
                {editingMessageIndex === index ? (
                  <input
                    type="text"
                    value={message}
                    onChange={(e) =>
                      handleCustomMessageChange(index, e.target.value)
                    }
                    className="formInput"
                    onBlur={() => setEditingMessageIndex(null)}
                  />
                ) : (
                  <>
                    <div className="messageText">{message}</div>
                    <button
                      className="editButton"
                      onClick={() => handleCustomMessageEdit(index)}
                    >
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Welcome Message */}
          <div className="optionSection">
            <h3 className="sectionTitle">Welcome Message</h3>
            <div className="customMessage">
              {editingWelcomeMessage ? (
                <input
                  type="text"
                  value={localSettings.welcomeMessage}
                  onChange={(e) =>
                    handleMessageChange("welcomeMessage", e.target.value)
                  }
                  className="formInput"
                  onBlur={() => setEditingWelcomeMessage(false)}
                />
              ) : (
                <>
                  <div className="messageText">
                    {localSettings.welcomeMessage}
                  </div>
                  <button
                    className="editButton"
                    onClick={handleWelcomeMessageEdit}
                  >
                    <Edit2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Introduction Form */}
          <div className="optionSection">
            <h3 className="sectionTitle">Introduction Form</h3>
            <div className="formField">
              <label className="formLabel">Your name</label>
              <input
                type="text"
                value={localSettings.introForm.name}
                onChange={(e) =>
                  handleMessageChange("introForm", {
                    ...localSettings.introForm,
                    name: e.target.value,
                  })
                }
                className="formInput"
                placeholder="Enter your name"
              />
            </div>
            <div className="formField">
              <label className="formLabel">Your Phone</label>
              <input
                type="text"
                value={localSettings.introForm.phone}
                onChange={(e) =>
                  handleMessageChange("introForm", {
                    ...localSettings.introForm,
                    phone: e.target.value,
                  })
                }
                className="formInput"
                placeholder="+1 (000) 000-0000"
              />
            </div>
            <div className="formField">
              <label className="formLabel">Your Email</label>
              <input
                type="text"
                value={localSettings.introForm.email}
                onChange={(e) =>
                  handleMessageChange("introForm", {
                    ...localSettings.introForm,
                    email: e.target.value,
                  })
                }
                className="formInput"
                placeholder="example@gmail.com"
              />
            </div>
          </div>

          {/* Missed Chat Timer */}
          <div className="optionSection">
            <h3 className="sectionTitle">Missed chat timer</h3>
            <div className="timerContainer">
              <input
                type="text"
                value={localSettings.missedChatTimer.hours}
                onChange={(e) =>
                  handleMessageChange("missedChatTimer", {
                    ...localSettings.missedChatTimer,
                    hours: e.target.value,
                  })
                }
                className="timerInput"
                placeholder="00"
              />
              <span className="timerSeparator">:</span>
              <input
                type="text"
                value={localSettings.missedChatTimer.minutes}
                onChange={(e) =>
                  handleMessageChange("missedChatTimer", {
                    ...localSettings.missedChatTimer,
                    minutes: e.target.value,
                  })
                }
                className="timerInput"
                placeholder="00"
              />
              <span className="timerSeparator">:</span>
              <input
                type="text"
                value={localSettings.missedChatTimer.seconds}
                onChange={(e) =>
                  handleMessageChange("missedChatTimer", {
                    ...localSettings.missedChatTimer,
                    seconds: e.target.value,
                  })
                }
                className="timerInput"
                placeholder="00"
              />
            </div>
          </div>

          {/* Save Button */}
          <button className="saveButton" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotCustomization;
