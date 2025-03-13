import React, { useState, useEffect } from "react";
import { auth, db, signInWithGoogle } from "./firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [profilePic, setProfilePic] = useState("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                const userRef = doc(db, "users", authUser.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    setUser(userDoc.data());
                    setName(userDoc.data().name);
                    setProfilePic(userDoc.data().profilePic);
                } else {
                    const newUser = {
                        name: authUser.displayName,
                        email: authUser.email,
                        profilePic: authUser.photoURL,
                    };
                    await setDoc(userRef, newUser);
                    setUser(newUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
    };

    const handleEdit = async () => {
        if (!user) return;
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { ...user, name, profilePic }, { merge: true });
        setUser({ ...user, name, profilePic });
        setEditing(false);
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading user data...</h2>;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f4f4f4", padding: "20px" }}>
            <h1 style={{ marginBottom: "20px", fontSize: "32px", fontWeight: "bold", color: "#2c3e50", textTransform: "uppercase", letterSpacing: "2px", textAlign: "center", backgroundColor: "#ecf0f1", padding: "10px 20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>Campus Kart</h1>
            <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center", width: "320px" }}>
                {user ? (
                    <>
                        <div style={{ width: "130px", height: "130px", overflow: "hidden", borderRadius: "50%", margin: "0 auto 10px" }}>
                            <img
                                src={profilePic || user.profilePic}
                                alt="Profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                        {editing ? (
                            <>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePicChange}
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
                                />
                                <button onClick={handleEdit} style={{ width: "100%", padding: "8px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Save</button>
                                <button onClick={() => setEditing(false)} style={{ width: "100%", padding: "8px", backgroundColor: "#ccc", color: "black", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" }}>Back</button>
                            </>
                        ) : (
                            <>
                                <h2>{user.name}</h2>
                                <p>{user.email}</p>
                                <button onClick={() => setEditing(true)} style={{ width: "100%", padding: "8px", backgroundColor: "#ffcc00", color: "black", border: "none", borderRadius: "5px", cursor: "pointer", marginBottom: "10px" }}>Edit Profile</button>
                                <button onClick={handleSignOut} style={{ width: "100%", padding: "8px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Sign Out</button>
                            </>
                        )}
                    </>
                ) : (
                    <button onClick={signInWithGoogle} style={{ width: "100%", padding: "10px", backgroundColor: "#4285F4", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Sign In with Google</button>
                )}
            </div>
        </div>
    );
};

export default App;