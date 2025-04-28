import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  MessageSquare,
  Home,
  BarChart2,
  Package,
  Users,
  Settings,
  User,
  Phone,
  Mail,
  ChevronDown,
  Send,
} from "lucide-react";
import Sidebar from "./Sidebar";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { ticketService, userService } from "../services/api";

export default function ContactCenter() {
  const { ticketId } = useParams();
  const [tickets, setTickets] = useState(() => {
    const savedTickets = localStorage.getItem("chatCenterTickets");
    return savedTickets ? JSON.parse(savedTickets) : [];
  });
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [currentTicket, setCurrentTicket] = useState(() => {
    const savedTicket = localStorage.getItem("currentChatCenterTicket");
    return savedTicket ? JSON.parse(savedTicket) : null;
  });
  const [messageCache, setMessageCache] = useState(() => {
    const savedCache = localStorage.getItem("chatCenterMessageCache");
    return savedCache ? JSON.parse(savedCache) : {};
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const ITEMS_PER_PAGE = 20;
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Save tickets to localStorage
  useEffect(() => {
    localStorage.setItem("chatCenterTickets", JSON.stringify(tickets));
  }, [tickets]);

  // Save current ticket to localStorage
  useEffect(() => {
    if (currentTicket) {
      localStorage.setItem(
        "currentChatCenterTicket",
        JSON.stringify(currentTicket)
      );
    } else {
      localStorage.removeItem("currentChatCenterTicket");
    }
  }, [currentTicket]);

  // Save message cache to localStorage
  useEffect(() => {
    localStorage.setItem(
      "chatCenterMessageCache",
      JSON.stringify(messageCache)
    );
  }, [messageCache]);

  // Load initial state from localStorage
  useEffect(() => {
    const savedTickets = localStorage.getItem("chatCenterTickets");
    const savedCurrentTicket = localStorage.getItem("currentChatCenterTicket");
    const savedMessageCache = localStorage.getItem("chatCenterMessageCache");

    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }
    if (savedCurrentTicket) {
      setCurrentTicket(JSON.parse(savedCurrentTicket));
      setActiveChat(JSON.parse(savedCurrentTicket));
    }
    if (savedMessageCache) {
      setMessageCache(JSON.parse(savedMessageCache));
    }
  }, []);

  // Add scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (currentTicket?.messages?.length) {
      scrollToBottom();
    }
  }, [currentTicket?.messages, scrollToBottom]);

  // Scroll to bottom when component mounts
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Fetch initial tickets
  useEffect(() => {
    fetchTickets(true);
  }, []);

  const fetchTickets = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setPage(1); // Reset page on initial load
      }

      const response = await ticketService.getTickets(page, ITEMS_PER_PAGE);

      if (!response || !response.tickets) {
        throw new Error("Invalid response format");
      }

      const { tickets: newTickets, totalPages: total } = response;

      setTickets((prev) => {
        const updatedTickets = isInitial
          ? newTickets
          : [...prev, ...newTickets];
        return updatedTickets;
      });

      setHasMore(page < total);
      setError("");
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError(err.message || "Failed to load tickets. Please try again.");
      if (isInitial) {
        setTickets([]); // Reset tickets on error for initial load
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTickets = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
      fetchTickets(false);
    }
  }, [loadingMore, hasMore]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loading) return;

    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };

    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore) {
        loadMoreTickets();
      }
    }, options);

    const chatList = document.querySelector("#chat-list");
    if (chatList) {
      const lastChat = chatList.lastElementChild;
      if (lastChat) {
        observer.current.observe(lastChat);
      }
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, loadingMore, loadMoreTickets]);

  // Handle chat selection with improved loading states
  const handleChatSelect = async (ticket) => {
    // Check if the user has access to this chat
    if (
      ticket.assignedTo &&
      ticket.assignedTo !== userService.getCurrentUserId() &&
      userRole !== "admin"
    ) {
      setShowAccessLostPopup(true);
      setTimeout(() => {
        setShowAccessLostPopup(false);
      }, 3000);
      return;
    }

    // Clear previous ticket data
    setCurrentTicket(null);
    setMessage("");
    setActiveChat(ticket);
    setLoadingMessages(true);

    try {
      // If we have cached messages, show them immediately
      if (messageCache[ticket._id]) {
        setCurrentTicket(messageCache[ticket._id]);
        setActiveChat(messageCache[ticket._id]);
        setLoadingMessages(false);
      }

      // Always fetch fresh data from the server
      const ticketData = await ticketService.getTicket(ticket._id);

      // Check again if user still has access after fetching fresh data
      if (
        ticketData.assignedTo &&
        ticketData.assignedTo !== userService.getCurrentUserId() &&
        userRole !== "admin"
      ) {
        setShowAccessLostPopup(true);
        setTimeout(() => {
          setActiveChat(null);
          setCurrentTicket(null);
          setShowAccessLostPopup(false);
        }, 3000);
        return;
      }

      // Update cache and current ticket
      setMessageCache((prev) => ({
        ...prev,
        [ticket._id]: ticketData,
      }));
      setCurrentTicket(ticketData);
      setActiveChat(ticketData);

      // Save to localStorage
      localStorage.setItem(
        "currentChatCenterTicket",
        JSON.stringify(ticketData)
      );
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
      setError("Failed to load ticket. Please try again.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Optimized message polling
  useEffect(() => {
    if (!activeChat) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await ticketService.getTicketMessages(activeChat._id);
        if (response && response.data) {
          const currentMessages = currentTicket?.messages || [];
          const newMessages = response.data;

          // More thorough message comparison
          const currentMessageIds = new Set(
            currentMessages.map((msg) => msg._id || msg.timestamp)
          );
          const hasNewMessages = newMessages.some(
            (msg) => !currentMessageIds.has(msg._id || msg.timestamp)
          );

          if (hasNewMessages) {
            setActiveChat((prev) => ({
              ...prev,
              messages: newMessages,
            }));
            setCurrentTicket((prev) => ({
              ...prev,
              messages: newMessages,
            }));
            setMessageCache((prev) => ({
              ...prev,
              [activeChat._id]: {
                ...(prev[activeChat._id] || {}),
                messages: newMessages,
              },
            }));
            scrollToBottom();
          }
        }
      } catch (err) {
        console.error("Failed to poll messages:", err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [activeChat?._id, currentTicket?.messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentTicket?.messages]);

  // Load ticket from URL parameter when component mounts
  useEffect(() => {
    if (ticketId) {
      const ticket = tickets.find((t) => t._id === ticketId);
      if (ticket) {
        handleChatSelect(ticket);
      }
    }
  }, [ticketId, tickets]);

  // Add this useEffect to fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoadingTeamMembers(true);
        const response = await userService.getAllMembers();
        // Filter to only show members created by the current admin
        const currentUserId = userService.getCurrentUserId();
        const membersOnly = response.filter(
          (member) =>
            member.role === "member" && member.createdBy === currentUserId
        );
        setTeamMembers(membersOnly);
      } catch (err) {
        console.error("Failed to fetch team members:", err);
      } finally {
        setLoadingTeamMembers(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Add this useEffect to get user role
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const response = await userService.getCurrentUser();
        setUserRole(response.role);
      } catch (err) {
        console.error("Failed to get user role:", err);
      }
    };
    getUserRole();
  }, []);

  // Handle message send with optimistic update
  const handleSend = async () => {
    if (!message.trim() || !activeChat) return;

    setSendingMessage(true);
    const messageText = message;
    setMessage(""); // Clear input immediately

    // Create new message object
    const newMessage = {
      sender: "admin",
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    try {
      // Optimistic update - add the message immediately to the UI
      setCurrentTicket((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), newMessage],
      }));
      setActiveChat((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), newMessage],
      }));

      // Scroll to bottom immediately
      scrollToBottom();

      // Send message to server
      await ticketService.addMessage(activeChat._id, "admin", messageText);

      // Fetch latest ticket data to ensure sync
      const updatedTicket = await ticketService.getTicket(activeChat._id);
      setCurrentTicket(updatedTicket);
      setActiveChat(updatedTicket);

      // Update cache
      setMessageCache((prev) => ({
        ...prev,
        [activeChat._id]: updatedTicket,
      }));

      // Save to localStorage
      localStorage.setItem(
        "currentChatCenterTicket",
        JSON.stringify(updatedTicket)
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      // Revert the optimistic update if sending failed
      setCurrentTicket((prev) => ({
        ...prev,
        messages:
          prev?.messages?.filter((msg) => msg.message !== messageText) || [],
      }));
      setActiveChat((prev) => ({
        ...prev,
        messages:
          prev?.messages?.filter((msg) => msg.message !== messageText) || [],
      }));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showAccessLostPopup, setShowAccessLostPopup] = useState(false);

  const handleAssignTicket = async (memberId) => {
    if (!currentTicket || !memberId) return;
    setSelectedMemberId(memberId);
    setShowAssignConfirm(true);
  };

  const confirmAssignment = async () => {
    if (!currentTicket || !selectedMemberId) return;

    try {
      const updatedTicket = await ticketService.assignTicket(
        currentTicket._id,
        selectedMemberId
      );
      setCurrentTicket(updatedTicket);
      setShowAssignConfirm(false);

      // Update the tickets list
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === updatedTicket._id ? updatedTicket : ticket
        )
      );

      // Show access lost popup if the current user is no longer assigned
      if (
        updatedTicket.assignedTo !== userService.getCurrentUserId() &&
        userRole !== "admin"
      ) {
        setShowAccessLostPopup(true);
        setTimeout(() => {
          setActiveChat(null);
          setCurrentTicket(null);
          setShowAccessLostPopup(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to assign ticket:", err);
      setShowAssignConfirm(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!activeChat) return;
    try {
      const updatedTicket = await ticketService.updateStatus(
        activeChat._id,
        status
      );
      setCurrentTicket(updatedTicket);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Format time for messages
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      width: "100%",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      overflow: "hidden",
    },

    sidebar: {
      width: "85px",
      backgroundColor: "#1a2b6d",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 0",
      position: "fixed",
      height: "100vh",
      zIndex: 10,
    },

    chatsSidebar: {
      width: "300px",
      backgroundColor: "#ffffff",
      borderRight: "1px solid #e9ecef",
      marginLeft: "85px",
      height: "100vh",
      position: "fixed",
      overflowY: "auto",
    },

    chatHeader: {
      padding: "24px",
      borderBottom: "1px solid #e9ecef",
    },

    headerTitle: {
      fontSize: "24px",
      fontWeight: "600",
      color: "#1a2b6d",
      margin: 0,
    },

    chatsSection: {
      padding: "16px",
    },

    chatsLabel: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#6c757d",
      marginBottom: "12px",
    },

    chatItem: {
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      cursor: "pointer",
      borderBottom: "1px solid #E5E7EB",
      transition: "background-color 0.2s",
      opacity: (ticket) => {
        if (
          ticket.assignedTo &&
          ticket.assignedTo !== userService.getCurrentUserId()
        )
          return 0.5;
        return 1;
      },
      pointerEvents: (ticket) => {
        if (
          ticket.assignedTo &&
          ticket.assignedTo !== userService.getCurrentUserId()
        )
          return "none";
        return "auto";
      },
      "&:hover": {
        backgroundColor: "#F3F4F6",
      },
    },

    activeChatItem: {
      backgroundColor: "#F3F4F6",
    },

    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "12px",
      overflow: "hidden",
      backgroundColor: "#F3F4F6",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    avatarFallback: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      fontWeight: "500",
      color: "#6B7280",
      backgroundColor: "#F3F4F6",
    },

    chatInfo: {
      flex: 1,
      minWidth: 0,
    },

    chatName: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#111827",
      marginBottom: "4px",
      display: "flex",
      alignItems: "center",
    },

    chatPreview: {
      fontSize: "12px",
      color: "#6B7280",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    mainArea: {
      marginLeft: "385px",
      width: "52%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#ffffff",
      height: "100vh",
      position: "relative",
    },

    mainHeader: {
      padding: "24px",
      borderBottom: "1px solid #e9ecef",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#ffffff",
    },

    ticketTitle: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#1a2b6d",
    },

    chatContent: {
      flex: 1,
      padding: "24px",
      overflowY: "auto",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      height: "calc(100vh - 200px)",
      scrollBehavior: "smooth",
    },

    messageContainer: {
      display: "flex",
      alignItems: "flex-start",
      marginBottom: "16px",
      position: "relative",
    },

    messageBubble: {
      maxWidth: "70%",
      padding: "12px 16px",
      borderRadius: "12px",
      fontSize: "14px",
      lineHeight: "1.5",
      position: "relative",
    },

    userMessageBubble: {
      backgroundColor: "#4F46E5",
      color: "#FFFFFF",
      marginLeft: "auto",
      borderBottomRightRadius: "4px",
    },

    agentMessageBubble: {
      backgroundColor: "#F3F4F6",
      color: "#111827",
      borderBottomLeftRadius: "4px",
    },

    messageTime: {
      fontSize: "10px",
      marginTop: "4px",
      opacity: 0.8,
    },

    userMessageTime: {
      color: "#E5E7EB",
      textAlign: "right",
    },

    agentMessageTime: {
      color: "#6B7280",
    },

    inputContainer: {
      padding: "16px 24px",
      borderTop: "1px solid #e9ecef",
      backgroundColor: "#ffffff",
    },

    inputWrapper: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      padding: "8px 16px",
      border: "1px solid #e9ecef",
    },

    input: {
      flex: 1,
      border: "none",
      outline: "none",
      backgroundColor: "transparent",
      fontSize: "14px",
      color: "#212529",
      padding: "8px 0",
    },

    sendButton: {
      backgroundColor: "#1a2b6d",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    detailsSidebar: {
      width: "300px",
      backgroundColor: "#ffffff",
      borderLeft: "1px solid #e9ecef",
      height: "100vh",
      position: "fixed",
      right: 0,
      top: 0,
      overflowY: "auto",
      padding: "24px",
    },

    detailsHeader: {
      marginBottom: "24px",
    },

    detailsTitle: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#1a2b6d",
      marginBottom: "16px",
    },

    detailsSection: {
      marginBottom: "24px",
    },

    detailItem: {
      display: "flex",
      alignItems: "center",
      padding: "12px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      marginBottom: "8px",
    },

    detailIcon: {
      color: "#6c757d",
      marginRight: "12px",
    },

    detailText: {
      fontSize: "14px",
      color: "#212529",
    },

    teammateSection: {
      marginTop: "24px",
    },

    statusDropdown: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#ffffff",
      border: "1px solid #e9ecef",
      borderRadius: "8px",
      fontSize: "14px",
      color: "#212529",
      cursor: "pointer",
      marginTop: "8px",
      outline: "none",
    },

    chatList: {
      width: "300px",
      backgroundColor: "#ffffff",
      borderRight: "1px solid #e9ecef",
      marginLeft: "85px",
      height: "100vh",
      position: "fixed",
      overflowY: "auto",
    },

    chatListHeader: {
      padding: "24px",
      borderBottom: "1px solid #e9ecef",
    },

    chatListContent: {
      padding: "16px",
    },

    errorMessage: {
      padding: "16px",
      color: "#dc3545",
    },

    messageAvatar: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "8px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#FFFFFF",
      backgroundColor: (initial) => {
        const colors = [
          "#4F46E5",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#EC4899",
          "#06B6D4",
          "#84CC16",
        ];
        const charCode = (initial || "?").toUpperCase().charCodeAt(0);
        return colors[charCode % colors.length];
      },
    },

    teamMemberLoading: {
      marginTop: "8px",
      color: "#6b7280",
    },
  };

  // Add this function to generate avatar URL
  const getAvatarUrl = (userId) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
  };

  const renderLoadingSkeleton = () => (
    <div style={{ padding: "16px" }}>
      <LoadingSkeleton type="card" count={5} height="80px" />
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Assignment Confirmation Popup */}
      {showAssignConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h3>Confirm Assignment</h3>
            <p>Are you sure you want to assign this chat?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setShowAssignConfirm(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignment}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#1a2b6d",
                  color: "white",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Lost Popup */}
      {showAccessLostPopup && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "12px 20px",
            borderRadius: "4px",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: 0 }}>You no longer have access to this chat</p>
        </div>
      )}
      {/* Left Sidebar */}
      <Sidebar />

      {/* Chats Sidebar */}
      <div style={styles.chatsSidebar}>
        <div style={styles.chatHeader}>
          <h1 style={styles.headerTitle}>Contact Center</h1>
        </div>

        <div style={styles.chatsSection}>
          <div style={styles.chatsLabel}>Chats</div>
          {loading ? (
            renderLoadingSkeleton()
          ) : error ? (
            <div style={styles.errorMessage}>{error}</div>
          ) : userRole === "member" && tickets.length === 0 ? (
            <div
              style={{ padding: "24px", textAlign: "center", color: "#6c757d" }}
            >
              No tickets assigned to you
            </div>
          ) : (
            <div id="chat-list" style={styles.chatListContent}>
              {[...tickets]
                .sort((a, b) => {
                  // If ticketId is provided (from dashboard), show that ticket first
                  if (ticketId) {
                    if (a._id === ticketId) return -1;
                    if (b._id === ticketId) return 1;
                  }
                  // Then sort unassigned tickets to the top
                  if (!a.assignedTo && b.assignedTo) return -1;
                  if (a.assignedTo && !b.assignedTo) return 1;
                  // For tickets with same assignment status, sort by creation date
                  return new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map((ticket, index) => (
                  <div
                    key={ticket._id}
                    style={{
                      ...styles.chatItem,
                      ...(activeChat?._id === ticket._id
                        ? styles.activeChatItem
                        : {}),
                      opacity:
                        ticket.assignedTo &&
                        ticket.assignedTo !== userService.getCurrentUserId()
                          ? 0.5
                          : 1,
                      pointerEvents:
                        ticket.assignedTo &&
                        ticket.assignedTo !== userService.getCurrentUserId()
                          ? "none"
                          : "auto",
                    }}
                    onClick={() => handleChatSelect(ticket)}
                  >
                    <div style={styles.avatar}>
                      {ticket.userInfo?.profileImage ? (
                        <img
                          src={ticket.userInfo.profileImage}
                          alt={`User ${index + 1}`}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <img
                          src={getAvatarUrl(ticket.userInfo?._id || ticket._id)}
                          alt={`User ${index + 1}`}
                          style={styles.avatarImage}
                        />
                      )}
                    </div>
                    <div style={styles.chatInfo}>
                      <div style={styles.chatName}>
                        Chat {index + 1}
                        {ticket.assignedTo &&
                          ticket.assignedTo !==
                            userService.getCurrentUserId() && (
                            <span
                              style={{
                                marginLeft: "8px",
                                color: "#6B7280",
                                fontSize: "12px",
                                padding: "2px 6px",
                                backgroundColor: "#F3F4F6",
                                borderRadius: "4px",
                              }}
                            >
                              Assigned Ticket . You cant access
                            </span>
                          )}
                      </div>
                      <div style={styles.chatPreview}>
                        {ticket.firstMessage?.substring(0, 30) || "No message"}
                        {ticket.firstMessage?.length > 30 ? "..." : ""}
                      </div>
                    </div>
                  </div>
                ))}
              {loadingMore && (
                <div style={{ padding: "16px" }}>
                  <LoadingSkeleton type="card" count={1} height="80px" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={styles.mainArea}>
        {userRole === "member" && tickets.length === 0 ? (
          <div
            style={{ padding: "24px", textAlign: "center", color: "#6c757d" }}
          >
            No tickets assigned to you
          </div>
        ) : currentTicket &&
          userRole === "admin" &&
          currentTicket.assignedTo &&
          currentTicket.assignedTo !== userService.getCurrentUserId() ? (
          <div
            style={{ padding: "24px", textAlign: "center", color: "#dc3545" }}
          >
            You do not have access to this chat
          </div>
        ) : currentTicket ? (
          <>
            <div style={styles.mainHeader}>
              <div style={styles.ticketTitle}>
                Ticket# {currentTicket._id.slice(-6)}
              </div>
            </div>

            <div style={styles.chatContent} ref={chatContainerRef}>
              {loadingMessages ? (
                <div style={styles.loadingOverlay}>Loading messages...</div>
              ) : (
                <>
                  {currentTicket.firstMessage && (
                    <div style={styles.messageContainer}>
                      <div style={styles.userMessageBubble}>
                        {currentTicket.firstMessage}

                        <div style={styles.userMessageTime}>
                          {formatTime(currentTicket.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTicket.messages?.map((message, index) => {
                    const isUserMessage = message.sender === "user";
                    return (
                      <div key={index} style={styles.messageContainer}>
                        <div
                          style={{
                            ...styles.messageBubble,
                            ...(isUserMessage
                              ? styles.userMessageBubble
                              : styles.agentMessageBubble),
                          }}
                        >
                          {message.message}
                          <div
                            style={{
                              ...styles.messageTime,
                              ...(isUserMessage
                                ? styles.userMessageTime
                                : styles.agentMessageTime),
                            }}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div style={styles.inputContainer}>
              <div style={styles.inputWrapper}>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button
                  style={styles.sendButton}
                  onClick={handleSend}
                  disabled={sendingMessage}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{ padding: "24px", textAlign: "center", color: "#6c757d" }}
          >
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* Details Sidebar */}
      {userRole === "member" && tickets.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", color: "#6c757d" }}>
          No tickets assigned to you
        </div>
      ) : (
        currentTicket &&
        (!currentTicket.assignedTo ||
          currentTicket.assignedTo === userService.getCurrentUserId()) && (
          <div style={styles.detailsSidebar}>
            <div style={styles.detailsHeader}>
              <h2 style={styles.detailsTitle}>Details</h2>

              <div style={styles.detailItem}>
                <User style={styles.detailIcon} size={16} />
                <span style={styles.detailText}>
                  {currentTicket.userInfo?.name || "Anonymous"}
                </span>
              </div>

              {currentTicket.userInfo?.phone && (
                <div style={styles.detailItem}>
                  <Phone style={styles.detailIcon} size={16} />
                  <span style={styles.detailText}>
                    {currentTicket.userInfo.phone}
                  </span>
                </div>
              )}

              {currentTicket.userInfo?.email && (
                <div style={styles.detailItem}>
                  <Mail style={styles.detailIcon} size={16} />
                  <span style={styles.detailText}>
                    {currentTicket.userInfo.email}
                  </span>
                </div>
              )}
            </div>

            <div style={styles.detailsSection}>
              <h3 style={styles.detailsTitle}>Assign to</h3>
              <select
                style={styles.statusDropdown}
                value={currentTicket?.assignedTo || ""}
                onChange={(e) => handleAssignTicket(e.target.value)}
                disabled={loadingTeamMembers || userRole === "member"}
              >
                <option value="">Select teammate</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name || member.firstName || member.email || "user"}
                  </option>
                ))}
              </select>
              {loadingTeamMembers && (
                <div style={styles.teamMemberLoading}>
                  Loading team members...
                </div>
              )}
            </div>

            <div style={styles.detailsSection}>
              <h3 style={styles.detailsTitle}>Ticket status</h3>
              <select
                style={styles.statusDropdown}
                value={currentTicket.status || "unresolved"}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        )
      )}
    </div>
  );
}
