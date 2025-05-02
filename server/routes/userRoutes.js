const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const { auth, adminAuth } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", auth, authController.getCurrentUser);
router.put("/me", auth, userController.updateProfile);
router.post("/change-password", auth, authController.changePassword);

router.get("/members", auth, userController.getAllMembers);
router.post("/members", auth, adminAuth, userController.createMember);
router.put("/members/:id", auth, adminAuth, userController.updateMember);
router.delete("/members/:id", auth, adminAuth, userController.deleteMember);

module.exports = router;
