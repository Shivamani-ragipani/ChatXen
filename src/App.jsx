import React, { useEffect, useContext, useState } from "react";
import logo from "../public/logo-chat2.svg";
import "./App.css"
import { Route, Routes, useNavigate } from "react-router-dom";
import ProfileUpdate from "./pages/profileUpdate/ProfileUpdate";
import Chat from "./pages/Chat/Chat";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { AppContext } from "./context/AppContext";

const App = () => {
    const navigate = useNavigate();
    const { setUserData } = useContext(AppContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profileComplete, setProfileComplete] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [firstLogin, setFirstLogin] = useState(true); // Track if it's the first login

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsAuthenticated(true);
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUserData(userData);

                    // Check if profile is complete
                    if (!userData.name || !userData.avatar) {
                        setProfileComplete(false);
                        navigate("/profile"); // Force user to complete profile first
                    } else {
                        setProfileComplete(true);
                        if (firstLogin) {
                            navigate("/chat"); // Redirect to chat after profile is set
                            setFirstLogin(false); // Ensure it doesn't redirect every login
                        }
                    }
                }
            } else {
                setIsAuthenticated(false);
                setProfileComplete(false);
                setFirstLogin(true); // Reset on logout
                navigate("/");
            }
            setCheckingAuth(false);
        });

        return () => unsubscribe();
    }, [navigate, setUserData, firstLogin]);

    if (checkingAuth) {
      return (
          <div className="loading-screen">
              <img src={logo} alt="Loading..." className="loading-logo" />
              <p className="loading-text">Loading...</p>
          </div>
      );
  }
   // Prevents flickering during auth check



    return (
        <>
            <ToastContainer />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route 
                    path="/profile" 
                    element={isAuthenticated ? <ProfileUpdate setProfileComplete={setProfileComplete} /> : <Login />} 
                />
                <Route 
                    path="/chat" 
                    element={isAuthenticated ? (profileComplete ? <Chat /> : <ProfileUpdate setProfileComplete={setProfileComplete} />) : <Login />} 
                />
            </Routes>

        </>
    );
};

export default App;
