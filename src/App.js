import React, { useState, useEffect } from "react";
import { signInWithGoogle, auth } from "./firebase"; // Import Firebase functions
import { onAuthStateChanged, signOut } from "firebase/auth"; 

function App() {
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
  })
  return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to CampusKart</h1>

      {user ? (
        // If user is logged in, show user info
        <div>
          <img src={user.photoURL} alt="Profile" style={{ borderRadius: "50%", width: "100px" }} />
          <h2>{user.displayName}</h2>
          <p>{user.email}</p>
          <button onClick={() => signOut(auth)} style={{ padding: "10px", fontSize: "16px" }}>
            Logout
          </button>
        </div>
      ) : (
        // If no user, show sign-in button
        <button onClick={signInWithGoogle} style={{ padding: "10px", fontSize: "16px" }}>
          Sign in with Google
        </button>
      )}
    </div>
  );
}

export default App;
