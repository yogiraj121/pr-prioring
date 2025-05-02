const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ["user", "admin", "member"],
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["resolved", "unresolved"],
    default: "unresolved",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  userInfo: {
    name: String,
    email: String,
    phone: String,
  },
  firstMessage: {
    type: String,
    required: true,
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);
