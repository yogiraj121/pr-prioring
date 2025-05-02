const express = require("express");
const router = express.Router();
const ChatbotSettings = require("../models/ChatbotSettings");

router.get("/settings", async (req, res) => {
  try {
    const workspace = req.query.workspace || "default";
    console.log(`Fetching settings for workspace: ${workspace}`);

    let settings = await ChatbotSettings.findOne({ workspace });

    if (!settings) {
      console.log(
        `No settings found for workspace ${workspace}, creating default settings`
      );
      settings = new ChatbotSettings({ workspace });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching chatbot settings:", error);
    res.status(500).json({ message: "Error fetching chatbot settings" });
  }
});
router.put("/settings", async (req, res) => {
  try {
    const workspace = req.query.workspace || "default";
    const updates = req.body;
    console.log(`Updating settings for workspace: ${workspace}`, updates);

    const settings = await ChatbotSettings.findOneAndUpdate(
      { workspace },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    console.error("Error updating chatbot settings:", error);
    res.status(500).json({ message: "Error updating chatbot settings" });
  }
});

module.exports = router;
