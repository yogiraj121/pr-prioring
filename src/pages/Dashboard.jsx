import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { ticketService, userService } from "../services/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import "./Dashboard.css";
import { toast } from "react-hot-toast";
import { getAvatarUrl } from "../utils/avatarUtils";

export default function TicketDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchTickets = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const status = activeTab === "all" ? "" : activeTab;
      const response = await ticketService.getAllTickets(status);

      if (!response.data || !Array.isArray(response.data.tickets)) {
        throw new Error("Invalid response format");
      }

      const sortedTickets = response.data.tickets.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTickets(sortedTickets);
      setError("");
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(error.message || "Failed to fetch tickets. Please try again.");
      setTickets([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTickets(true);
  }, [activeTab]);

  // Polling mechanism
  useEffect(() => {
    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        if (isMounted) {
          const response = await ticketService.getAllTickets(activeTab);
          if (response?.data?.tickets) {
            const sortedTickets = response.data.tickets.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setTickets(sortedTickets);
            setError("");
          }
        }
      } catch (error) {
        console.error("Error polling tickets:", error);
        if (isMounted) {
          setError(
            error.message || "Failed to fetch tickets. Please try again."
          );
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  const handleOpenTicket = async (ticketId) => {
    try {
      // Get the ticket details first
      const ticket = await ticketService.getTicket(ticketId);

      // If the ticket is assigned to a member and current user is not admin,
      // create a new ticket for the admin
      if (
        ticket.assignedTo &&
        ticket.assignedTo !== userService.getCurrentUserId()
      ) {
        // Create a new ticket with the same user info and first message
        const newTicket = await ticketService.createTicket({
          userInfo: ticket.userInfo,
          firstMessage: ticket.firstMessage,
          workspaceId: ticket.workspace,
        });

        // Navigate to the new ticket
        navigate(`/chat-center/${newTicket._id}`);
      } else {
        // Navigate to the original ticket
        navigate(`/chat-center/${ticketId}`);
      }
    } catch (error) {
      console.error("Error handling ticket:", error);
      toast.error("Failed to open ticket. Please try again.");
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      ticket._id.toLowerCase().includes(searchLower) ||
      ticket.firstMessage?.toLowerCase().includes(searchLower) ||
      ticket.userInfo?.name?.toLowerCase().includes(searchLower) ||
      ticket.userInfo?.email?.toLowerCase().includes(searchLower)
    );
  });

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const remainingMinutes = minutes % 60;
      return `${hours}hr ${remainingMinutes}m`;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar-container">
        <Sidebar />
      </div>

      <div className="main-content">
        <div className="header">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>

        <div className="search-container">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Search for ticket"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="tabs-container">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            All Tickets
          </button>
          <button
            className={`tab ${activeTab === "resolved" ? "active" : ""}`}
            onClick={() => handleTabChange("resolved")}
          >
            Resolved
          </button>
          <button
            className={`tab ${activeTab === "unresolved" ? "active" : ""}`}
            onClick={() => handleTabChange("unresolved")}
          >
            Unresolved
          </button>
        </div>

        <div className="ticket-list">
          {loading ? (
            <div className="loading-container">Loading tickets...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredTickets.length === 0 ? (
            <div className="no-tickets">No tickets found</div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket._id} className="ticket-item">
                <div className="ticket-header">
                  <div className="ticket-info">
                    <div className={`ticket-status-dot ${ticket.status}`}></div>
                    <div className="ticket-details">
                      <div className="ticket-id">
                        Ticket# {ticket._id.slice(-6)}
                      </div>
                      <div className="ticket-message">
                        {ticket.firstMessage}
                      </div>
                    </div>
                  </div>
                  <div className="ticket-meta">
                    <div className="posted-time">
                      Posted at{" "}
                      {new Date(ticket.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="ticket-status">
                      {getRelativeTime(ticket.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className="user-info">
                    <div className="avatar">
                      <img
                        src={getAvatarUrl(ticket.userInfo?._id || ticket._id)}
                        alt="User avatar"
                        className="avatar-image"
                      />
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {ticket.userInfo?.name || "Anonymous"}
                      </div>
                      <div className="user-contact">
                        <div>
                            {ticket.userInfo?.phone &&
                            `${ticket.userInfo.phone} • `}
                        </div>
                        <div>{ticket.userInfo?.email || "No email"}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="open-button"
                    onClick={() => handleOpenTicket(ticket._id)}
                  >
                    Open Ticket
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
