import React, { useContext, useEffect, useState } from "react";
import "./LeftSideBar.css";
import assets from "../../assets/assets";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    messagesId,
    setMessagesId,
    setChatUser,
    chatVisible,
    chatUser,
    setChatVisible,
    setChatData,
    setUserData,
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Logout handler
  const handleLogout = async () => {
    // Add logout logic here (e.g., Firebase signOut)
    toast.success("Logged out successfully!");
    setIsModalOpen(false);
    // Redirect to the login page after logout
    navigate("/");
  };

  const inputHandler = async (e) => {
    const input = e.target.value.trim();
    setSearchInput(input);

    if (!input) {
      setShowSearch(false);
      setUser(null);
      return;
    }

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", input.toLowerCase()));
      const querySnap = await getDocs(q);

      if (!querySnap.empty && querySnap.docs[0].data().id !== userData?.id) {
        const queriedUser = querySnap.docs[0].data();
        const userExists = chatData.some((chat) => chat.rId === queriedUser.id);

        setUser(userExists ? null : queriedUser);
        setShowSearch(true);
      } else {
        setUser(null);
        setShowSearch(true);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to fetch user.");
    }
  };

  const addChat = async () => {
    if (!user || !userData) {
      toast.error("Invalid user data!");
      return;
    }

    try {
      const messagesRef = collection(db, "messages");
      const newMessagesRef = doc(messagesRef);

      await setDoc(newMessagesRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const newChatDataForUser = {
        messageId: newMessagesRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
      };

      const newChatDataForRecipient = {
        messageId: newMessagesRef.id,
        lastMessage: "",
        rId: userData.id,
        updatedAt: Date.now(),
        messageSeen: false,
      };

      await Promise.all([ 
        updateDoc(doc(db, "chats", user.id), {
          chatsData: arrayUnion(newChatDataForRecipient),
        }),
        updateDoc(doc(db, "chats", userData.id), {
          chatsData: arrayUnion(newChatDataForUser),
        }),
      ]);

      toast.success("Chat added successfully!");
      setUser(null);
      setShowSearch(false);
      setSearchInput("");

      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();
      setChat({
        messageId: newMessagesRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });
      setShowSearch(false);
      setChatVisible(true);
    } catch (error) {
      console.error("Error adding chat:", error);
      toast.error("Failed to add chat.");
    }
  };

  const setChat = async (item) => {
    setMessagesId(item.messageId);
    setChatUser(item.userData);

    localStorage.setItem("messagesId", item.messageId);
    localStorage.setItem("chatUser", JSON.stringify(item.userData));

    try {
      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapShot = await getDoc(userChatsRef);

      if (userChatsSnapShot.exists()) {
        const userChatsData = userChatsSnapShot.data();
        const chatIndex = userChatsData.chatsData.findIndex(
          (c) => c.messageId === item.messageId
        );

        if (chatIndex !== -1) {
          userChatsData.chatsData[chatIndex].messageSeen = true;

          await updateDoc(userChatsRef, {
            chatsData: userChatsData.chatsData,
          });
        }
      } else {
        console.error("User chats document does not exist.");
      }
      setChatVisible(true);
    } catch (error) {
      console.error("Error updating messageSeen flag:", error);
    }
  };

  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser && chatUser.userData && chatUser.userData.id) {
        try {
          const userRef = doc(db, "users", chatUser.userData.id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setChatUser((prev) => ({ ...prev, userData }));
          }
        } catch (error) {
          console.error("Error fetching chat user data:", error);
        }
      }
    };
  
    updateChatUserData();
  }, [chatData]);
  

  const sortedChats = [...chatData].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleEditProfile = (e) => {
    e.stopPropagation(); // Prevents any event bubbling issues
    navigate('/profile');
  };
  

  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo_chat} className="logo" alt="Logo" />
          <h4>ChatXen</h4>
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu Icon" />
            <div className="sub-menu">
            <p onClick={(e) => handleEditProfile(e)}>Edit Profile</p>
              <hr />
              <p onClick={openModal}>Logout</p>
            </div>
          </div>
        </div>

        <div className="ls-search">
          <img src={assets.search_icon} alt="Search Icon" />
          <input
            value={searchInput}
            onChange={inputHandler}
            type="text"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="ls-list">
        {showSearch && user ? (
          <div className="friends add-user" onClick={addChat}>
            <img src={user.avatar || assets.avatar_icon} alt="User Avatar" />
            <p>{user.name || "Unknown User"}</p>
          </div>
        ) : sortedChats.length > 0 ? (
          sortedChats.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={`friends ${
                item.messageSeen ? "" : "highlight"
              } ${item.messageId === messagesId ? "active-chat" : ""}`}
            >
              <img
                src={item.userData?.avatar || assets.avatar_icon}
                alt="Profile"
              />
              <div>
                <p>{item.userData?.name || "Unknown"}</p>
                <span>{item.lastMessage || "No Messages yet"}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-chats">No chats available. Start a new one!</div>
        )}
      </div>

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

export default LeftSideBar;
