import { useState, useEffect } from "react";
import { PencilIcon, Trash2Icon, PlusCircleIcon } from "lucide-react";
import Sidebar from "./Sidebar";
import { userService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/LoadingSkeleton";
import "./Team.css";
import { toast } from "react-hot-toast";
import { getAvatarUrl } from "../utils/avatarUtils";

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+91",
    password: "",
    role: "member",
  });
  const [error, setError] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const { user } = useAuth();

  // Polling configuration
  const POLLING_INTERVAL = 30000; // 30 seconds
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds

  // Check if the current user is an admin
  const isAdmin = user && user.role === "admin";

  const fetchTeamMembers = async (retryCount = 0) => {
    try {
      setIsPolling(true);
      const response = await userService.getAllMembers();
      console.log("All members from API:", response);

      // Filter members based on user role and relationships
      let filteredMembers = [];
      if (user.role === "admin") {
        // For admin, show only their own details and members they created
        filteredMembers = response.filter(
          (member) => member._id === user._id || member.createdBy === user._id
        );
      } else {
        // For members, show only their own details and their creator admin
        const creatorAdmin = response.find(
          (member) => member._id === user.createdBy
        );
        filteredMembers = [user];
        if (creatorAdmin) {
          filteredMembers.push(creatorAdmin);
        }
      }

      // Sort members with admins always on top
      filteredMembers.sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return 0;
      });

      setTeamMembers(filteredMembers);
      setError("");
    } catch (err) {
      console.error("Failed to fetch team members:", err);
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(
          `Retrying fetch in ${RETRY_DELAY / 1000} seconds... (Attempt ${
            retryCount + 1
          }/${MAX_RETRIES})`
        );
        setTimeout(() => fetchTeamMembers(retryCount + 1), RETRY_DELAY);
      } else {
        setError("Failed to fetch team members. Please try again later.");
      }
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  };

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();

    // Set up polling interval
    const interval = setInterval(() => {
      fetchTeamMembers();
    }, POLLING_INTERVAL);

    // Cleanup interval on component unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const handleOpenModal = (member = null) => {
    setError("");
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.firstName || member.name || "user",
        email: member.email,
        phone: member.phone || "",
        password: "", // Password field will be empty when editing
        role: member.role,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "member",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
  };

  const handleOpenDeleteConfirmation = (member) => {
    setDeletingMember(member);
    setShowDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setDeletingMember(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Simple validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      setError("Please Fill all required Fields");
      return;
    }

    if (!editingMember && !formData.password) {
      setError("Password is required for new team members");
      return;
    }

    try {
      let updatedMember;
      if (editingMember) {
        // Edit existing member
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        };

        // Only include password if it's set
        if (formData.password) {
          updateData.password = formData.password;
        }

        console.log("Updating member with data:", updateData);
        updatedMember = await userService.updateMember(
          editingMember._id,
          updateData
        );
        console.log("Updated member response:", updatedMember);

        // Update the team members list immediately
        setTeamMembers((prevMembers) =>
          prevMembers.map((member) =>
            member._id === editingMember._id ? updatedMember : member
          )
        );
      } else {
        // Add new member
        const newMemberData = {
          name: formData.name || formData.firstName + " " + formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        };
        console.log("Creating new member with data:", newMemberData);
        const newMember = await userService.createMember(newMemberData);
        console.log("New member response:", newMember);

        // Add the new member to the list immediately
        setTeamMembers((prevMembers) => {
          const updatedMembers = [...prevMembers, newMember];
          console.log("Updated team members list:", updatedMembers);
          return updatedMembers;
        });
      }

      setShowModal(false);
      setError("");
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "member",
      });

      // Refresh the data from server after a short delay
      setTimeout(async () => {
        await fetchTeamMembers();
      }, 1000);

      toast.success(
        editingMember
          ? "Team member updated successfully"
          : "Team member added successfully"
      );
    } catch (err) {
      console.error("Failed to save team member:", err);
      setError(
        err.response?.data?.error ||
          "Failed to save team member. Please try again."
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;

    try {
      await userService.deleteMember(deletingMember._id);
      // Update the team members list immediately
      setTeamMembers((prevMembers) =>
        prevMembers.filter((member) => member._id !== deletingMember._id)
      );
      handleCloseDeleteConfirmation();

      // Refresh the data immediately after deleting a member
      fetchTeamMembers();

      toast.success(
        "Member deleted successfully and their tickets reassigned to admin"
      );
    } catch (err) {
      console.error("Failed to delete team member:", err);
      alert("Failed to delete team member. Please try again.");
      handleCloseDeleteConfirmation();
    }
  };

  const renderLoadingSkeleton = () => (
    <div style={{ padding: "0 24px" }}>
      <LoadingSkeleton type="line" count={10} height="60px" />
    </div>
  );

  return (
    <div className="container">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="mainContent">
        <div className="contentWrapper">
          <div className="card">
            <div className="cardHeader">
              <div className="headerContent">
                <h2 className="cardTitle">Team</h2>
                {isPolling && (
                  <div className="pollingStatus">
                    <div className="pollingIndicator" />
                    <span>Updating...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="errorMessage">{error}</div>}

            {/* Team members list */}
            <div style={{ overflowX: "auto" }}>
              {loading ? (
                renderLoadingSkeleton()
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th className="tableHeader">Full Name</th>
                      <th className="tableHeader">Phone</th>
                      <th className="tableHeader">Email</th>
                      <th className="tableHeader">Role</th>
                      {user.role === "admin" && (
                        <th className="tableHeader">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member._id}>
                        <td className="tableCell">
                          <div className="userCell">
                            <div className="avatar">
                              <img
                                src={getAvatarUrl(member._id)}
                                alt="Member avatar"
                                className="avatarImage"
                              />
                            </div>
                            <span>
                              {member.firstName || member.name || "User"}
                            </span>
                          </div>
                        </td>
                        <td className="tableCell">
                          {member.phone || "No phone"}
                        </td>
                        <td className="tableCell">{member.email}</td>
                        <td className="tableCell">
                          <span
                            className={`roleBadge ${
                              member.role === "admin"
                                ? "adminBadge"
                                : "memberBadge"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>
                        {user.role === "admin" && (
                          <td className="tableCell actionCell">
                            {member.role !== "admin" &&
                              member.createdBy === user._id && (
                                <>
                                  <button
                                    onClick={() => handleOpenModal(member)}
                                    className="actionButton"
                                    aria-label="Edit member"
                                  >
                                    <PencilIcon size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleOpenDeleteConfirmation(member)
                                    }
                                    className="actionButton"
                                    aria-label="Delete member"
                                  >
                                    <Trash2Icon size={18} />
                                  </button>
                                </>
                              )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Add team members button - only visible to admins */}
            {isAdmin && (
              <div className="footer">
                <button onClick={() => handleOpenModal()} className="addButton">
                  <PlusCircleIcon size={18} className="addButtonIcon" />
                  Add Team members
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Team Member Modal */}
      {showModal && isAdmin && (
        <div className="modalOverlay">
          <div className="modalContent">
            <div className="modalBody">
              <h3 className="modalTitle">
                {editingMember ? "Edit Team Member" : "Add Team members"}
              </h3>

              <p className="modalDescription">
                {editingMember
                  ? "Edit team member details. Members can log in with their email and password."
                  : "Add team members to collaborate on tickets. Team members can log in with their email and password."}
              </p>

              {error && <div className="errorMessage">{error}</div>}

              <div className="formGroup">
                <label className="formLabel">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="formInput"
                  placeholder="Full Name"
                />
              </div>

              <div className="formGroup">
                <label className="formLabel">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="formInput"
                  placeholder="Email address"
                />
              </div>

              <div className="formGroup">
                <label className="formLabel">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="formInput"
                  placeholder="Phone number (optional)"
                />
              </div>

              <div className="formGroup">
                <label className="formLabel">
                  {editingMember
                    ? "New Password (leave blank to keep current)"
                    : "Password"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="formInput"
                  placeholder={
                    editingMember ? "New password (optional)" : "Password"
                  }
                />
              </div>

              <div className="formGroup">
                <label className="formLabel">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="formSelect"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modalFooter">
                <button onClick={handleCloseModal} className="cancelButton">
                  Cancel
                </button>
                <button onClick={handleSave} className="saveButton">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && deletingMember && (
        <div className="modalOverlay">
          <div className="modalContent deleteConfirmation">
            <div className="modalBody">
              <h3 className="modalTitle">Confirm Delete</h3>

              <p className="modalDescription">this teammate will be deleted.</p>

              <div className="modalFooter">
                <button
                  onClick={handleCloseDeleteConfirmation}
                  className="cancelButton"
                >
                  Cancel
                </button>
                <button onClick={handleDelete} className="confirmButton">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
