import { useState, useEffect, useCallback } from "react";
import { ticketService } from "../services/api";

// Cache for storing processed data
const cache = {
  data: null,
  timestamp: null,
  userRole: null,
  period: null,
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useMissedChats = (userRole, period) => {
  const [missedChats, setMissedChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processTickets = useCallback((tickets, userRole) => {
    const now = new Date();
    const weeklyData = {};

    // Filter tickets based on user role first
    const filteredTickets =
      userRole === "admin"
        ? tickets
        : tickets.filter(
            (ticket) => ticket.assignedTo === userService.getCurrentUserId()
          );

    // Process only the last 10 weeks of tickets
    filteredTickets.forEach((ticket) => {
      const ticketDate = new Date(ticket.createdAt);
      const weekDiff = Math.floor(
        (now - ticketDate) / (7 * 24 * 60 * 60 * 1000)
      );

      if (weekDiff < 10) {
        const weekKey = `Week ${10 - weekDiff}`;
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            total: 0,
            unresolved: 0,
          };
        }
        weeklyData[weekKey].total++;
        if (ticket.status === "unresolved") {
          weeklyData[weekKey].unresolved++;
        }
      }
    });

    // Create the final data array
    return Array.from({ length: 10 }, (_, i) => {
      const weekKey = `Week ${i + 1}`;
      return {
        week: weekKey,
        missedChats: weeklyData[weekKey]?.unresolved || 0,
      };
    });
  }, []);

  useEffect(() => {
    const fetchMissedChats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if we have valid cached data
        const now = Date.now();
        if (
          cache.data &&
          cache.timestamp &&
          now - cache.timestamp < CACHE_DURATION &&
          cache.userRole === userRole &&
          cache.period === period
        ) {
          setMissedChats(cache.data);
          setLoading(false);
          return;
        }

        // Get all tickets
        const response = await ticketService.getAllTickets();
        const tickets = response.data.tickets;

        // Process the tickets
        const processedData = processTickets(tickets, userRole);

        // Update cache
        cache.data = processedData;
        cache.timestamp = now;
        cache.userRole = userRole;
        cache.period = period;

        setMissedChats(processedData);
      } catch (err) {
        console.error("Error fetching missed chats:", err);
        setError("Failed to load missed chats data");
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      fetchMissedChats();
    }
  }, [userRole, period, processTickets]);

  return { missedChats, loading, error };
};
