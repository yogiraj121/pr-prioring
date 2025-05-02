const User = require("../models/User");
const Ticket = require("../models/Ticket");
const bcrypt = require("bcryptjs");

exports.getAllMembers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Failed to get members:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select("-password");
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json(member);
  } catch (err) {
    console.error("Failed to get member:", err);
    res.status(500).json({ error: "Failed to fetch team member" });
  }
};

exports.createMember = async (req, res) => {
  try {
    const { name, email, role = "member", useAdminPassword } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }

    const newUser = new User({
      firstName: name,
      lastName: name,
      email,
      password: admin.password,
      role,
      createdBy: req.user._id,
    });

    await newUser.save();

    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    console.error("Failed to create member:", err);
    res.status(500).json({ error: "Failed to create team member" });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Find the user to be updated
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current user has permission to update this user
    if (userToUpdate.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You don't have permission to update this user" });
    }

    const updateData = {
      firstName: name,
      lastName: name,
      email,
      role,
    };

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("Failed to update member:", err);
    res.status(500).json({ error: "Failed to update team member" });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current user has permission to delete this user
    if (member.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You don't have permission to delete this user" });
    }

    // Find the current user (admin) to reassign tickets
    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res
        .status(500)
        .json({ error: "No admin user found to reassign tickets" });
    }

    // Reassign all tickets from the member to the admin
    await Ticket.updateMany(
      { assignedTo: member._id },
      { assignedTo: admin._id }
    );

    // Delete the member
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message:
        "Team member removed successfully and tickets reassigned to admin",
    });
  } catch (err) {
    console.error("Failed to delete member:", err);
    res.status(500).json({ error: "Failed to delete team member" });
  }
};

exports.getMemberTickets = async (req, res) => {
  try {
    const memberId = req.params.id;
    const tickets = await Ticket.find({ assignedTo: memberId }).sort({
      createdAt: -1,
    });
    res.json(tickets);
  } catch (err) {
    console.error("Failed to fetch member tickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets for this member" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const updateData = { firstName, lastName, email, phone };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Failed to update profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
