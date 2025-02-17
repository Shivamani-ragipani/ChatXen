import React, { useContext, useEffect, useState } from "react";
import "./Chatbox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

const ChatBox = () => {
  const {
    userData,
    messages,
    messagesId,
    setMessages,
    chatUser,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);
  const [input, setInput] = useState("");

  // Load chat messages
  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        const data = res.data();
        if (data && data.messages) {
          setMessages(data.messages.reverse());
        }
      });
      return () => unSub();
    }
  }, [messagesId, setMessages]);

  // Send text message
  const sendMessage = async () => {
    if (!input.trim() || !messagesId) {
      toast.error("Cannot send an empty message.");
      return;
    }

    try {
      const docRef = doc(db, "messages", messagesId);
      const docSnap = await getDoc(docRef);

      const newMessage = {
        sId: userData.id,
        text: input.trim(),
        createdAt: new Date(),
      };

      if (!docSnap.exists()) {
        await setDoc(docRef, { messages: [newMessage] });
      } else {
        await updateDoc(docRef, {
          messages: arrayUnion(newMessage),
        });
      }

      setInput(""); // Clear input field
      updateChatData("text", input.trim());
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send the message.");
    }
  };

  // Send temporary image
  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileUrl = event.target.result; // Temporary URL (Base64 string)

      try {
        if (messagesId) {
          const newMessage = {
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          };

          await updateDoc(doc(db, "messages", messagesId), {
            messages: arrayUnion(newMessage),
          });

          updateChatData("image");
        }
      } catch (error) {
        console.error("Error sending image:", error);
        toast.error("Failed to send the image.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Update chat data for users
  const updateChatData = async (type, content = "") => {
    const userIDs = [chatUser.rId, userData.id];
    for (const id of userIDs) {
      const userChatsRef = doc(db, "chats", id);
      const userChatsSnap = await getDoc(userChatsRef);

      if (userChatsSnap.exists()) {
        const userChatData = userChatsSnap.data();
        const chatIndex = userChatData.chatsData.findIndex(
          (c) => c.messagesId === messagesId
        );
        if (chatIndex !== -1) {
          userChatData.chatsData[chatIndex].lastMessage =
            type === "image" ? "Image" : content.slice(0, 30);
          userChatData.chatsData[chatIndex].updatedAt = Date.now();
          if (userChatData.chatsData[chatIndex].rId === userData.id) {
            userChatData.chatsData[chatIndex].messageSeen = false;
          }
          await updateDoc(userChatsRef, { chatsData: userChatData.chatsData });
        }
      }
    }
  };

  // Format message time
  const formatTime = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "Unknown time";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.avatar} alt="User Avatar" />
        <p>
          {chatUser.name}{" "}
          {chatUser.lastSeen && Date.now() - chatUser.lastSeen <= 7000 && (
            <img src={assets.green_dot} className="dot" alt="Online" />
          )}
        </p>
        <img src={assets.help_icon} className="help" alt="Help" />
        <img
          onClick={() => setChatVisible(false)}
          src={assets.arrow_icon}
          className="arrow"
          alt="Close"
        />
      </div>

      <div className="chat-msg">
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            >
              {msg.image ? (
                <img className="msg-img" src={msg.image} alt="Sent Media" />
              ) : (
                <div className="msg">{msg.text}</div>
              )}
              <div>
                <img
                  src={msg.sId === userData.id ? userData.avatar : chatUser.avatar}
                  alt="User Avatar"
                />
                <p>{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-msg">No messages yet</div>
        )}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Send a message"
        />
        <input
          type="file"
          id="image-upload"
          accept="image/png, image/jpeg"
          hidden
          onChange={sendImage}
        />
        <label htmlFor="image-upload">
          <img src={assets.gallery_icon} alt="Upload Media" />
        </label>
        <img
          src={assets.send_button}
          alt="Send Message"
          onClick={sendMessage}
        />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_chat} alt="Welcome Logo" />
      <p>You can Chat Now!!</p>
    </div>
  );
};

export default ChatBox;
