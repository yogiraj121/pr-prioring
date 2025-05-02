const mongoose = require("mongoose");

const chatSettingsSchema = new mongoose.Schema(
  {
    headerColor: {
      type: String,
      default: "#33475B",
    },
    backgroundColor: {
      type: String,
      default: "#FFFFFF",
    },
    welcomeMessage: {
      type: String,
      default:
        "👋 Want to chat about Hubly? I'm a chatbot here to help you find your way.",
    },
    customMessages: [
      {
        type: String,
      },
    ],
    introForm: {
      name: {
        type: String,
        default: "Your name",
      },
      phone: {
        type: String,
        default: "+1 (000) 000-0000",
      },
      email: {
        type: String,
        default: "example@gmail.com",
      },
    },
    missedChatTimer: {
      hours: {
        type: String,
        default: "12",
      },
      minutes: {
        type: String,
        default: "00",
      },
      seconds: {
        type: String,
        default: "00",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatSettings", chatSettingsSchema);
