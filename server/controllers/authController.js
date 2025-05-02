const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = "admin",
      workspace = "default",
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      workspace,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, workspace: newUser.workspace },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    newUser.lastLogin = new Date();
    await newUser.save();

    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "Your account has been deactivated. Please contact admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, workspace: user.workspace },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    user.lastLogin = new Date();
    await user.save();

    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.json({
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ error: "Server error while getting user profile" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Please provide both current and new password" });
    }

    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: "New password must be different from current password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error while changing password" });
  }
};
