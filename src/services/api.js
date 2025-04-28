import axios from "axios";

const API_URL = "https://ticket-system-yogiraj.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (firstName, lastName, email, password, role = "admin") =>
    api.post("/auth/register", { firstName, lastName, email, password, role }),
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  },
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateProfile: async (data) => {
    try {
      const response = await api.put("/users/me", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update password
  updatePassword: async (data) => {
    try {
      const response = await api.post("/users/change-password", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Ticket services
export const ticketService = {
  getAllTickets: async (status = "") => {
    try {
      const response = await api.get("/tickets", {
        params: {
          status,
          page: 1,
          itemsPerPage: 1000, // Set a very large limit to get all tickets
        },
      });
      return response;
    } catch (error) {
      console.error("Error fetching all tickets:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch tickets"
      );
    }
  },

  getTickets: async (page = 1, itemsPerPage = 20) => {
    try {
      const response = await api.get("/tickets", {
        params: {
          page,
          itemsPerPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch tickets"
      );
    }
  },

  getTicket: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch ticket"
      );
    }
  },

  getTicketMessages: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}/messages`);
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  },

  addMessage: async (ticketId, sender, message) => {
    try {
      const response = await api.post(`/tickets/${ticketId}/message`, {
        sender,
        message,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding message:", error);
      throw new Error(
        error.response?.data?.message || "Failed to send message"
      );
    }
  },

  updateStatus: async (ticketId, status) => {
    try {
      const response = await api.put(`/tickets/${ticketId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating status:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update status"
      );
    }
  },

  assignTicket: async (ticketId, memberId) => {
    try {
      const response = await api.put(`/tickets/${ticketId}/assign`, {
        assignedTo: memberId,
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning ticket:", error);
      throw new Error(
        error.response?.data?.message || "Failed to assign ticket"
      );
    }
  },

  createTicket: async (data) => {
    try {
      const response = await api.post("/tickets/create", data);
      return response.data;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create ticket"
      );
    }
  },
};

// User/Member services
export const userService = {
  getAllMembers: async () => {
    try {
      const response = await api.get("/users/members");
      return response.data;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw new Error(error.response?.data?.error || "Failed to fetch members");
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw new Error(
        error.response?.data?.error || "Failed to fetch current user"
      );
    }
  },

  getCurrentUserId: () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?._id;
  },

  getMember: (id) => api.get(`/users/members/${id}`),
  createMember: (userData) => api.post("/users/members", userData),
  updateMember: (id, userData) => api.put(`/users/members/${id}`, userData),
  deleteMember: (id) => api.delete(`/users/members/${id}`),
  getMemberTickets: (id) => api.get(`/users/members/${id}/tickets`),
  updateCurrentUser: async (userData) => {
    try {
      const response = await api.put("/users/profile", userData);
      return response.data;
    } catch (error) {
      console.error("Error updating current user:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Analytics services
export const analyticsService = {
  getAnalytics: () => api.get("/tickets/analytics"),
  getDetailedAnalytics: () => api.get("/analytics/detailed"),
};

export default api;
