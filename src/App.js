import React, { useState, useEffect } from "react";
import { auth, db, signInWithGoogle, storage } from "./firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [addingProduct, setAddingProduct] = useState(false);

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

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const storageRef = ref(storage, `profiles/${file.name}`);
            await uploadBytes(storageRef, file);
            const imageUrl = await getDownloadURL(storageRef);
            setProfilePic(imageUrl);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!productName || !price || !image) {
            alert("All fields are required!");
            return;
        }
        setAddingProduct(true);
        try {
            const storageRef = ref(storage, `products/${image.name}`);
            await uploadBytes(storageRef, image);
            const imageUrl = await getDownloadURL(storageRef);
            await addDoc(collection(db, "products"), {
                name: productName,
                price: parseFloat(price),
                imageUrl,
            });
            alert("Product added successfully!");
            setProductName("");
            setPrice("");
            setImage(null);
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Error adding product. Try again.");
        }
        setAddingProduct(false);
    };

    if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading user data...</h2>;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f4f4f4", padding: "20px" }}>
            <h1 style={{ marginBottom: "20px", fontSize: "32px", fontWeight: "bold", color: "#2c3e50", textTransform: "uppercase", letterSpacing: "2px", textAlign: "center", backgroundColor: "#ecf0f1", padding: "10px 20px", borderRadius: "10px" }}>Campus Kart</h1>
            <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center", width: "320px" }}>
                {user ? (
                    <>
                        <img src={profilePic || user.profilePic} alt="Profile" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }} />
                        {editing ? (
                            <>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                                <input type="file" accept="image/*" onChange={handleProfilePicChange} />
                                <button onClick={handleEdit}>Save</button>
                                <button onClick={() => setEditing(false)}>Back</button>
                            </>
                        ) : (
                            <>
                                <h2>{user.name}</h2>
                                <p>{user.email}</p>
                                <button onClick={() => setEditing(true)}>Edit Profile</button>
                                <button onClick={handleSignOut}>Sign Out</button>
                            </>
                        )}
                        <h3>Add a Product</h3>
                        <form onSubmit={handleAddProduct}>
                            <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                            <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
                            <button type="submit" disabled={addingProduct}>{addingProduct ? "Adding..." : "Add Product"}</button>
                        </form>
                    </>
                ) : (
                    <button onClick={signInWithGoogle}>Sign In with Google</button>
                )}
            </div>
        </div>
    );
};

export default App;