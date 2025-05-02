const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { auth, adminAuth } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const { status, page = 1, itemsPerPage = 20 } = req.query;
    let query = {};

    // Only add status to query if it's a valid status
    if (status && ["resolved", "unresolved"].includes(status)) {
      query.status = status;
    }

    // If user is a member, only show their assigned tickets with pagination
    if (req.user.role === "member") {
      query.assignedTo = req.user._id;

      // Calculate skip value for pagination
      const skip = (parseInt(page) - 1) * parseInt(itemsPerPage);

      // Get total count for pagination
      const totalCount = await Ticket.countDocuments(query);

      // Get paginated tickets for members
      const tickets = await Ticket.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(itemsPerPage));

      res.json({
        tickets,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(itemsPerPage)),
      });
    }
    // If user is admin, show all tickets without pagination
    else if (req.user.role === "admin") {
      const tickets = await Ticket.find(query).sort({ createdAt: -1 });

      res.json({
        tickets,
        totalCount: tickets.length,
        currentPage: 1,
        totalPages: 1,
      });
    }
  } catch (err) {
    console.error("Failed to fetch tickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

router.get("/members", auth, async (req, res) => {
  try {
    const members = await User.find({ role: "member" }); // adjust query if needed
    res.json(members);
  } catch (err) {
    console.error("Failed to get members:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { firstMessage } = req.body;

    if (!firstMessage) {
      return res.status(400).json({ error: "First message is required" });
    }

    const ticket = new Ticket({
      firstMessage,
      messages: [{ sender: "user", message: firstMessage }],
      status: "unresolved",
      // Don't auto-assign to admin
    });

    const savedTicket = await ticket.save();
    console.log("Created new ticket:", savedTicket._id);
    res.json(savedTicket);
  } catch (err) {
    console.error("Error creating ticket:", err);
    res
      .status(500)
      .json({ error: "Failed to create ticket", details: err.message });
  }
});

router.get("/analytics", auth, adminAuth, async (req, res) => {
  try {
    // Get all tickets
    const allTickets = await Ticket.find();
    const totalTickets = allTickets.length;

    // Get resolved tickets
    const resolvedTickets = allTickets.filter(
      (ticket) => ticket.status === "resolved"
    ).length;

    // Calculate resolved percentage
    const resolvedPercentage =
      totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    // Get tickets created in the last 10 weeks for missed chats chart
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70); // 10 weeks ago

    // Prepare weekly data
    const weeklyData = Array.from({ length: 10 }, (_, i) => ({
      week: i + 1,
      value: 0, // Default value
    }));

    // Count tickets per week (as missed chats for the chart)
    allTickets.forEach((ticket) => {
      const createdAt = new Date(ticket.createdAt);
      if (createdAt >= tenWeeksAgo) {
        // Determine which week this ticket belongs to
        const weeksDiff = Math.floor(
          (Date.now() - createdAt) / (7 * 24 * 60 * 60 * 1000)
        );
        const weekIndex = 9 - Math.min(weeksDiff, 9); // Reverse so most recent is last

        if (weeklyData[weekIndex]) {
          weeklyData[weekIndex].value += 1;
        }
      }
    });

    // Return analytics data
    res.json({
      missedChats: weeklyData,
      totalChats: totalTickets,
      resolvedPercentage: resolvedPercentage,
      avgReplyTime: 0,
      overallStats: {
        totalTickets: totalTickets,
        openTickets: totalTickets - resolvedTickets,
        avgResolutionTime: "3h 12m", // Placeholder - calculate from actual data if available
        customerSatisfaction: 93, // Placeholder - calculate from actual feedback if available
      },
    });
  } catch (err) {
    console.error("Failed to generate analytics:", err);
    res.status(500).json({ error: "Failed to generate analytics" });
  }
});

router.get("/:ticketId", async (req, res) => {
  try {
    if (!req.params.ticketId) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json(ticket);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch ticket", details: err.message });
  }
});

router.put("/:ticketId/update", async (req, res) => {
  try {
    const { userInfo } = req.body;
    if (!userInfo || !userInfo.name || !userInfo.email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const updated = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      {
        userInfo,
        status: "unresolved",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Failed to update ticket:", err);
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

router.post("/:ticketId/message", async (req, res) => {
  try {
    const { sender, message } = req.body;
    const { ticketId } = req.params;

    console.log("Received message request:", { ticketId, sender, message });

    if (!ticketId) {
      console.error("Missing ticketId in request");
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    if (!sender || !message) {
      console.error("Missing required fields:", { sender, message });
      return res.status(400).json({ error: "Sender and message are required" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      console.error("Ticket not found:", ticketId);
      return res.status(404).json({ error: "Ticket not found" });
    }

    console.log("Found ticket:", ticket._id);

    const newMessage = {
      sender,
      message,
      timestamp: new Date(),
    };

    ticket.messages.push(newMessage);
    const updatedTicket = await ticket.save();

    console.log("Message added successfully to ticket:", ticketId);
    console.log(
      "Updated ticket messages count:",
      updatedTicket.messages.length
    );

    res.json(updatedTicket);
  } catch (err) {
    console.error("Error adding message to ticket:", err);
    res.status(500).json({
      error: "Failed to add message",
      details: err.message,
    });
  }
});
router.put("/:ticketId/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["resolved", "unresolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Failed to update ticket status:", err);
    res.status(500).json({ error: "Failed to update ticket status" });
  }
});

router.put("/:ticketId/assign", auth, async (req, res) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const updated = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { assignedTo },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Failed to assign ticket:", err);
    res.status(500).json({ error: "Failed to assign ticket" });
  }
});

router.get("/analytics/member/:memberId", auth, adminAuth, async (req, res) => {
  try {
    const memberId = req.params.memberId;

    // Get tickets assigned to this member
    const memberTickets = await Ticket.find({ assignedTo: memberId });
    const totalTickets = memberTickets.length;

    // Get resolved tickets
    const resolvedTickets = memberTickets.filter(
      (ticket) => ticket.status === "resolved"
    ).length;

    // Calculate resolved percentage
    const resolvedPercentage =
      totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    // Get tickets created in the last 10 weeks for missed chats chart
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70); // 10 weeks ago

    // Prepare weekly data
    const weeklyData = Array.from({ length: 10 }, (_, i) => ({
      week: i + 1,
      value: 0, // Default value
    }));

    // Count tickets per week assigned to this member
    memberTickets.forEach((ticket) => {
      const createdAt = new Date(ticket.createdAt);
      if (createdAt >= tenWeeksAgo) {
        // Determine which week this ticket belongs to
        const weeksDiff = Math.floor(
          (Date.now() - createdAt) / (7 * 24 * 60 * 60 * 1000)
        );
        const weekIndex = 9 - Math.min(weeksDiff, 9); // Reverse so most recent is last

        if (weeklyData[weekIndex]) {
          weeklyData[weekIndex].value += 1;
        }
      }
    });

    // Return member analytics data
    res.json({
      memberId,
      totalTickets,
      resolvedTickets,
      resolvedPercentage,
      weeklyData,
    });
  } catch (err) {
    console.error("Failed to generate member analytics:", err);
    res.status(500).json({ error: "Failed to generate member analytics" });
  }
});

router.get("/:ticketId/messages", async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ data: ticket.messages || [] });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
