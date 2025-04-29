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
import "./ChatCenter.css";

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
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showAccessLostPopup, setShowAccessLostPopup] = useState(false);

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
    <div className="container">
      {/* Assignment Confirmation Popup */}
      {showAssignConfirm && (
        <div className="confirmPopup">
          <div className="confirmContent">
            <h3>Confirm Assignment</h3>
            <p>Are you sure you want to assign this chat?</p>
            <div className="confirmButtons">
              <button
                className="cancelButton"
                onClick={() => setShowAssignConfirm(false)}
              >
                Cancel
              </button>
              <button className="confirmButton" onClick={confirmAssignment}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Lost Popup */}
      {showAccessLostPopup && (
        <div className="accessLostPopup">
          <p>You no longer have access to this chat</p>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar />

      {/*----------- Chats Sidebar ------------*/}
      <div className="chatsSidebar">
        <div className="chatHeader">
          <h1 className="headerTitle">Contact Center</h1>
        </div>

        <div className="chatsSection">
          <div className="chatsLabel">Chats</div>
          {loading ? (
            renderLoadingSkeleton()
          ) : error ? (
            <div className="errorMessage">{error}</div>
          ) : userRole === "member" && tickets.length === 0 ? (
            <div className="noTicketsMessage">No tickets assigned to you</div>
          ) : (
            <div id="chat-list" className="chatListContent">
              {[...tickets]
                .sort((a, b) => {
                  // Sort by creation date, newest first
                  return new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map((ticket, index) => (
                  <div
                    key={ticket._id}
                    className={`chatItem ${
                      activeChat?._id === ticket._id ? "activeChatItem" : ""
                    }`}
                    style={{
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
                    <div className="avatar">
                      {ticket.userInfo?.profileImage ? (
                        <img
                          src={ticket.userInfo.profileImage}
                          alt={`User ${index + 1}`}
                          className="avatarImage"
                        />
                      ) : (
                        <img
                          src={getAvatarUrl(ticket.userInfo?._id || ticket._id)}
                          alt={`User ${index + 1}`}
                          className="avatarImage"
                        />
                      )}
                    </div>
                    <div className="chatInfo">
                      <div className="chatName">
                        Chat {index + 1}
                        {ticket.assignedTo &&
                          ticket.assignedTo !==
                            userService.getCurrentUserId() && (
                            <span className="assignedBadge">
                              Assigned Ticket . You cant access
                            </span>
                          )}
                      </div>
                      <div className="chatPreview">
                        {ticket.firstMessage?.substring(0, 30) || "No message"}
                        {ticket.firstMessage?.length > 30 ? "..." : ""}
                      </div>
                    </div>
                  </div>
                ))}
              {loadingMore && (
                <div className="loadingOverlay">
                  <LoadingSkeleton type="card" count={1} height="80px" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/*----------- Main Chat Area ------------*/}
      <div className="mainArea">
        {userRole === "member" && tickets.length === 0 ? (
          <div className="noTicketsMessage">No tickets assigned to you</div>
        ) : currentTicket &&
          userRole === "admin" &&
          currentTicket.assignedTo &&
          currentTicket.assignedTo !== userService.getCurrentUserId() ? (
          <div className="accessDeniedMessage">
            You do not have access to this chat
          </div>
        ) : currentTicket ? (
          <>
            <div className="mainHeader">
              <div className="ticketTitle">
                Ticket# {currentTicket._id.slice(-6)}
              </div>
            </div>

            <div className="chatContent" ref={chatContainerRef}>
              {loadingMessages ? (
                <div className="loadingOverlay">Loading messages...</div>
              ) : (
                <>
                  {currentTicket.firstMessage && (
                    <div className="messageContainer">
                      <div className="messageBubble userMessageBubble">
                        {currentTicket.firstMessage}
                        <div className="messageTime userMessageTime">
                          {formatTime(currentTicket.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTicket.messages?.map((message, index) => {
                    const isUserMessage = message.sender === "user";
                    return (
                      <div key={index} className="messageContainer">
                        <div
                          className={`messageBubble ${
                            isUserMessage
                              ? "userMessageBubble"
                              : "agentMessageBubble"
                          }`}
                        >
                          {message.message}
                          <div
                            className={`messageTime ${
                              isUserMessage
                                ? "userMessageTime"
                                : "agentMessageTime"
                            }`}
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

            <div className="inputContainer">
              <div className="inputWrapper">
                <input
                  className="input"
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button
                  className="sendButton"
                  onClick={handleSend}
                  disabled={sendingMessage}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="selectChatMessage">
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/*----------- Details Sidebar ------------*/}
      {userRole === "member" && tickets.length === 0 ? (
        <div className="noTicketsMessage">No tickets assigned to you</div>
      ) : (
        currentTicket &&
        (!currentTicket.assignedTo ||
          currentTicket.assignedTo === userService.getCurrentUserId()) && (
          <div className="detailsSidebar">
            <div className="detailsHeader">
              <h2 className="detailsTitle">Details</h2>

              <div className="detailItem">
                <User className="detailIcon" size={16} />
                <span className="detailText">
                  {currentTicket.userInfo?.name || "Anonymous"}
                </span>
              </div>

              {currentTicket.userInfo?.phone && (
                <div className="detailItem">
                  <Phone className="detailIcon" size={16} />
                  <span className="detailText">
                    {currentTicket.userInfo.phone}
                  </span>
                </div>
              )}

              {currentTicket.userInfo?.email && (
                <div className="detailItem">
                  <Mail className="detailIcon" size={16} />
                  <span className="detailText">
                    {currentTicket.userInfo.email}
                  </span>
                </div>
              )}
            </div>

            <div className="detailsSection">
              <h3 className="detailsTitle">Assign to</h3>
              <select
                className="statusDropdown"
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
                <div className="teamMemberLoading">Loading team members...</div>
              )}
            </div>

            <div className="detailsSection">
              <h3 className="detailsTitle">Ticket status</h3>
              <select
                className="statusDropdown"
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
