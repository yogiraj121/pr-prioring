import { useState, useEffect, useRef, useCallback } from "react";
import { useChatCustomization } from "../context/ChatCustomizationContext";
import { MessageSquare, Send } from "lucide-react";
import { ticketService, getChatSettings } from "../services/api";
import styles from "../styles/Chatbot.module.css";
import { toast } from "react-hot-toast";
import api from "../services/api";
import eclipse from "../../public/images/Ellipse 5.png";

export default function ChatbotLanding() {
  const { settings, updateSettings } = useChatCustomization();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem("chatIsOpen");
    return saved === "true" ? false : false;
  });
  const [ticketId, setTicketId] = useState(() => {
    const saved = localStorage.getItem("chatTicketId");
    if (saved && /^[0-9a-fA-F]{24}$/.test(saved)) {
      return saved;
    }
    return null;
  });
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem("chatStep");
    return saved || "initial";
  });
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("chatFormData");
    return saved
      ? JSON.parse(saved)
      : { name: "", email: "", phone: "", message: "" };
  });
  const [followUp, setFollowUp] = useState("");
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const savedSettings = await getChatSettings();
        if (savedSettings) {
          updateSettings(savedSettings);
          toast.success("Chat settings loaded successfully");
        }
      } catch (error) {
        console.error("Error fetching chat settings:", error);
        setError("Failed to load chat settings");
        toast.error("Failed to load chat settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [updateSettings]);

  useEffect(() => {
    if (!ticketId) return;

    const pollInterval = setInterval(async () => {
      try {
        const ticket = await ticketService.getTicket(ticketId);
        if (ticket && ticket.messages) {
          const currentMessageIds = new Set(
            messages.map((msg) => msg._id || msg.timestamp)
          );
          const newMessageIds = new Set(
            ticket.messages.map((msg) => msg._id || msg.timestamp)
          );

          const hasNewMessages = ticket.messages.some(
            (msg) => !currentMessageIds.has(msg._id || msg.timestamp)
          );

          if (hasNewMessages) {
            setMessages(ticket.messages);
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch (err) {
        console.error("Failed to poll messages:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [ticketId, messages]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    localStorage.setItem("chatFormData", JSON.stringify(formData));
    localStorage.setItem("chatStep", step);
    if (ticketId) {
      localStorage.setItem("chatTicketId", ticketId);
    } else {
      localStorage.removeItem("chatTicketId");
    }
  }, [messages, formData, step, ticketId]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      const initialMessages = [];
      if (settings.welcomeMessage) {
        initialMessages.push({
          sender: "bot",
          message: settings.welcomeMessage,
          timestamp: new Date().toISOString(),
        });
      }
      if (settings.customMessages?.length > 0) {
        settings.customMessages.forEach((msg) => {
          initialMessages.push({
            sender: "bot",
            message: msg,
            timestamp: new Date().toISOString(),
          });
        });
      }
      setMessages(initialMessages);
    }
  }, [settings]);

  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      const newSettings = event.detail;
      const initialMessages = [];
      if (newSettings.welcomeMessage) {
        initialMessages.push({
          sender: "bot",
          message: newSettings.welcomeMessage,
          timestamp: new Date().toISOString(),
        });
      }
      if (newSettings.customMessages?.length > 0) {
        newSettings.customMessages.forEach((msg) => {
          initialMessages.push({
            sender: "bot",
            message: msg,
            timestamp: new Date().toISOString(),
          });
        });
      }
      setMessages(initialMessages);
    };

    window.addEventListener("chatSettingsUpdated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("chatSettingsUpdated", handleSettingsUpdate);
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const scrollHeight = messagesContainerRef.current.scrollHeight;
      const height = messagesContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;

      messagesContainerRef.current.scrollTo({
        top: maxScrollTop,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleNewChat = async () => {
    setLoading(true);
    setError(null);

    const currentSettings = localSettings || settings;
    const initialMessages = [];

    if (currentSettings?.welcomeMessage) {
      initialMessages.push({
        sender: "bot",
        message: currentSettings.welcomeMessage,
        timestamp: new Date().toISOString(),
      });
    }
    if (currentSettings?.customMessages?.length > 0) {
      currentSettings.customMessages.forEach((msg) => {
        initialMessages.push({
          sender: "bot",
          message: msg,
          timestamp: new Date().toISOString(),
        });
      });
    }
    setMessages(initialMessages);
    setStep("initial");
    setFollowUp("");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setTicketId(null);

    localStorage.removeItem("chatTicketId");

    setLoading(false);
    setTimeout(scrollToBottom, 100);
  };

  const handleSendMessage = async () => {
    if (!followUp.trim()) return;

    try {
      let currentTicketId = ticketId;

      if (!currentTicketId) {
        const newTicket = await ticketService.createTicket({
          firstMessage: followUp,
          userInfo: formData,
        });
        currentTicketId = newTicket._id;
        setTicketId(currentTicketId);

        setStep("form");

        setMessages(newTicket.messages);
      } else {
        const updatedTicket = await ticketService.addMessage(
          currentTicketId,
          "user",
          followUp
        );
        setMessages(updatedTicket.messages);
      }

      setFollowUp("");
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.put(`/tickets/${ticketId}/update`, {
        userInfo: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || "",
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message:
            "Thank you for your message. An admin will get back to you shortly.",
          timestamp: new Date().toISOString(),
        },
      ]);

      setFormData({
        name: "",
        email: "",
        phone: "",
      });
      setStep("initial");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        err.response?.data?.error ||
          "Failed to submit your details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const getContrastingTextColor = (backgroundColor) => {
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  return (
    <div className={styles["chat-widget"]}>
      {isOpen && (
        <div
          className={`${styles["chat-container"]} ${isOpen ? styles.open : ""}`}
        >
          <div
            className={styles["chat-header"]}
            style={{
              backgroundColor: settings?.headerColor || "#1a365d",
              color: getContrastingTextColor(
                settings?.headerColor || "#1a365d"
              ),
            }}
          >
            <h3
              style={{
                color: getContrastingTextColor(
                  settings?.headerColor || "#1a365d"
                ),
              }}
            >
              <span
                style={{
                  borderRadius: "50%",
                  marginRight: "5px",
                }}
              >
                <img src={eclipse} alt="Hubly" />
              </span>
              Hubly
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleNewChat}
                style={{
                  background: "none",
                  border: "none",
                  color: getContrastingTextColor(
                    settings?.headerColor || "#1a365d"
                  ),
                  cursor: "pointer",
                  padding: "8px",
                  fontSize: "13px",
                }}
                disabled={loading}
              >
                {loading ? "Starting..." : "New Chat"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: getContrastingTextColor(
                    settings?.headerColor || "#1a365d"
                  ),
                  cursor: "pointer",
                  padding: "8px",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div
            className={styles["chat-body"]}
            ref={messagesContainerRef}
            style={{
              backgroundColor: settings?.backgroundColor || "#FFFFFF",
            }}
          >
            <div className={styles["chat-messages"]}>
              {messages.length === 0 ? (
                <div style={{ marginBottom: "15px", padding: "10px" }}>
                  <div className={styles["message-container"]}>
                    <div
                      className={styles.message}
                      style={{
                        backgroundColor: "#e8f1fd",
                        color: "#333",
                        marginBottom: "8px",
                      }}
                    >
                      {settings?.welcomeMessage ||
                        "Welcome! How can I help you today?"}
                    </div>
                  </div>
                  {settings?.customMessages?.map((msg, index) => (
                    <div
                      key={index}
                      className={styles["message-container"]}
                      style={{ marginBottom: "8px" }}
                    >
                      <div
                        className={styles.message}
                        style={{
                          backgroundColor: "#e8f1fd",
                          color: "#333",
                        }}
                      >
                        {msg}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={
                      msg.sender === "user"
                        ? styles["user-message-container"]
                        : styles["message-container"]
                    }
                  >
                    <div
                      className={
                        msg.sender === "user"
                          ? styles["user-message"]
                          : styles.message
                      }
                      style={{
                        backgroundColor:
                          msg.sender === "user"
                            ? settings?.userMessageColor || "#e8f1fd"
                            : settings?.botMessageColor || "#f0f0f0",
                        color: getContrastingTextColor(
                          msg.sender === "user"
                            ? settings?.userMessageColor || "#e8f1fd"
                            : settings?.botMessageColor || "#f0f0f0"
                        ),
                      }}
                    >
                      {msg.message}
                      <div className={styles.timestamp}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {step === "form" && (
              <div className={styles["chat-form-container"]}>
                <h3>Please provide your details</h3>
                <form onSubmit={handleSubmit}>
                  <div className={styles["form-group"]}>
                    <label>Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={settings?.introForm?.name || "Your name"}
                      required
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={
                        settings?.introForm?.email || "example@email.com"
                      }
                      required
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder={
                        settings?.introForm?.phone || "+1 (000) 000-0000"
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles["submit-button"]}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </form>
              </div>
            )}

            {error && (
              <div
                style={{
                  color: "#dc3545",
                  padding: "10px",
                  margin: "10px",
                  backgroundColor: "#f8d7da",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {step !== "form" && (
            <div className={styles["chat-input-container"]}>
              <input
                type="text"
                className={styles["chat-input"]}
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
              />
              <button
                className={styles["send-button"]}
                onClick={(e) => handleSendMessage(e)}
                disabled={loading || !followUp.trim()}
                style={{
                  backgroundColor: settings?.headerColor || "#1a365d",
                }}
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <button
        className={styles["chat-toggle-btn"]}
        onClick={handleToggle}
        aria-label="Toggle chat"
        style={{ backgroundColor: settings?.headerColor || "#1a365d" }}
      >
        <MessageSquare size={18} />
      </button>
    </div>
  );
}
