import React, { useContext, useEffect, useState } from "react";
import './ProfileUpdate.css';
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = ({ setProfileComplete }) => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [uid, setUId] = useState("");
    const [prevImage, setPrevImage] = useState("");
    const { setUserData } = useContext(AppContext);

    // Handle profile update
    const profileUpdate = async (event) => {
        event.preventDefault();

        try {
            if (!prevImage && !image) {
                toast.error("Upload Profile Picture");
                return;
            }

            const docRef = doc(db, 'users', uid);

            let imgBase64 = prevImage;

            if (image) {
                const reader = new FileReader();
                reader.onload = async () => {
                    imgBase64 = reader.result;
                    setPrevImage(imgBase64);

                    await updateDoc(docRef, {
                        avatar: imgBase64,
                        bio: bio,
                        name: name,
                    });

                    const snap = await getDoc(docRef);
                    setUserData(snap.data());

                    setProfileComplete(true); // ✅ Mark profile as complete
                    navigate('/chat'); // ✅ Redirect to chat
                };
                reader.readAsDataURL(image);
            } else {
                await updateDoc(docRef, {
                    bio: bio,
                    name: name,
                });

                const snap = await getDoc(docRef);
                setUserData(snap.data());

                setProfileComplete(true); // ✅ Mark profile as complete
                navigate('/chat'); // ✅ Redirect to chat
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUId(user.uid);
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setName(docSnap.data().name || "");
                    setBio(docSnap.data().bio || "");
                    setPrevImage(docSnap.data().avatar || "");
                }
            } else {
                navigate('/');
            }
        });
    }, [navigate]);

    return (
        <div className="profile">
            <div className="profile-container">
                <form onSubmit={profileUpdate}>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <input 
                            onChange={(e) => { setImage(e.target.files[0]); }} 
                            type="file" 
                            id="avatar" 
                            accept=".png, .jpg, .jpeg" 
                            hidden 
                        />
                        <img src={image ? URL.createObjectURL(image) : assets.avatar_icon} alt="Profile Upload" />
                        Upload Profile img
                    </label>
                    <input 
                        onChange={(e) => setName(e.target.value)} 
                        value={name} 
                        type="text" 
                        placeholder="Your name" 
                        required 
                    />
                    <textarea 
                        onChange={(e) => setBio(e.target.value)} 
                        value={bio} 
                        placeholder="Write Profile Bio" 
                        required 
                    />
                    <button type="submit">Save</button>
                </form>
                <img 
                    className="profile-pic" 
                    src={image ? URL.createObjectURL(image) : prevImage || assets.logo_chat} 
                    alt="Profile" 
                />
            </div>
        </div>
    );
};

export default ProfileUpdate;
