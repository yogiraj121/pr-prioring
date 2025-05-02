const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Admin = require("../models/Admin");

const handleError = (res, error, message) => {
  console.error(`${message}:`, error);
  res.status(500).json({ message: `Server error while ${message}` });
};

exports.createTicket = async (req, res) => {
  try {
    const { userInfo, firstMessage, workspaceId } = req.body;

    const workspace = await Admin.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const ticket = new Ticket({
      workspace: workspaceId,
      userInfo,
      firstMessage,
      messages: [
        {
          sender: "user",
          message: firstMessage,
        },
      ],
    });

    await ticket.save();

    workspace.tickets.push(ticket._id);
    await workspace.save();

    res.status(201).json(ticket);
  } catch (error) {
    handleError(res, error, "creating ticket");
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { workspace } = req.user;
    const tickets = await Ticket.find({ workspace })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    handleError(res, error, "fetching tickets");
  }
};

exports.getTicket = async (req, res) => {
  try {
    const { workspace } = req.user;
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      workspace,
    }).populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    handleError(res, error, "fetching ticket");
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { workspace } = req.user;
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      workspace,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const { sender, message } = req.body;
    ticket.messages.push({ sender, message });
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    handleError(res, error, "adding message");
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const { workspace } = req.user;
    const { assignedTo } = req.body;

    const member = await User.findOne({
      _id: assignedTo,
      workspace,
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found in workspace" });
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      workspace,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.assignedTo = assignedTo;
    await ticket.save();

    if (!member.assignedTickets.includes(ticket._id)) {
      member.assignedTickets.push(ticket._id);
      await member.save();
    }

    res.json(ticket);
  } catch (error) {
    handleError(res, error, "assigning ticket");
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { workspace } = req.user;
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      workspace,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = req.body.status;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    handleError(res, error, "updating status");
  }
};
