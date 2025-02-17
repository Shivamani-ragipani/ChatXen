import React, { useContext, useEffect, useState } from "react";
import "./RightSideBar.css";
import assets from "../../assets/assets";
import { auth } from "../../config/firebase";
import { toast } from "react-toastify";
import { signOut } from "firebase/auth";
import Modal from "react-modal";
import { AppContext } from "../../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";

Modal.setAppElement("#root");

const RightSideBar = () => {
  const { chatUser, messages, userData } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Open and close modal functions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Extract image URLs from messages
  useEffect(() => {
    const imageMessages = messages
      .filter((msg) => msg.image)
      .map((msg) => ({ url: msg.image, timestamp: msg.timestamp }));
    setMsgImages(imageMessages);
  }, [messages]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      localStorage.clear();
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  // Navigate to profile page
  const handleProfileClick = () => {
    if (location.pathname !== "/profile") {
      navigate("/profile");
    }
  };

  return (
    <div className="rs">
      {/* User Profile Section */}
      <div className="rs-profile">
        <img
          src={userData?.avatar || assets.avatar_icon}
          alt="Profile"
          className="rs-profile-img"
        />
        <h3
          className="rs-profile-name clickable"
          onClick={handleProfileClick}
        >
          {userData?.lastSeen && Date.now() - userData.lastSeen <= 7000 && (
            <img src={assets.green_dot} className="dot" alt="Online" />
          )}
          {userData?.name || "User"}
        </h3>
        <p className="rs-profile-status">
          {userData?.name
            ? `Hey there! I'm ${userData.name} using ChatXen`
            : "Hey there! I'm using ChatXen"}
        </p>
      </div>
      <hr className="divider" />

      {/* Media Section */}
      <div className="rs-media">
        <p className="rs-media-title">Media</p>
        <div className="rs-media-container">
          {msgImages.length > 0 ? (
            msgImages.map((media, index) => (
              <div key={index} className="rs-media-item">
                <img
                  src={media.url}
                  alt={`Media ${index}`}
                  className="rs-media-img"
                  onClick={() => window.open(media.url)}
                />
                {media.timestamp && (
                  <p className="rs-media-timestamp">
                    {new Date(media.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="rs-media-placeholder">No media available</p>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <button onClick={openModal} className="logout-button">
        LogOut
      </button>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Logout"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to log out?</p>
        <div className="modal-buttons">
          <button onClick={handleLogout} className="confirm-button">
            Yes, Logout
          </button>
          <button onClick={closeModal} className="cancel-button">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default RightSideBar;
