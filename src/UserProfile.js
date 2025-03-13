import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Ensure correct Firebase imports
import { doc, getDoc, updateDoc } from "firebase/firestore";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            const userAuth = auth.currentUser;
            if (userAuth) {
                setUser(userAuth);
                setEmail(userAuth.email);
                const userRef = doc(db, "users", userAuth.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setName(userSnap.data().name);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleUpdate = async () => {
        if (!user) return;
        setLoading(true);
        setMessage("");

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { name });
            setMessage("Profile updated successfully!");
        } catch (error) {
            setMessage("Error updating profile. Try again.");
            console.error("Error updating user:", error);
        }

        setLoading(false);
    };

    return (
        <div>
            <h2>User Profile</h2>
            {user ? (
                <div>
                    <img src={user.photoURL} alt="Profile" width="100" />
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input type="email" value={email} disabled />
                    </div>
                    <button onClick={handleUpdate} disabled={loading}>
                        {loading ? "Updating..." : "Save"}
                    </button>
                    {message && <p style={{ color: message.includes("Error") ? "red" : "green" }}>{message}</p>}
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};
export default UserProfile;