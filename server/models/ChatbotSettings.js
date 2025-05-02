const mongoose = require("mongoose");

const operatingHoursSchema = new mongoose.Schema({
  enableHours: {
    type: Boolean,
    default: false,
  },
  timezone: {
    type: String,
    default: "UTC",
  },
  schedule: {
    type: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        isOpen: {
          type: Boolean,
          default: true,
        },
        openTime: String,
        closeTime: String,
      },
    ],
    default: [
      { day: "monday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { day: "friday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { day: "saturday", isOpen: false, openTime: "09:00", closeTime: "17:00" },
      { day: "sunday", isOpen: false, openTime: "09:00", closeTime: "17:00" },
    ],
  },
});

const customResponseSchema = new mongoose.Schema({
  trigger: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
});

const chatbotSettingsSchema = new mongoose.Schema(
  {
    workspace: {
      type: String,
      required: true,
      default: "default",
    },
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
    customMessages: {
      type: [String],
      default: ["How can I help you?", "Ask me anything!"],
    },
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
    isEnabled: {
      type: Boolean,
      default: true,
    },
    autoReply: {
      type: Boolean,
      default: true,
    },
    autoReplyDelay: {
      type: Number,
      default: 1000,
      min: 0,
    },
    customResponses: [customResponseSchema],
    operatingHours: {
      type: operatingHoursSchema,
      default: () => ({}),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

chatbotSettingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("ChatbotSettings", chatbotSettingsSchema);
