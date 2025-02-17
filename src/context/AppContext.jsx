import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  useEffect(() => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem("userData"));
      const storedChatUser = JSON.parse(localStorage.getItem("chatUser"));
      const storedMessagesId = localStorage.getItem("messagesId");

      if (storedUserData) setUserData(storedUserData);
      if (storedChatUser) setChatUser(storedChatUser);
      if (storedMessagesId) setMessagesId(storedMessagesId);
    } catch (error) {
      console.error("Error parsing local storage:", error);
    }
  }, []);

  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        toast.error("User data not found.");
        return;
      }

      const userData = userSnap.data();
      setUserData(userData);
      localStorage.setItem("userData", JSON.stringify(userData));

      navigate(userData.avatar && userData.name ? "/chat" : "/profile");

      await updateDoc(userRef, { lastseen: Date.now() });

      const intervalId = setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, { lastseen: Date.now() });
        }
      }, 60000);

      return () => clearInterval(intervalId);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error loading user data.");
    }
  };

  useEffect(() => {
    if (!userData?.id) return;

    const chatRef = doc(db, "chats", userData.id);
    const unsubscribe = onSnapshot(chatRef, async (res) => {
      try {
        if (!res.exists()) return;

        const chatItems = res.data().chatsData || [];
        const tempData = await Promise.all(
          chatItems.map(async (item) => {
            const userRef = doc(db, "users", item.rId);
            const userSnap = await getDoc(userRef);
            return { ...item, userData: userSnap.exists() ? userSnap.data() : {} };
          })
        );

        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (error) {
        console.error("Error fetching chat data:", error);
        toast.error("Error fetching chat data.");
      }
    });

    return () => unsubscribe();
  }, [userData]);

  const updateStateAndLocalStorage = (key, value, setter) => {
    localStorage.setItem(key, JSON.stringify(value));
    setter(value);
  };

  const contextValue = {
    userData,
    setUserData: (data) => updateStateAndLocalStorage("userData", data, setUserData),
    chatData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId: (id) => updateStateAndLocalStorage("messagesId", id, setMessagesId),
    chatUser,
    setChatUser: (user) => updateStateAndLocalStorage("chatUser", user, setChatUser),
    chatVisible,
    setChatVisible,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
