
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
connectDB();

const ticketRoutes = require("./routes/ticketRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const authRoutes = require("./routes/authRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");


app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
