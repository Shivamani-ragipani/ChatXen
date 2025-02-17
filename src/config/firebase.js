
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore';
import { toast } from "react-toastify";


const firebaseConfig = {
  apiKey: "AIzaSyD8Uvf2D0VQWxQPs83ksQh1iwSc-wTORNY",
  authDomain: "nexfinity-chat-app.firebaseapp.com",
  projectId: "nexfinity-chat-app",
  storageBucket: "nexfinity-chat-app.firebasestorage.app",
  messagingSenderId: "206210830600",
  appId: "1:206210830600:web:88b97c913045cc5973dcbd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
    try {
      if (!username || !email || !password) {
        toast.error("All fields are required.");
        return;
      }
  
      const res = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created:", res.user);
      const user = res.user;
  
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        username: username.toLowerCase(),
        email,
        name: "",
        avatar: "",
        bio: "Hey there! I'm using Cha app",
        lastseen: Date.now(),
      });
  
      // Add empty chat document
      await setDoc(doc(db, "chats", user.uid), {
        chatsData: [],
      });
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error(error.code.split('/')[1].split('-').join(" ") || "Failed to create account.");
    }
  };

  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      console.log("User logged in:", res.user);

    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.code.split('/')[1].split('-').join(" ") || "Failed to log in.");
    }
  };

  const logout = async() =>{
    try {
       await signOut(auth);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.code.split('/')[1].split('-').join(" "));
    }
   
  }

  const resetPass = async (email) => {
    if(!email) {
      toast.error("Enter your email");
      return null;
    }
    try {
      const userRef = collection(db,'users');
      const q = query(userRef,where("email","==",email));
      const querySnap = await getDocs(q);
      if(!querySnap.empty){
        await sendPasswordResetEmail(auth,email);
        toast.success("Reset Email Sent");
      }
      else {
        toast.error("Email Doesn't Exists");
      }
    }
    catch(error){
      console.error(error);
      toast.error(error.message);
    }
  }

export { app, signup, login, logout, auth, db, resetPass }
