const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { auth, adminAuth } = require("../middleware/auth");

router.get(
  "/detailed",
  auth,
  adminAuth,
  analyticsController.getDetailedAnalytics
);

module.exports = router;
